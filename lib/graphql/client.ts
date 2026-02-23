import { GraphQLClient } from "graphql-request";
import { isAuthStatus } from "./errors";

// Re-export all error utilities from errors.ts for convenience
export {
  AppGraphQLError,
  ApiError,
  NetworkError,
  getErrorMessage,
  isAuthError,
  isAuthStatus,
  graphqlErrorResponseSchema,
  type GraphQLErrorResponse,
} from "./errors";

// In-memory token storage (XSS-resistant, lost on page refresh)
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return accessToken;
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  accessToken = token;
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  accessToken = null;
}

export function hasAccessToken(): boolean {
  if (typeof window === "undefined") return false;
  return accessToken !== null;
}

// Create the generic GraphQLClient instance
const url = process.env.NEXT_PUBLIC_GRAPHQL_URL || "/api/graphql";
export const graphQLClient = new GraphQLClient(url);

// A custom fetcher for @graphql-codegen/typescript-react-query
export const fetcher = <
  TData,
  TVariables extends object = Record<string, unknown>,
>(
  query: string,
  variables?: TVariables,
) => {
  return async (): Promise<TData> => {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    try {
      return await (
        graphQLClient.request as unknown as (
          q: string,
          v?: TVariables,
          h?: Record<string, string>,
        ) => Promise<TData>
      )(query, variables, headers);
    } catch (error: unknown) {
      // Global error handling for auth failures (like Apollo ErrorLink)
      const gqlError = error as {
        response?: { errors?: Array<{ extensions?: { status?: number } }> };
      };
      if (gqlError?.response?.errors) {
        gqlError.response.errors.forEach((err) => {
          const status = err?.extensions?.status ?? 500;
          if (isAuthStatus(status)) {
            clearAccessToken();
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("auth:unauthorized", { detail: { status } }),
              );
            }
          }
        });
      }
      throw error;
    }
  };
};
