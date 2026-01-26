import { renderHook, waitFor } from "@testing-library/react"
import { useAsyncEffect } from "../use-async-effect"

describe("useAsyncEffect", () => {
    it("should run async function", async () => {
        const fn = jest.fn().mockResolvedValue(undefined)
        renderHook(() => useAsyncEffect(fn, []))

        await waitFor(() => {
            expect(fn).toHaveBeenCalled()
        })
    })

    it("should handle cleanup function", async () => {
        const cleanup = jest.fn()
        const effect = jest.fn().mockResolvedValue(cleanup)

        const { unmount } = renderHook(() => useAsyncEffect(effect, []))

        await waitFor(() => {
            expect(effect).toHaveBeenCalled()
        })

        unmount()

        expect(cleanup).toHaveBeenCalled()
    })

    it("should run cleanup if component unmounted before effect resolves", async () => {
        // This is hard to deterministicly test without controlled promise resolution,
        // but we can ensure "mounted" check triggers cleanup immediately
        let resolve: (value: void | PromiseLike<void>) => void = () => { }
        const promise = new Promise<void>((r) => (resolve = r))
        const cleanup = jest.fn()
        const effect = jest.fn().mockReturnValue(promise.then(() => cleanup))

        const { unmount } = renderHook(() => useAsyncEffect(effect, []))

        unmount()
        resolve()

        // Wait a tick
        await new Promise(r => setTimeout(r, 0))

        expect(cleanup).toHaveBeenCalled()
    })
})
