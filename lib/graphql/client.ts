"use client";

import {
  GraphQLClient,
  type RequestDocument,
  type RequestOptions,
  type Variables,
} from "graphql-request";
import { isAuthStatus } from "./errors";
import { toast } from "sonner";
import { getAccessToken } from "../auth-utils";
import { TypedDocumentString } from "@/lib/graphql/generated";

export type GraphQLRequestDocument =
  | RequestDocument
  | TypedDocumentString<unknown, Record<string, unknown>>;

export type GraphQLRequestHeaders = Parameters<GraphQLClient["setHeaders"]>[0];

// Re-export all error utilities
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

/**
 * Checks if a session exists.
 */
export async function hasAccessToken(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

// Create GraphQL client
const url = process.env.NEXT_PUBLIC_GRAPHQL_URL || "/api/graphql";

export const graphQLClient = new GraphQLClient(url, {
  credentials: "include",
});

/**
 * Normalize any GraphQL document into a valid RequestDocument
 */
function normalizeDocument(query: GraphQLRequestDocument): RequestDocument {
  if (typeof query === "string") return query;

  // TypedDocumentString behaves like string
  return query.toString();
}

/**
 * Custom fetcher for react-query + graphql-request
 */
export const fetcher = <TData, TVariables extends Variables = Variables>(
  query: GraphQLRequestDocument,
  variables?: TVariables,
) => {
  return async (): Promise<TData> => {
    const token = await getAccessToken();

    const headers: GraphQLRequestHeaders = {};
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const requestDocument = normalizeDocument(query);

    try {
      // Build request options and assert to RequestOptions to satisfy
      // graphql-request's complex conditional types
      const requestOptions = {
        document: requestDocument,
        variables: variables ?? ({} as TVariables),
        requestHeaders: headers,
      } as unknown as RequestOptions<TVariables, TData>;

      return await graphQLClient.request<TData, TVariables>(requestOptions);
    } catch (error: unknown) {
      // Global auth error handling
      const gqlError = error as {
        response?: {
          errors?: Array<{ extensions?: { status?: number } }>;
        };
      };

      if (gqlError?.response?.errors) {
        gqlError.response.errors.forEach((err) => {
          const status = err?.extensions?.status ?? 500;

          if (isAuthStatus(status)) {
            if (typeof window !== "undefined") {
              toast.error("Your session has expired. Please log in again.");
              window.dispatchEvent(
                new CustomEvent("auth:unauthorized", {
                  detail: { status },
                }),
              );
            }
          }
        });
      }

      throw error;
    }
  };
};
