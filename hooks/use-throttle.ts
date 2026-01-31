import * as React from "react"

/**
 * Hook to throttle a value.
 * 
 * @param value The value to throttle.
 * @param limit The throttle limit in milliseconds.
 * @returns The throttled value.
 * 
 * @example
 * const throttledValue = useThrottle(value, 1000);
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = React.useState<T>(value)
    const lastRan = React.useRef<number>(Date.now())


    React.useEffect(() => {
        const now = Date.now()

        if (now - lastRan.current >= limit) {
            setThrottledValue(value)
            lastRan.current = now
            return
        }

        const remaining = Math.max(0, limit - (now - lastRan.current))

        const handler = setTimeout(() => {
            setThrottledValue(value)
            lastRan.current = Date.now()
        }, remaining)

        return () => {
            clearTimeout(handler)
        }
    }, [value, limit])

    return throttledValue
}
