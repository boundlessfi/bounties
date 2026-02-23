import { GraphQLClient } from "graphql-request";
import { isAuthStatus } from "./errors";
import { toast } from "sonner";
import { getAccessToken } from "../auth-utils";

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

/**
 * Checks if a session exists.
 */
export async function hasAccessToken(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

// Create the generic GraphQLClient instance
const url = process.env.NEXT_PUBLIC_GRAPHQL_URL || "/api/graphql";
export const graphQLClient = new GraphQLClient(url, {
  credentials: "include",
});

// A custom fetcher for @graphql-codegen/typescript-react-query
export const fetcher = <
  TData,
  TVariables extends object = Record<string, unknown>,
>(
  query: string,
  variables?: TVariables,
) => {
  return async (): Promise<TData> => {
    const token = await getAccessToken();
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
      // Global error handling for auth failures
      const gqlError = error as {
        response?: { errors?: Array<{ extensions?: { status?: number } }> };
      };
      if (gqlError?.response?.errors) {
        gqlError.response.errors.forEach((err) => {
          const status = err?.extensions?.status ?? 500;
          if (isAuthStatus(status)) {
            // Let the application handle unauthorized state, potentially redirecting to login
            if (typeof window !== "undefined") {
              toast.error("Your session has expired. Please log in again.");
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
