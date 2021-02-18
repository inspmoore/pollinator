![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/pollinator/0.3.1?style=flat-square)
![GitHub](https://img.shields.io/github/license/inspmoore/pollinator?style=flat-square)
![GitHub Repo stars](https://img.shields.io/github/stars/inspmoore/pollinator?style=flat-square)
![npm](https://img.shields.io/npm/v/pollinator?style=flat-square)
![npm type definitions](https://img.shields.io/npm/types/pollinator?style=flat-square)

![Pollinator](https://github.com/inspmoore/pollinator/raw/master/assets/pollinator_logo@2x.png)

---

🐝 Pollinator is a super lightweight library for lazy people to poll any function
(API gateway anyone?). Supports retries, pausing, cancelling, emits events you
can subscribe to. It has a nice a natural API and Works in Node and browsers.

## Main features

- simple API 🔨
- start, pause and stop at any time 🎮
- add event listeners to receive polling results and polling status changes 🎭
- written in *TypeScript* 👷‍♂️
- cancel polling when certain conditions are met based on current or previous
results 🔚
- supports sync and async functions 🎛
- configurable delay between polling ⏲
- configurable retry attempts in case of error 🔄
- well tested, no unnecessary calls ⛰
- no bs - does only one thing and gets the job done 👍🏻

## Installation

For node just do your:

```shell
yarn add pollinator
#or
npm install pollinator
```

For the browsers add the CDN link:

```html
<!-- either use unpkg.com -->
<script src="https://unpkg.com/pollinator@0.3.1/dist/index.umd.min.js"></script>

<!-- or use JSDelivr -->
<script src="https://cdn.jsdelivr.net/npm/pollinator@0.3.1/dist/index.umd.min.js"></script>
```

## Usage

Here's a minimal example

```javascript
// es6
import Pollinator from 'pollinator'

function pollingFunction() {
  return fetch('http://some-url.com/endpoint')
}

// configure your poller
const poller = new Pollinator(pollingFunction)
// remember to start
poller.start()
```

This will poll `pollingFunction` indefinitely.

To get the return from the polling function you need subscribe to an event.

```javascript
poller.on(Pollinator.Event.POLL, handlePoll)

function handlePoll(response, status) {
  // do something with the response and current polling status
  console.log('The response is:', response)
  console.log('Current polling status is:', status)
}
```

Say you want to stop polling when a specific response comes back from the
polling function.

```javascript
const poller = new Pollinator(
    pollingFunction,
    {
      conditionFn: stopPollingOnCondition
    }
  )

function stopPollingOnCondition(currentResponse, previousResponse) {
  // return true if you wish to stop polling
  if (currentResponse === 'Half a Bee' && previousResponse === 'Eric')
    return true

  // return false if you don't want to stop and keep on polling
  return false
}
```

## Reference

### `Pollinator` constructor params

|Name|Type|Required|Description|Default|
|:----:|:----:|:------:|:------|:------|
|**pollFn**|`function`|`required`|A function you want to poll. Can be sync or async. ||
|**config**|`PollinatorConfig`|`optional`|Optional configuration. Check details below|see `PollinatorConfig` type below|

### `PollinatorConfig` type

|Name|Type|Required|Description|Default|
|:----:|:----:|:------:|:------|:----------|
|**polFnParams**|`unknown`|`optional`|Use this option to pass some parameters to the `pollFn`|`undefined`|
|**conditionFn**|`function`|`optional`|Use this function to stop polling. The function will be called with two parameters of current and previous response from the `pollFn`. Must return a `boolean` where `true` stops polling.<br>`(current: unkown, previous: unkown) => bool`|`() => false`|
|**delay**|`number`|`optional`|A value in milliseconds setting the timeout between consequent `pollFn` calls|`5000`|
|**failRetryCount**|`number`|`optional`|A value that indicates the number of attempts to call `pollFn` after catching an error. Zero means that polling will fail immediately after catching error. Any positive number means that Pollinator will try to poll that many times until it emits the `Event.ERROR`.|`3`|

### `Status` enum

```javascript
{
  IDLE,
  POLLING,
  FINISHED
}
```

### `Event` enum

```javascript
enum Event {
  POLL = 'poll',
  END = 'end',
  ERROR = 'error',
  STATUS_CHANGE = 'statusChange',
}
```

### `Pollinator` instance methods and properties

|Name|Type|Params|Description|
|:----:|:----:|:------:|:------|
|**start**|`method`||Starts polling and changes `status` to `Status.POLLING`|
|**stop**|`method`||Stops polling and changes `status` to `Status.FINISHED`|
|**pause**|`method`||Pauses polling and `status` changes to `Status.IDLE`|
|**on**|`method`|`(event: Event, listener: function) => void`|Registers an event listener for a given `Event` type.|
|**off**|`method`|`(event: Event, listener: function) => void`|Removes an event listener for a given `Event` type.|
|**status**|`property`||Get current status of your poller. Value is of type `Status`|

## Building and contributing

If you want to contribute then please do. PRs are welcome. Before squashing any bug or adding a new feature please create an issue first. Also add a test case(s) before contributing any code.

After cloning the repo do the usual:

```shell
yarn
#or
npm i
```
To run tests use this script:

```shell
yarn test
```

To build run:

```shell
yarn build
```

## To do

- max attempts - stop polling when a max number of attempts is achieved
- current attempts number in the event data
- timeout - configure max amount of time after which polling stops
- total polling time in the event data

## Spread the love (pollen 🌻)

If you like this lib consider hitting that star ⭐️  button.

You can hit me up here

![Twitter Follow](https://img.shields.io/twitter/follow/pirx__?label=Follow&style=social)
