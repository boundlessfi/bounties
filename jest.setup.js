// Ensure localStorage methods are configurable and writable so tests can spyOn/set mocks
const createLocalStorageMock = () => {
  let store = {}
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => { store[String(key)] = String(value) },
    removeItem: (key) => { delete store[String(key)] },
    clear: () => { store = {} },
  }
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  writable: true,
  value: createLocalStorageMock(),
})
