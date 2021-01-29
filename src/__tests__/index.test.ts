/* eslint-disable @typescript-eslint/no-explicit-any */
import Pollinator, { Event, Status } from '../'

describe('Pollinator', () => {
  let instance: Pollinator | null
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    instance = null
    jest.clearAllMocks().clearAllTimers()
  })

  it('should throw an error without polling fn (first argument)', () => {
    expect(() => new Pollinator(null as any)).toThrow()
  })

  it('should throw an error if 1st argument is not a function', () => {
    expect(() => new Pollinator('not a function' as any)).toThrow()
  })

  it('is expected to have a status getter', () => {
    const mockPollFn = jest.fn()
    instance = new Pollinator(mockPollFn)
    const spy = jest.spyOn(instance, 'status', 'get')
    instance.status
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('should have status IDLE on new instance', () => {
    const mockPollFn = jest.fn()
    instance = new Pollinator(mockPollFn)
    const spy = jest.spyOn(instance, 'status', 'get')
    const mockStatus = instance.status
    expect(spy).toHaveBeenCalled()
    expect(mockStatus).toBe(Status.IDLE)
    spy.mockRestore()
  })

  it('should have method start', () => {
    const mockPollFn = jest.fn()
    instance = new Pollinator(mockPollFn)
    const spy = jest.spyOn(instance, 'start')
    instance.start()
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('should change status from IDLE to POLLING after calling start', () => {
    const mockPollFn = jest.fn()
    instance = new Pollinator(mockPollFn)
    const spy = jest.spyOn(instance, 'start')
    const statusBefore = instance.status
    instance.start()
    const statusAfter = instance.status
    expect(spy).toHaveBeenCalledTimes(1)
    expect(statusBefore).toBe(Status.IDLE)
    expect(statusAfter).toBe(Status.POLLING)
    spy.mockRestore()
  })

  it('should call pollFn after calling start', () => {
    const mockPollFn = jest.fn()
    instance = new Pollinator(mockPollFn)
    const spy = jest.spyOn(instance, 'start')
    expect(spy).not.toBeCalled()
    expect(mockPollFn).not.toBeCalled()
    instance.start()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(mockPollFn).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('should call pollFn with given params', () => {
    const mockPollFn = jest.fn()
    const mockPollFnParams = 'mocked param'
    instance = new Pollinator(mockPollFn, { pollFnParams: mockPollFnParams })
    instance.start()
    expect(mockPollFn).toHaveBeenCalledWith(mockPollFnParams)
  })

  it('should call pollFn with given params every given delay value', async () => {
    const mockPollFn = jest.fn()
    const mockPollFnParams = 'mocked param'
    const mockConfig = {
      pollFnParams: mockPollFnParams,
      delay: 1000,
    }
    instance = new Pollinator(mockPollFn, mockConfig)
    await instance.start()
    await expect(mockPollFn).toHaveBeenCalledWith(mockPollFnParams)
    for (let i = 0; i < 5; i++) {
      jest.runOnlyPendingTimers()
      await Promise.resolve()
      await Promise.resolve()
    }
    await expect(mockPollFn.mock.calls.length).toBe(6)
    await expect(mockPollFn.mock.calls[5][0]).toBe(mockPollFnParams)
  })

  it('should not run poller again after start if status is POLLING', async () => {
    const mockPollFn = jest.fn()
    const mockConfig = {
      delay: 1000,
    }
    instance = new Pollinator(mockPollFn, mockConfig)
    const spyStart = jest.spyOn(instance, 'start')
    const spyPoller = jest.spyOn(instance as any, '_poller') // a bit hacky i know

    await instance.start()
    await expect(spyStart).toBeCalledTimes(1)
    await expect(spyPoller).toBeCalledTimes(1)
    await expect(instance.status).toBe(Status.POLLING)
    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    expect(instance.status).toBe(Status.POLLING)
    await instance.start()
    await expect(spyStart).toBeCalledTimes(2)
    // spyPoller called 2 times because, 1st time after start and 2nd time after timeout
    await expect(spyPoller).toBeCalledTimes(2)
  })

  it('should have a method stop', () => {
    const mockPollFn = jest.fn()
    instance = new Pollinator(mockPollFn)
    const spy = jest.spyOn(instance, 'stop')
    instance.stop()
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('should stop polling and change status to FINISHED', async () => {
    const mockPollFn = jest.fn()
    const mockConfig = {
      delay: 1000,
    }
    instance = new Pollinator(mockPollFn, mockConfig)
    const spyStop = jest.spyOn(instance, 'stop')
    const spyPoller = jest.spyOn(instance as any, '_poller') // a bit hacky i know

    await instance.start()
    await expect(spyStop).toBeCalledTimes(0)
    await expect(spyPoller).toBeCalledTimes(1)
    await expect(instance.status).toBe(Status.POLLING)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(2)
    await expect(instance.status).toBe(Status.POLLING)
    await instance.stop()
    await expect(spyStop).toBeCalledTimes(1)
    await expect(spyPoller).toBeCalledTimes(2)
    await expect(instance.status).toBe(Status.FINISHED)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(2)
    await expect(instance.status).toBe(Status.FINISHED)
    await expect(spyStop).toBeCalledTimes(1)

    spyStop.mockRestore()
    spyPoller.mockRestore()
  })

  it('should have a method pause', () => {
    const mockPollFn = jest.fn()
    instance = new Pollinator(mockPollFn)
    const spy = jest.spyOn(instance, 'pause')
    instance.pause()
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('should pause polling and set status to IDLE', async () => {
    const mockPollFn = jest.fn()
    const mockConfig = {
      delay: 1000,
    }
    instance = new Pollinator(mockPollFn, mockConfig)
    const spyPause = jest.spyOn(instance, 'pause')
    const spyPoller = jest.spyOn(instance as any, '_poller')

    await instance.start()

    await expect(spyPoller).toBeCalledTimes(1)
    await expect(spyPause).toBeCalledTimes(0)
    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(2)
    await expect(spyPause).toBeCalledTimes(0)
    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(3)
    await expect(spyPause).toBeCalledTimes(0)
    await instance.pause()
    await expect(spyPoller).toBeCalledTimes(3)
    await expect(spyPause).toBeCalledTimes(1)
    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPause).toBeCalledTimes(1)
    await expect(spyPoller).toBeCalledTimes(3)
    await expect(instance.status).toBe(Status.IDLE)

    spyPoller.mockRestore()
    spyPause.mockRestore()
  })

  it('should call conditionFn from config on every poll with pollFn response and previous response', async () => {
    const mockPollFn = jest
      .fn()
      .mockResolvedValue('default')
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')

    expect.assertions(7)
    const mockConditionFn = jest.fn()

    const mockConfig = {
      delay: 1000,
      conditionFn: mockConditionFn,
    }

    instance = new Pollinator(mockPollFn, mockConfig)
    const spyPoller = jest.spyOn(instance as any, '_poller')

    await instance.start()
    await expect(spyPoller).toBeCalledTimes(1)
    await Promise.resolve()
    await expect(mockConditionFn).nthCalledWith(1, 'first', undefined)
    jest.runOnlyPendingTimers()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(2)
    await Promise.resolve()
    await expect(mockConditionFn).nthCalledWith(2, 'second', 'first')
    jest.runOnlyPendingTimers()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(3)
    await Promise.resolve()
    await expect(mockConditionFn).nthCalledWith(3, 'default', 'second')
    instance.stop()
    jest.runOnlyPendingTimers()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(3)

    spyPoller.mockRestore()
  })

  it('should stop polling when conditionFn returns true', async () => {
    const mockPollFn = jest.fn()
    const mockConditionFn = jest
      .fn()
      .mockImplementation(() => true)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false)

    const mockConfig = {
      delay: 2000,
      conditionFn: mockConditionFn,
    }

    instance = new Pollinator(mockPollFn, mockConfig)

    await instance.start()
    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(mockConditionFn).nthReturnedWith(1, false)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(mockConditionFn).nthReturnedWith(2, false)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await expect(mockConditionFn).nthReturnedWith(3, true)

    expect(instance.status).toBe(Status.FINISHED)
  })

  it('should emit Event.STATUS_CHANGE on every change status', async () => {
    const mockPollFn = jest.fn()
    const eventListener = jest.fn()
    instance = new Pollinator(mockPollFn)

    instance.on(Event.STATUS_CHANGE, eventListener)

    await instance.start()
    expect(eventListener).nthCalledWith(1, Status.POLLING)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()

    await instance.pause()
    expect(eventListener).nthCalledWith(2, Status.IDLE)

    await instance.stop()
    expect(eventListener).nthCalledWith(3, Status.FINISHED)
  })

  it('should emit Event.POLL every time poller fires with pollFn last return value and status', async () => {
    const mockPollFn = jest
      .fn()
      .mockResolvedValue('last')
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')

    const eventListener = jest.fn()

    instance = new Pollinator(mockPollFn)
    instance.on(Event.POLL, eventListener)

    await instance.start()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(eventListener).nthCalledWith(1, 'first', Status.POLLING)

    await jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(eventListener).nthCalledWith(2, 'second', Status.POLLING)

    await jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(eventListener).nthCalledWith(3, 'last', Status.POLLING)

    await jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(eventListener).nthCalledWith(3, 'last', Status.POLLING)
  })

  it('should emit Event.END when polling is finished', async () => {
    const mockPollFn = jest.fn().mockResolvedValue('response')
    const eventListener = jest.fn()

    instance = new Pollinator(mockPollFn)
    instance.on(Event.END, eventListener)

    await instance.start()

    for (let i = 0; i < 3; i++) {
      await jest.runOnlyPendingTimers()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    }

    await instance.stop()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(eventListener).nthCalledWith(1, 'response', Status.FINISHED)
  })

  it('should emit Event.ERROR when polling catches error', async () => {
    expect.assertions(2)
    const mockPollFn = jest.fn().mockRejectedValue('error')
    const eventListener = jest.fn().mockImplementation((...params) => {
      expect(params).toEqual(expect.arrayContaining(['error', Status.FINISHED]))
    })
    instance = new Pollinator(mockPollFn, { failRetryCount: 0 })
    instance.on(Event.ERROR, eventListener)

    await instance.start()
    await jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(eventListener).toBeCalledTimes(1)
  })

  it('should retry polling according to failRetryCount value and then stop and emit error', async () => {
    expect.assertions(6)
    const mockPollFn = jest.fn().mockRejectedValue('error')
    const eventListener = jest.fn().mockImplementation((...params) => {
      expect(params).toEqual(expect.arrayContaining(['error', Status.FINISHED]))
    })
    instance = new Pollinator(mockPollFn, { failRetryCount: 2 })
    instance.on(Event.ERROR, eventListener)
    const spyPoller = jest.spyOn(instance as any, '_poller')

    await instance.start()
    await expect(spyPoller).toBeCalledTimes(1)
    await expect(eventListener).toBeCalledTimes(0)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(2)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(3)

    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    await expect(spyPoller).toBeCalledTimes(3)
  })
})
