import * as React from "react"

/**
 * Hook to persist state in localStorage.
 * 
 * @param key The key to store the value under in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @returns A tuple containing the stored value and a setter function.
 * 
 * @example
 * const [name, setName] = useLocalStorage("name", "John Doe");
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    // State to store our value
    // Pass initial logic to useState to ensure it only runs once
    const [storedValue, setStoredValue] = React.useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue
        }

        try {
            const item = window.localStorage.getItem(key)
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            // If error also return initialValue
            console.warn(`Error reading localStorage key "${key}":`, error)
            return initialValue
        }
    })

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = React.useCallback(
        (value: T | ((val: T) => T)) => {
            // Use functional update to get the latest value
            setStoredValue((currentValue) => {
                const valueToStore =
                    value instanceof Function ? value(currentValue) : value

                // Save to local storage (catch errors here so they don't escape React internals)
                try {
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem(key, JSON.stringify(valueToStore))
                    }
                } catch (error) {
                    console.warn(`Error setting localStorage key "${key}":`, error)
                }

                return valueToStore
            })
        },
        [key]
    )

    return [storedValue, setValue]
}
