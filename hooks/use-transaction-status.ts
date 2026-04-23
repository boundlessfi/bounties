"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { STELLAR_RPC_URL, STELLAR_EXPLORER_URL } from "@/lib/contracts/config";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;
const FINALITY_LEDGERS = 2;

export type TxConfirmationStatus =
  | "idle"
  | "pending"
  | "confirmed"
  | "finalized"
  | "failed"
  | "not_found";

export interface TransactionStatusState {
  hash: string | null;
  status: TxConfirmationStatus;
  ledger?: number;
  errorMessage?: string;
  explorerUrl: string | null;
}

const initialState: TransactionStatusState = {
  hash: null,
  status: "idle",
  explorerUrl: null,
};

export function useTransactionStatus() {
  const [state, setState] = useState<TransactionStatusState>(initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const currentHashRef = useRef<string | null>(null);

  const clearFinalityPolling = useCallback(() => {
    if (finalityTimerRef.current) {
      clearInterval(finalityTimerRef.current);
      finalityTimerRef.current = null;
    }
  }, []);

  const clearPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      clearPolling();
      clearFinalityPolling();
    };
  }, [clearPolling, clearFinalityPolling]);

  const pollTransaction = useCallback(
    async (hash: string) => {
      const server = new rpc.Server(STELLAR_RPC_URL, { allowHttp: false });

      const check = async () => {
        if (currentHashRef.current !== hash) {
          clearPolling();
          return;
        }

        pollCountRef.current += 1;

        try {
          const result = await server.getTransaction(hash);

          if (currentHashRef.current !== hash) return;

          if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
            clearPolling();
            const txLedger = result.ledger;
            setState({
              hash,
              status: "confirmed",
              ledger: txLedger,
              explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
            });

            const finalityServer = new rpc.Server(STELLAR_RPC_URL, {
              allowHttp: false,
            });
            let finalityAttempts = 0;
            const MAX_FINALITY_ATTEMPTS = 20;

            const checkFinality = async () => {
              if (currentHashRef.current !== hash) {
                clearFinalityPolling();
                return;
              }
              finalityAttempts++;
              try {
                const latest = await finalityServer.getLatestLedger();
                if (currentHashRef.current !== hash) {
                  clearFinalityPolling();
                  return;
                }
                if (latest.sequence >= txLedger + FINALITY_LEDGERS) {
                  clearFinalityPolling();
                  setState((prev) =>
                    prev.hash === hash
                      ? { ...prev, status: "finalized" }
                      : prev,
                  );
                  return;
                }
              } catch {
                // transient — keep polling
              }
              if (finalityAttempts >= MAX_FINALITY_ATTEMPTS) {
                clearFinalityPolling();
                setState((prev) =>
                  prev.hash === hash
                    ? { ...prev, errorMessage: "Finality check timed out." }
                    : prev,
                );
              }
            };

            await checkFinality();
            if (currentHashRef.current === hash) {
              finalityTimerRef.current = setInterval(
                checkFinality,
                POLL_INTERVAL_MS,
              );
            }
            return;
          }

          if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
            clearPolling();
            const resultXdr =
              "resultXdr" in result && typeof result.resultXdr === "string"
                ? result.resultXdr
                : undefined;
            setState({
              hash,
              status: "failed",
              errorMessage: resultXdr ?? "Transaction failed on-chain.",
              explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
            });
            return;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.toLowerCase().includes("not found")) {
            if (pollCountRef.current >= MAX_POLLS) {
              clearPolling();
              setState({
                hash,
                status: "not_found",
                errorMessage: "Transaction not found after timeout.",
                explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
              });
            }
            return;
          }
          clearPolling();
          setState({
            hash,
            status: "failed",
            errorMessage: message,
            explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
          });
        }

        if (pollCountRef.current >= MAX_POLLS) {
          clearPolling();
          setState((prev) =>
            prev.hash === hash
              ? {
                  ...prev,
                  status: "not_found",
                  errorMessage: "Confirmation timeout.",
                }
              : prev,
          );
        }
      };

      await check();
      if (currentHashRef.current === hash && timerRef.current === null) {
        timerRef.current = setInterval(check, POLL_INTERVAL_MS);
      }
    },
    [clearPolling, clearFinalityPolling],
  );

  const track = useCallback(
    (hash: string) => {
      clearPolling();
      currentHashRef.current = hash;
      pollCountRef.current = 0;

      setState({
        hash,
        status: "pending",
        explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
      });

      pollTransaction(hash);
    },
    [clearPolling, pollTransaction],
  );

  const reset = useCallback(() => {
    clearPolling();
    clearFinalityPolling();
    currentHashRef.current = null;
    setState(initialState);
  }, [clearPolling, clearFinalityPolling]);

  return { ...state, track, reset };
}
