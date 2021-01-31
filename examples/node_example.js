// run yarn build / npm run build before running this example
const { default: Pollinator, Status, Event } = require('../dist/index')

const cannedResponse = [
  'just started',
  'wait for it',
  'not yet',
  'error',
  'error',
  'almost there!',
  'hold on tight',
  'and',
  'done!',
  'that wont show up',
]

function fakeGateway() {
  return new Promise((res, rej) => {
    const next = cannedResponse.shift()
    // simulating failed network response
    if (next === 'error') {
      console.log('network response error')
      setTimeout(rej, 1000, next)
    } else {
      setTimeout(res, 1000, next)
    }
  })
}

// pass this function to stop polling when certain conditions are met
function conditionFn(current, previous) {
  // return true to stop polling
  if (current === 'done!' && previous === 'and') return true
  // or return false to continue
  return false
}

function pollHandler(res, status) {
  console.log(`on POLL: "${res}" - status: ${Status[status]}`)
}

function statusChangeHandler(status) {
  console.log(`on STATUS_CHANGE: ${Status[status]}`)
}

function errorHandler(res, status) {
  console.log(`on ERROR: "${res}" - status: ${Status[status]}`)
}

function endHandler(res, status) {
  console.log(`on END: "${res}" - status: ${Status[status]}`)
}

// declare new Pollinator
const machine = new Pollinator(fakeGateway, {
  conditionFn: conditionFn,
  delay: 1000,
  failRetryCount: 2, // change this value to less than 2 to see how it fails
})

machine.on(Event.POLL, pollHandler)
machine.on(Event.STATUS_CHANGE, statusChangeHandler)
machine.on(Event.END, endHandler)
machine.on(Event.ERROR, errorHandler)

machine.start()
