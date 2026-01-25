'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    onReset?: () => void;
}

class ErrorBoundaryFallback extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Query Error:', error, errorInfo);
        }
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-destructive">
                            Something went wrong
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {this.state.error?.message || 'An unexpected error occurred while fetching data.'}
                        </p>
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

interface QueryErrorBoundaryProps {
    children: ReactNode;
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundaryFallback onReset={reset}>
                    {children}
                </ErrorBoundaryFallback>
            )}
        </QueryErrorResetBoundary>
    );
}
