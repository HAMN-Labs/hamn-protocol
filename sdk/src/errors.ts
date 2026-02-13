// ─── HAMN Protocol SDK — Custom Errors ────────────────────────────

export class HAMNError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'HAMNError';
  }
}

export class MemoryNodeError extends HAMNError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    cause?: unknown,
  ) {
    super(message, cause);
    this.name = 'MemoryNodeError';
  }
}

export class ContractError extends HAMNError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'ContractError';
  }
}
