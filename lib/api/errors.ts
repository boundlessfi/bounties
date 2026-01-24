import { z } from 'zod';

// API Error class for consistent error handling
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }

    static isApiError(error: unknown): error is ApiError {
        return error instanceof ApiError;
    }

    static fromResponse(status: number, data?: { message?: string; code?: string; details?: unknown }): ApiError {
        const message = data?.message || getDefaultErrorMessage(status);
        return new ApiError(message, status, data?.code, data?.details);
    }
}

function getDefaultErrorMessage(status: number): string {
    switch (status) {
        case 400: return 'Invalid request';
        case 401: return 'Authentication required';
        case 403: return 'Access denied';
        case 404: return 'Resource not found';
        case 422: return 'Validation failed';
        case 429: return 'Too many requests';
        case 500: return 'Server error';
        case 502: return 'Service unavailable';
        case 503: return 'Service temporarily unavailable';
        default: return 'An unexpected error occurred';
    }
}

// Network error for connection failures
export class NetworkError extends Error {
    constructor(message = 'Network connection failed') {
        super(message);
        this.name = 'NetworkError';
    }

    static isNetworkError(error: unknown): error is NetworkError {
        return error instanceof NetworkError;
    }
}

// Zod schema for API error response
export const apiErrorResponseSchema = z.object({
    message: z.string().optional(),
    code: z.string().optional(),
    details: z.unknown().optional(),
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
