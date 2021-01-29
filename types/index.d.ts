export declare enum Status {
    IDLE = 0,
    POLLING = 1,
    FINISHED = 2
}
export declare enum Event {
    POLL = "poll",
    END = "end",
    ERROR = "error",
    STATUS_CHANGE = "statusChange"
}
export interface IPollinator {
    start: () => void;
    stop: () => void;
    pause: () => void;
    on: (event: Event, listener: () => unknown) => void;
    off: (event: Event, listener: () => unknown) => void;
    status: Status;
}
export declare type PollinatorConfig = {
    pollFnParams?: unknown;
    conditionFn?: (currentResponse: unknown, previousResponse: unknown) => boolean;
    delay?: number;
    failRetryCount?: number;
};
declare class Pollinator implements IPollinator {
    private pollFn;
    private _status;
    private _config;
    private _timer;
    private previousResponse;
    private _retries;
    private _events;
    constructor(pollFn: (...params: unknown[]) => unknown, config?: PollinatorConfig);
    get status(): Status;
    private emit;
    on(event: Event, listener: () => unknown): void;
    off(event: Event, listener: () => unknown): void;
    private _setStatus;
    private _poller;
    start(): void;
    stop(): void;
    pause(): void;
}
export default Pollinator;
