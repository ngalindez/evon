/** Shared error types. `lib` is the lowest layer — everything may import from here. */

/** Thrown by stubs whose real implementation is deferred (V2 connectors, etc.). */
export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`${what} is not implemented yet`)
    this.name = 'NotImplementedError'
  }
}
