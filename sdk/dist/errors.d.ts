export declare class HAMNError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export declare class MemoryNodeError extends HAMNError {
    readonly statusCode?: number | undefined;
    constructor(message: string, statusCode?: number | undefined, cause?: unknown);
}
export declare class ContractError extends HAMNError {
    constructor(message: string, cause?: unknown);
}
