enum Status {
  IDLE,
  POLLING,
  FINISHED,
}

enum Event {
  POLL = 'poll',
  END = 'end',
  ERROR = 'error',
  STATUS_CHANGE = 'statusChange',
}

export interface IPollinator {
  start: () => void
  stop: () => void
  pause: () => void
  on: (event: Event, listener: () => unknown) => void
  off: (event: Event, listener: () => unknown) => void
  status: Status
}

export type PollinatorConfig = {
  pollFnParams?: unknown
  conditionFn?: (currentResponse: unknown, previousResponse: unknown) => boolean
  delay?: number
  failRetryCount?: number
}

class Pollinator implements IPollinator {
  private pollFn
  private _status: Status
  private _config: PollinatorConfig
  private _timer: number | undefined
  private previousResponse: unknown | undefined
  private _retries: number
  private _events: Record<string, Array<(data?: unknown) => unknown>>
  static readonly Event = Event
  static readonly Status = Status

  constructor(
    pollFn: (...params: unknown[]) => unknown,
    config?: PollinatorConfig
  ) {
    const defaultConfig = {
      pollFnParams: undefined,
      conditionFn: () => false,
      delay: 5000,
      failRetryCount: 3,
    }

    this._config = { ...defaultConfig, ...config }

    if (!pollFn) throw new Error('1st param pollFn undefined')
    if (typeof pollFn !== 'function')
      throw new Error(
        `1st param is not of function type. Instead found ${typeof pollFn}`
      )

    this.pollFn = pollFn
    this._status = Status.IDLE
    this.previousResponse = undefined
    this._retries = 0
    this._events = {}

    // bindings
    this._poller = this._poller.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.pause = this.pause.bind(this)
    this._setStatus = this._setStatus.bind(this)
    this.emit = this.emit.bind(this)
  }

  get status(): Status {
    return this._status
  }

  private emit(event: Event, ...data: unknown[]): void {
    // emit
    if (!event || !this._events[event]) return

    this._events[event].forEach((f) => f(...data))
  }

  on(event: Event, listener: () => unknown): void {
    if (!event || !listener) return
    if (!this._events[event]) this._events[event] = []
    this._events[event].push(listener)
  }

  off(event: Event, listener: () => unknown): void {
    if (!event || !listener || !this._events[event]) return

    this._events[event].filter((l) => l !== listener)
  }

  private _setStatus(val: Status) {
    if (val === this._status) return
    this._status = val
    this.emit(Event.STATUS_CHANGE, this._status)
  }

  private async _poller() {
    try {
      // console.log('calling pollFn', this.status)
      if (this._status !== Status.POLLING) return
      this._timer && clearTimeout(this._timer)
      let conditionRes

      const res = await this.pollFn(this._config.pollFnParams)

      if (typeof this._config.conditionFn === 'function') {
        conditionRes = await this._config.conditionFn(
          res,
          this.previousResponse
        )
      }

      this.previousResponse = res

      this.emit(Event.POLL, res, this._status)

      if (conditionRes === true) {
        this.stop()
        return
      }

      this._retries = 0
      this._timer = setTimeout(this._poller, this._config.delay)
    } catch (error) {
      this._timer && clearTimeout(this._timer)
      if (
        this._config.failRetryCount &&
        this._config.failRetryCount > 0 &&
        this._retries < this._config.failRetryCount
      ) {
        this._retries++
        this._timer = setTimeout(this._poller, this._config.delay)
        return
      }
      this._setStatus(Status.FINISHED)
      this.emit(Event.ERROR, error, this._status)
    }
  }

  start(): void {
    if (this._status === Status.POLLING) return
    this._retries = 0
    this._setStatus(Status.POLLING)
    this._poller()
  }

  stop(): void {
    if (this._status === Status.FINISHED) return
    // console.log('stop')
    this._setStatus(Status.FINISHED)
    this._timer && clearTimeout(this._timer)
    this._timer = undefined
    this.emit(Event.END, this.previousResponse, this._status)
  }

  pause(): void {
    this._setStatus(Status.IDLE)
    this._timer && clearTimeout(this._timer)
  }
}

export default Pollinator
