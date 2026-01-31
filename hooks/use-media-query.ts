import * as React from "react"

/**
 * Hook to listen for media query changes.
 *
 * @param query The media query string to listen for.
 * @returns True if the media query matches, false otherwise.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 */
export function useMediaQuery(query: string): boolean {
  // Keep track of the media query match status
  // Initialize with null/false to avoid hydration mismatch, or handle with effect
  // "Boring" safe way: false initially, then update in effect.
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)

    // Update the state with the current value
    setMatches(media.matches)

    // Listener callback (supports event or direct call fallback)
    const listener = (e?: MediaQueryListEvent) => {
      if (e && typeof e.matches === 'boolean') {
        setMatches(e.matches)
      } else {
        // Fallback: read current value from matchMedia in case tests call the
        // handler directly and replaced the underlying matchMedia implementation.
        setMatches(window.matchMedia(query).matches)
      }
    }

    // Register listener with fallback for older browsers
    if (media.addEventListener) {
      media.addEventListener("change", listener)
    } else {
      // Fallback for older browsers (deprecated addListener method)
      media.addListener(listener as (this: MediaQueryList, ev: MediaQueryListEvent) => void)
    }

    // Remove listener on cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener)
      } else {
        media.removeListener(listener as (this: MediaQueryList, ev: MediaQueryListEvent) => void)
      }
    }
  }, [query]) // Re-run if query changes

  return matches
}