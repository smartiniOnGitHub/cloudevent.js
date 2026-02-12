/*
 * Copyright 2018-2026 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

const assert = require('node:assert').strict
const test = require('tap').test

// import some common test data
const {
  // valOptionsNoOverride,
  // valOptionsNoStrict,
  valOptionsStrict
} = require('../example/common-example-data')

/** @test {Transformer} */
test('ensure the Transformer class (direct reference to it) works good', (t) => {
  // t.plan(4)

  {
    const T = require('../src/transformer') // direct reference to the library
    t.ok(T)
    t.equal(typeof T, 'function')
    // optional, using some standard Node.js assert statements, as a sample
    assert(T !== null)
    assert.strictEqual(typeof T, 'function')
    // assert(new T() instanceof T) // no more allowed
  }

  {
    const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
    t.ok(V.isFunction(T))
    t.throws(function () {
      const t = new T()
      assert(t === null) // never executed
    }, Error, 'Expected exception when creating a Transformer instance')
  }

  t.end()
})

/** @test {Transformer} */
test('ensure the Transformer class is good and expose some functions to transform timestamps', (t) => {
  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.equal(typeof CloudEvent, 'function')
  t.equal(typeof V.isClass, 'function')
  t.equal(typeof T.dumpObject, 'function')
  t.equal(typeof T.timestampFromString, 'function')
  t.equal(typeof T.timestampToString, 'function')
  t.ok(V.isFunction(CloudEvent))
  t.ok(V.isFunction(V.isClass))
  t.ok(V.isFunction(T.dumpObject))
  t.ok(V.isFunction(T.timestampFromString))
  t.ok(V.isFunction(T.timestampToString))

  t.end()
})

/** create some common options, for better reuse in tests */
const commonEventTime = new Date()
const endOf2018TimestampAsString = '2018-12-31T23:59:59.999Z'
const endOf2018TimestampAsNumber = 1546300799999 // Date.parse(endOf2018TimestampAsString)

/** @test {Transformer} */
test('ensure timestamps are transformed to string in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(T))
  t.ok(endOf2018TimestampAsString)
  t.ok(V.isString(endOf2018TimestampAsString))
  t.ok(V.isStringNotEmpty(endOf2018TimestampAsString))
  t.ok(!V.ensureIsString(endOf2018TimestampAsString, 'endOf2018TimestampAsString')) // no error returned
  t.ok(!V.ensureIsStringNotEmpty(endOf2018TimestampAsString, 'endOf2018TimestampAsString')) // no error returned

  t.throws(function () {
    const timestampAsString = T.timestampToString()
    assert(timestampAsString === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to a string')

  t.throws(function () {
    const timestampAsString = T.timestampToString(undefined)
    assert(timestampAsString === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to a string')

  t.throws(function () {
    const timestampAsString = T.timestampToString(null)
    assert(timestampAsString === null) // never executed
  }, Error, 'Expected exception when transforming an null timestamp to a string')

  t.throws(function () {
    const timestampAsString = T.timestampToString({})
    assert(timestampAsString === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp (Date) to a string')

  t.throws(function () {
    const timestampAsString = T.timestampToString('bad timestamp')
    assert(timestampAsString === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp (Date) to a string')

  t.throws(function () {
    const timestampAsString = T.timestampToString(endOf2018TimestampAsString) // ok but no string accepted here
    assert(timestampAsString === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp (Date) to a string')

  {
    const timestampAsString = T.timestampToString(commonEventTime)
    t.ok(timestampAsString)
    t.ok(V.isString(timestampAsString))
    // console.log(`timestampAsString: '${timestampAsString}'`)
  }

  t.end()
})

/** @test {Transformer} */
test('ensure timestamps are transformed from string in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(T))

  t.throws(function () {
    const timestamp = T.timestampFromString()
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromString(undefined)
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromString(null)
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming an null timestamp string to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromString({})
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp string to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromString('bad timestamp')
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp string to a timestamp (Date)')

  {
    const timestamp = T.timestampFromString(endOf2018TimestampAsString)
    t.ok(timestamp)
    t.ok(V.isDateValid(timestamp))
    t.ok(V.isNumber(timestamp.getTime()))
    // console.log(`timestamp (without timezone offset): '${timestamp}'`)
  }

  {
    const timestamp = T.timestampFromString(endOf2018TimestampAsString, T.timezoneOffsetMsec)
    t.ok(timestamp)
    t.ok(V.isDateValid(timestamp))
    t.ok(V.isNumber(timestamp.getTime()))
    // console.log(`timestamp (with timezone offset): '${timestamp}'`)
  }

  {
    const timestampFuture = new Date(Date.now() + 1000)
    t.ok(timestampFuture)
    t.ok(V.isDateValid(timestampFuture))
    t.ok(V.isNumber(timestampFuture.getTime()))
    t.ok(!V.isDatePast(timestampFuture))
    t.ok(V.isDateFuture(timestampFuture))
    t.ok(V.ensureIsDatePast(timestampFuture, 'timestampFuture')) // expected error returned
    t.ok(!V.ensureIsDateFuture(timestampFuture, 'timestampFuture')) // no error returned
    t.strictSame(V.ensureIsDate(timestampFuture, 'timestampFuture'), undefined) // no error returned
    t.strictSame(V.ensureIsDatePast(timestampFuture, 'timestampFuture') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsDateFuture(timestampFuture, 'timestampFuture'), undefined) // no error returned
  }

  t.throws(function () {
    const timestamp = T.timestampFromString(commonEventTime) // ok but no Date accepted here
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp string to a timestamp (Date)')

  t.end()
})

/** @test {Transformer} */
test('ensure the current timestamp is transformed to string and back as date in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(T))

  const timestampAsString = T.timestampToString(commonEventTime)
  t.ok(timestampAsString)
  t.ok(V.isString(timestampAsString))
  // console.log(`current timestamp as string (UTC): '${timestampAsString}'`)

  {
    const timestampFromString = T.timestampFromString(timestampAsString)
    t.ok(timestampFromString)
    t.ok(V.isDateValid(timestampFromString))
    // console.log(`current timestamp from string (without timezone offset): '${timestampFromString}'`)
    // ensure both timestamps have the same value, but they are different object references
    t.strictSame(timestampFromString.getTime(), commonEventTime.getTime())
    t.not(timestampFromString, commonEventTime)
    t.not(timestampFromString, commonEventTime)
  }

  {
    const timestampFromString = T.timestampFromString(timestampAsString, T.timezoneOffsetMsec)
    t.ok(timestampFromString)
    t.ok(V.isDateValid(timestampFromString))
    // console.log(`current timestamp from string (with timezone offset): '${timestampFromString}'`)
    // ensure both timestamps have the same value, but they are different object references
    t.strictSame(timestampFromString.getTime(), commonEventTime.getTime() + T.timezoneOffsetMsec)
    t.not(timestampFromString, commonEventTime)
    t.not(timestampFromString, commonEventTime)
  }

  t.end()
})

/** @test {Transformer} */
test('ensure timestamps are transformed from number in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.ok(endOf2018TimestampAsNumber)
  t.ok(V.isNumber(endOf2018TimestampAsNumber))
  t.ok(!V.isStringNotEmpty(endOf2018TimestampAsNumber))
  t.ok(!V.ensureIsNumber(endOf2018TimestampAsNumber, 'endOf2018TimestampAsNumber')) // no error returned
  t.ok(V.ensureIsStringNotEmpty(endOf2018TimestampAsNumber, 'endOf2018TimestampAsNumber')) // error returned

  t.throws(function () {
    const timestamp = T.timestampFromNumber()
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromNumber(undefined)
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromNumber(null)
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming an null timestamp number to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromNumber({})
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp number to a timestamp (Date)')

  t.throws(function () {
    const timestamp = T.timestampFromNumber('bad timestamp')
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp number to a timestamp (Date)')

  {
    const timestamp = T.timestampFromNumber(endOf2018TimestampAsNumber)
    t.ok(timestamp)
    t.ok(V.isDateValid(timestamp))
    t.ok(V.isNumber(timestamp.getTime()))
    // console.log(`timestamp (without timezone offset): '${timestamp}'`)
  }

  {
    const timestamp = T.timestampFromNumber(endOf2018TimestampAsNumber, T.timezoneOffsetMsec)
    t.ok(timestamp)
    t.ok(V.isDateValid(timestamp))
    t.ok(V.isNumber(timestamp.getTime()))
    // console.log(`timestamp (with timezone offset): '${timestamp}'`)
  }

  {
    const timestampFuture = new Date(Date.now() + 1000)
    t.ok(timestampFuture)
    t.ok(V.isDateValid(timestampFuture))
    t.ok(V.isNumber(timestampFuture.getTime()))
    t.ok(!V.isDatePast(timestampFuture))
    t.ok(V.isDateFuture(timestampFuture))
    t.ok(V.ensureIsDatePast(timestampFuture, 'timestampFuture')) // expected error returned
    t.ok(!V.ensureIsDateFuture(timestampFuture, 'timestampFuture')) // no error returned
    t.strictSame(V.ensureIsDate(timestampFuture, 'timestampFuture'), undefined) // no error returned
    t.strictSame(V.ensureIsDatePast(timestampFuture, 'timestampFuture') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsDateFuture(timestampFuture, 'timestampFuture'), undefined) // no error returned
  }

  t.throws(function () {
    const timestamp = T.timestampFromNumber(commonEventTime) // ok but no Date accepted here
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp number to a timestamp (Date)')

  t.end()
})

/** @test {Transformer} */
test('ensure the current timestamp is transformed to number and back as date in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(T))

  const nowAsNumber = T.timestampToNumber()
  t.ok(nowAsNumber)
  t.ok(V.isNumber(nowAsNumber))
  // console.log(`current timestamp as number: '${nowAsNumber}'`)

  t.throws(function () {
    const timestamp = T.timestampToNumber('bad timestamp')
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp to a timestamp (Number)')

  t.throws(function () {
    const timestamp = T.timestampToNumber({}) // bad timestamp
    assert(timestamp === null) // never executed
  }, Error, 'Expected exception when transforming not a right timestamp to a timestamp (Number)')

  const timestampAsNumber = T.timestampToNumber(commonEventTime)
  t.ok(timestampAsNumber)
  t.ok(V.isNumber(timestampAsNumber))
  // console.log(`timestamp as number: '${timestampAsNumber}'`)

  {
    const timestampFromNumber = T.timestampFromNumber(timestampAsNumber)
    t.ok(timestampFromNumber)
    t.ok(V.isDateValid(timestampFromNumber))
    // console.log(`timestamp from number (without timezone offset): '${timestampFromNumber}'`)
    // ensure both timestamps have the same value, but they are different object references
    t.strictSame(timestampFromNumber.getTime(), commonEventTime.getTime())
    t.not(timestampFromNumber, commonEventTime)
    t.not(timestampFromNumber, commonEventTime)
  }

  {
    const timestampFromNumber = T.timestampFromNumber(timestampAsNumber, T.timezoneOffsetMsec)
    t.ok(timestampFromNumber)
    t.ok(V.isDateValid(timestampFromNumber))
    // console.log(`timestamp from number (with timezone offset): '${timestampFromNumber}'`)
    // ensure both timestamps have the same value, but they are different object references
    t.strictSame(timestampFromNumber.getTime(), commonEventTime.getTime() + T.timezoneOffsetMsec)
    t.not(timestampFromNumber, commonEventTime)
    t.not(timestampFromNumber, commonEventTime)
  }

  t.end()
})

/** @test {Transformer} */
test('ensure errors are transformed into data attribute in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(T))

  t.throws(function () {
    const data = T.errorToData()
    assert(data === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to object')

  t.throws(function () {
    const data = T.errorToData(undefined)
    assert(data === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to object')

  t.throws(function () {
    const data = T.errorToData(null)
    assert(data === null) // never executed
  }, Error, 'Expected exception when transforming an null error to object')

  t.throws(function () {
    const data = T.errorToData({})
    assert(data === null) // never executed
  }, Error, 'Expected exception when transforming not a right error to object')

  t.throws(function () {
    const data = T.errorToData('error string')
    assert(data === null) // never executed
  }, Error, 'Expected exception when transforming not a right error to object')

  {
    const error = {}
    // console.log(`DEBUG | error details: ${T.dumpObject(error, 'error')}`)
    t.ok(!V.isError(error))
    t.ok(!V.ensureIsObjectOrCollection(error, 'error')) // no error returned
    t.ok(V.ensureIsError(error, 'error')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollection(error, 'error'), undefined) // no error returned
    t.strictSame(V.ensureIsError(error, 'error') instanceof Error, true) // expected error returned
  }

  {
    const error = new Error()
    // console.log(`DEBUG | error details: ${T.dumpObject(error, 'error')}`)
    t.ok(V.isError(error))
    const data = T.errorToData(error)
    // console.log(`DEBUG | data details: ${T.dumpObject(data, 'data')}`)
    t.ok(data)
    t.ok(V.isObject(data))
    t.strictSame(data, { name: 'Error', message: '', stack: null, status: 'error' })
  }

  {
    const error = new TypeError()
    // console.log(`DEBUG | error details: ${T.dumpObject(error, 'error')}`)
    t.ok(V.isError(error))
    const data = T.errorToData(error)
    // console.log(`DEBUG | data details: ${T.dumpObject(data, 'data')}`)
    t.ok(data)
    t.ok(V.isObject(data))
    t.strictSame(data, { name: 'TypeError', message: '', stack: null, status: 'error' })
  }

  {
    const error = new Error('sample error')
    t.ok(V.isError(error))
    error.code = 1000 // add a sample error code, as number
    t.ok(V.isNumber(error.code))
    const data = T.errorToData(error, {
      includeStackTrace: true,
      // addStatus: false,
      addTimestamp: true
    })
    t.ok(data)
    t.ok(V.isObject(data))
    t.ok(data.stack)
    t.ok(V.isString(data.stack))
    data.stack = null // empty the attribute to simplify next comparison
    t.ok(data.timestamp)
    t.ok(V.isNumber(data.timestamp))
    const timestampParsed = new Date(data.timestamp)
    t.ok(V.isDatePast(timestampParsed))
    t.ok(!V.isDateFuture(timestampParsed))
    t.ok(!V.ensureIsDate(timestampParsed, 'timestampParsed')) // no error returned
    t.ok(!V.ensureIsDatePast(timestampParsed, 'timestampParsed')) // no error returned
    t.ok(V.ensureIsDateFuture(timestampParsed, 'timestampParsed')) // expected error returned
    t.strictSame(V.ensureIsDate(timestampParsed, 'timestampParsed'), undefined) // no error returned
    t.strictSame(V.ensureIsDateFuture(timestampParsed, 'timestampParsed') instanceof Error, true) // expected error returned
    delete data.code // delete the attribute to simplify next comparison
    delete data.timestamp // delete the attribute to simplify next comparison
    t.strictSame(data, { name: 'Error', message: 'sample error', stack: null, status: 'error' })
  }

  {
    const error = new TypeError('sample type error')
    t.ok(V.isError(error))
    error.code = '1000' // add a sample error code, as string
    t.ok(V.isString(error.code))
    const data = T.errorToData(error, {
      includeStackTrace: true,
      // addStatus: false,
      addTimestamp: true
    })
    t.ok(data)
    t.ok(V.isObject(data))
    t.ok(data.stack)
    t.ok(V.isString(data.stack))
    data.stack = null // empty the attribute to simplify next comparison
    t.ok(data.timestamp)
    t.ok(V.isNumber(data.timestamp))
    const timestampParsed = new Date(data.timestamp)
    t.ok(V.isDatePast(timestampParsed))
    t.ok(!V.isDateFuture(timestampParsed))
    t.ok(!V.ensureIsDate(timestampParsed, 'timestampParsed')) // no error returned
    t.ok(!V.ensureIsDatePast(timestampParsed, 'timestampParsed')) // no error returned
    t.ok(V.ensureIsDateFuture(timestampParsed, 'timestampParsed')) // expected error returned
    t.strictSame(V.ensureIsDate(timestampParsed, 'timestampParsed'), undefined) // no error returned
    t.strictSame(V.ensureIsDateFuture(timestampParsed, 'timestampParsed') instanceof Error, true) // expected error returned
    delete data.code // delete the attribute to simplify next comparison
    delete data.timestamp // delete the attribute to simplify next comparison
    t.strictSame(data, { name: 'TypeError', message: 'sample type error', stack: null, status: 'error' })
  }

  {
    const error = new TypeError('sample type error')
    t.ok(V.isError(error))
    error.code = '1000' // add a sample error code, as string
    t.ok(V.isString(error.code))
    const data = T.errorToData(error, {
      includeStackTrace: true,
      addStatus: false,
      addTimestamp: false
    })
    t.ok(data)
    t.ok(V.isObject(data))
    t.ok(data.stack)
    t.ok(V.isString(data.stack))
    data.stack = null // empty the attribute to simplify next comparison
    t.ok(!data.status)
    t.ok(!data.timestamp)
    t.strictSame(data, { name: 'TypeError', message: 'sample type error', stack: null, code: '1000' })
  }

  t.end()
})

/** @test {Transformer} */
test('ensure dumpObject works in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(T))

  t.ok(T.dumpObject())
  t.ok(T.dumpObject(null))
  t.ok(T.dumpObject(null, null))
  t.ok(T.dumpObject({}, 'empty_object'))
  t.ok(T.dumpObject({ name: 'Name', age: 20, note: null }, 'object'))
  t.ok(T.dumpObject([1, 2, 3, null], 'array'))
  t.ok(T.dumpObject(new Map([['key-1', 'value 1'], ['key-2', 'value 2']]), 'map'))
  t.ok(T.dumpObject(new Set([['key-1', 'value 1'], ['key-2', 'value 2']]), 'set'))
  t.ok(T.dumpObject('12345 67890 ', 'string'))
  t.ok(T.dumpObject(1234567890, 'number'))
  t.ok(T.dumpObject(true, 'boolean'))

  t.end()
})

/** @test {Transformer} */
test('ensure process info are transformed into data attribute in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.ok(V.isFunction(T.processInfoToData))

  const hostname = require('os').hostname()
  const pid = require('process').pid

  {
    const data = T.processInfoToData()
    // console.log(`DEBUG | data: ${T.dumpObject(data, 'data')}`)
    t.ok(V.isObject(data))
    t.ok(!V.ensureIsObjectOrCollection(data, 'data')) // no error returned
    t.strictSame(V.ensureIsObjectOrCollection(data, 'data'), undefined) // no error returned
    t.ok(data.hostname)
    t.ok(data.pid)
    t.strictSame(data.hostname, hostname)
    t.strictSame(data.pid, pid)
  }

  t.end()
})

/** @test {Transformer} */
test('ensure uri/url are stripped by query arguments in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  // t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.ok(V.isFunction(T.uriStripArguments))

  t.throws(function () {
    const url = T.uriStripArguments()
    assert(url === null) // never executed
  }, Error, 'Expected exception when transforming an undefined reference to a stripped url (string)')
  t.throws(function () {
    const url = T.uriStripArguments(null)
    assert(url === null) // never executed
  }, Error, 'Expected exception when transforming a null reference to a stripped url (string)')

  {
    const url = T.uriStripArguments('')
    t.ok(V.isString(url))
    t.strictSame(url, '')
  }
  {
    const url = T.uriStripArguments('sample string')
    t.ok(V.isString(url))
    t.strictSame(url, 'sample string')
  }
  {
    const url = T.uriStripArguments('http://localhost:3000/path/nested')
    t.ok(V.isString(url))
    t.strictSame(url, 'http://localhost:3000/path/nested')
  }
  {
    const url = T.uriStripArguments('http://localhost:3000/path/nested?param1=value1&param2=&param3=Test')
    t.ok(V.isString(url))
    t.strictSame(url, 'http://localhost:3000/path/nested')
  }
  {
    const url = T.uriStripArguments('/path/nested?param1=value1&param2=&param3=Test')
    t.ok(V.isString(url))
    t.strictSame(url, '/path/nested')
  }

  // the same but woth strict mode enabled
  t.throws(function () {
    const url = T.uriStripArguments('', valOptionsStrict)
    assert(url === null) // never executed
  }, Error, 'Expected exception when transforming a bad URI/URL to a stripped one (string)')
  t.throws(function () {
    const url = T.uriStripArguments('sample string', valOptionsStrict)
    assert(url === null) // never executed
  }, Error, 'Expected exception when transforming a bad URI/URL to a stripped one (string)')
  {
    const url = T.uriStripArguments('http://localhost:3000/path/nested', valOptionsStrict)
    t.ok(V.isString(url))
    t.strictSame(url, 'http://localhost:3000/path/nested')
  }
  {
    const url = T.uriStripArguments('http://localhost:3000/path/nested?param1=value1&param2=&param3=Test', valOptionsStrict)
    t.ok(V.isString(url))
    t.strictSame(url, 'http://localhost:3000/path/nested')
  }
  {
    const url = T.uriStripArguments('/path/nested?param1=value1&param2=&param3=Test', valOptionsStrict)
    t.ok(V.isString(url))
    t.strictSame(url, '/path/nested')
  }

  t.end()
})

/** @test {Transformer} */
test('ensure objects are merged in the right way', (t) => {
  const { CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  t.ok(V.isFunction(T))
  t.ok(V.isFunction(T.mergeObjects))

  t.throws(function () {
    const obj = T.mergeObjects()
    assert(obj === null) // never executed
  }, Error, 'Expected exception when merging an undefined reference to object with another undefined reference')
  t.throws(function () {
    const obj = T.mergeObjects(null)
    assert(obj === null) // never executed
  }, Error, 'Expected exception when merging null reference to object with another undefined reference')

  {
    const base = {}
    const obj = T.mergeObjects(base)
    t.ok(V.isObject(obj))
    t.strictSame(Object.getPrototypeOf(obj), Object.getPrototypeOf(base))
  }
  {
    const base = { bVal: 1, bName: 'Base' }
    const obj = T.mergeObjects(base, { ext1Val: 10, ext1Name: 'Extension1' }, { ext2Val: 20, ext2Name: 'Extension2' })
    // console.log(`DEBUG | merged details: ${T.dumpObject(obj, 'merged')}`)
    t.ok(V.isObject(obj))
    t.strictSame(Object.getPrototypeOf(obj), Object.getPrototypeOf(base))
  }

  t.end()
})

/** @test {Transformer} */
test('ensure strings are encoded/decoded in th right way in base64', (t) => {
  const { CloudEventTransformer: T } = require('../src/')

  t.strictSame(T.stringToBase64(), '')
  t.strictSame(T.stringToBase64(undefined), '')
  t.strictSame(T.stringToBase64(null), '')
  t.strictSame(T.stringToBase64(''), '')
  t.throws(function () {
    const base64 = T.stringToBase64({}) // not a string
    assert(base64 === null) // never executed
  }, Error, 'Expected exception when transforming not a right string to a base64 (String)')
  t.strictSame(T.stringToBase64('Hello World, 2020'), 'SGVsbG8gV29ybGQsIDIwMjA=')

  t.strictSame(T.stringFromBase64(), '')
  t.strictSame(T.stringFromBase64(undefined), '')
  t.strictSame(T.stringFromBase64(null), '')
  t.strictSame(T.stringFromBase64(''), '')
  t.throws(function () {
    const base64 = T.stringFromBase64({}) // not a string
    assert(base64 === null) // never executed
  }, Error, 'Expected exception when transforming not a right string from a base64 (String)')
  t.strictSame(T.stringFromBase64('SGVsbG8gV29ybGQsIDIwMjA='), 'Hello World, 2020')

  t.strictSame(T.stringFromBase64(T.stringToBase64('Hello World, 2020')), 'Hello World, 2020')

  t.end()
})
