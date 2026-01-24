import { z } from 'zod';

// Generic paginated response
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        data: z.array(itemSchema),
        pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
        }),
    });

export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

// Generic API response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        data: dataSchema,
    });

export type ApiResponse<T> = {
    success: boolean;
    data: T;
};

// Common query params
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
