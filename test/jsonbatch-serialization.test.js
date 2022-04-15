/*
 * Copyright 2018-2022 the original author or authors.
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

const assert = require('assert').strict
const test = require('tap').test

// import some common test data
const {
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonExtensions,
  ceNamespace,
  ceServerUrl,
  ceCommonData
} = require('./common-test-data')

/** create a sample string big (more than 64 KB) */
const ceBigStringLength = 100000
const ceBigString = getRandomString(ceBigStringLength) // a random string with n chars

// sample function to calculate a random string, given the length, to use in tests here
function getRandomString (length) {
  let str = Math.random().toString(36).substring(2)
  while (str.length < length) {
    str += Math.random().toString(36).substring(2)
  }
  return str.substring(0, length)
}

/** @test {CloudEvent} */
test('ensure serialization functions exists (check only the static method here)', (t) => {
  // t.plan(12)

  {
    const { CloudEvent, JSONBatch } = require('../src/') // get references via destructuring
    t.ok(CloudEvent)
    t.ok(JSONBatch)
    // optional, using some standard Node.js assert statements, as a sample
    assert(CloudEvent !== null)
    assert.strictEqual(typeof CloudEvent, 'function')
    assert(new CloudEvent() instanceof CloudEvent)
    assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    assert(JSONBatch !== null)
    assert.strictEqual(typeof JSONBatch, 'function')
    assert.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')
    t.equal(typeof CloudEvent, 'function')
    t.equal(new CloudEvent() instanceof CloudEvent, true)
    t.equal(CloudEvent.mediaType(), 'application/cloudevents+json')
    t.equal(typeof JSONBatch, 'function')
    t.throws(function () {
      const batch = new JSONBatch()
      assert(batch === null) // never executed
    }, Error, 'Expected exception when creating a JSONBatch instance')
    t.equal(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

    const batchSerialize = JSONBatch.serializeEvents
    assert(batchSerialize !== null)
    assert(typeof batchSerialize === 'function')
    t.ok(batchSerialize)
    t.equal(typeof batchSerialize, 'function')

    const batchDeserialize = JSONBatch.deserializeEvents
    assert(batchDeserialize !== null)
    assert(typeof batchDeserialize === 'function')
    t.ok(batchDeserialize)
    t.equal(typeof batchDeserialize, 'function')
  }

  t.end()
})

/** @test {JSONBatch} */
test('ensure serialization functions works good on undefined and null arguments, and even on empty and bad ones', (t) => {
  const { JSONBatch } = require('../src/')
  t.ok(JSONBatch)

  // in following tests to simplify comparison of results, check only the  number of expected errors ...
  {
    // undefined
    const arg = undefined
    t.notOk(arg)
    t.throws(function () {
      const ser = JSONBatch.serializeEvents(arg)
      assert(ser === null) // never executed
    }, Error, 'JSONBatch undefined or null')
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(arg)
      assert(deser === null) // never executed
    }, Error, 'Missing or wrong serialized data ...')
  }
  {
    // null
    const arg = null
    t.notOk(arg)
    t.throws(function () {
      const ser = JSONBatch.serializeEvents(arg)
      assert(ser === null) // never executed
    }, Error, 'JSONBatch undefined or null')
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(arg)
      assert(deser === null) // never executed
    }, Error, 'Missing or wrong serialized data ...')
  }
  {
    // empty array
    const arg = []
    t.strictSame(JSONBatch.serializeEvents(arg), '[]')
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(arg)
      assert(deser === null) // never executed
    }, Error, 'Missing or wrong serialized data ...')
    // deserialize a string containing only an empty array
    const deser = JSONBatch.deserializeEvents(JSON.stringify(arg))
    t.ok(deser && deser.length === 0 && JSONBatch.isJSONBatch(deser))
  }
  {
    // empty array with prettyPrint enabled
    const arg = []
    const ser = JSONBatch.serializeEvents(arg, { prettyPrint: true })
    const expectedSer = '[\n]'
    t.strictSame(ser, expectedSer)
    // deserialize a string containing only an empty array
    const deser = JSONBatch.deserializeEvents(expectedSer)
    t.ok(deser && deser.length === 0 && JSONBatch.isJSONBatch(deser))
  }
  {
    // empty array with bad callback
    const arg = []
    t.throws(function () {
      const ser = JSONBatch.serializeEvents(arg, {}, 'callback(err, data) // but not a function')
      assert(ser !== null) // never executed
    }, Error, 'Wrong callback ...')
    t.pass()
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(JSON.stringify(arg), {}, 'callback(err, data) // but not a function')
      assert(deser !== null) // never executed
    }, Error, 'Wrong callback ...')
    t.pass()
    // deserialize a string containing only an empty array
    let deser = JSONBatch.deserializeEvents(JSON.stringify(arg))
    t.ok(deser && deser.length === 0 && JSONBatch.isJSONBatch(deser))
    t.pass()
    // deserialize a string containing only an empty array and a sample callback
    deser = JSONBatch.deserializeEvents(JSON.stringify(arg), {}, (err, data) => {
      console.log(err, data)  // empty array, so never called
      t.pass()
    })
    t.ok(deser && deser.length === 0 && JSONBatch.isJSONBatch(deser))
    t.pass()
  }
  {
    // empty object (not a CloudEvent/subclass instance)
    const arg = {}
    t.throws(function () {
      const ser = JSONBatch.serializeEvents(arg)
      assert(ser === null) // never executed
    }, TypeError, 'The given batch is not a JSONBatch')
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(arg)
      assert(deser === null) // never executed
    }, Error, 'Missing or wrong serialized data ...')
  }
  {
    // bad object type
    const arg = 'Sample string'
    t.throws(function () {
      const ser = JSONBatch.serializeEvents(arg)
      assert(ser === null) // never executed
    }, TypeError, 'The given batch is not a JSONBatch')
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(arg)
      assert(deser === null) // never executed
    }, TypeError, 'The given string is not an array representation')
  }
  {
    // bad object type
    const arg = 1234567890
    t.throws(function () {
      const ser = JSONBatch.serializeEvents(arg)
      assert(ser === null) // never executed
    }, TypeError, 'The given batch is not a JSONBatch')
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(arg)
      assert(deser === null) // never executed
    }, Error, 'Missing or wrong serialized data ...')
  }
  {
    // bad object type
    const arg = new Date()
    t.throws(function () {
      const ser = JSONBatch.serializeEvents(arg)
      assert(ser === null) // never executed
    }, TypeError, 'The given batch is not a JSONBatch')
    t.throws(function () {
      const deser = JSONBatch.deserializeEvents(arg)
      assert(deser === null) // never executed
    }, Error, 'Missing or wrong serialized data ...')
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure serialization functions works in the right way', (t) => {
  const { CloudEvent, JSONBatch } = require('../src/')
  t.ok(JSONBatch)

  const ceFull = new CloudEvent('1/full',
    ceNamespace,
    ceServerUrl,
    // ceCommonData,
    'sample data', // data as string, to let this ce instance have some strict validation errors
    ceCommonOptions,
    // ceCommonExtensions
    {} // extensions as empty object, to let this ce instance have some strict validation errors
  )
  const ceFullStrict = new CloudEvent('1/full-strict',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptionsStrict,
    ceCommonExtensions
  )
  // test even when a bad (not valid) instance is inside the array
  const ceFullBad = new CloudEvent(null,
    ceNamespace,
    ceServerUrl,
    // ceCommonData, // data
    { random: ceBigString }, // data
    ceCommonOptions,
    ceCommonExtensions
  )
  // define an array containing different CloudEvent instances, and even other objects ...
  const arr = [
    undefined,
    null,
    'string',
    1234567890,
    false,
    true,
    ceFull,
    new Date(),
    {},
    [],
    ceFullStrict,
    null,
    undefined,
    ceFullBad
  ]

  function dumpCallback(err, data) {
    console.log(err, data)
  }

  // in following tests to simplify comparison of results, do only some brief checks ...
  const ser = JSONBatch.serializeEvents(arr, {
    prettyPrint: true,
    logError: true
  }, null) // callback set to null here to avoid a lot of stuff in console
  // console.log(`DEBUG: serialized JSONBatch (prettyPrint enabled) = ${ser}`)
  assert(ser !== null)
  t.ok(ser)

  t.throws(function () {
    const serNoBig = JSONBatch.serializeEvents(arr, {
      // prettyPrint: true,
      logError: true,
      throwError: true,
      // onlyValid: true, // commented otherwise it will be filtered out by getEvents ...
      onlyIfLessThan64KB: true // to force throw here ...
    }, dumpCallback)
    assert(serNoBig === null) // never executed
  }, Error, 'No serialization here due to selected flags (and a big instance) ...')

  const events = JSONBatch.getEvents(arr, {
    onlyValid: true,
    strict: false
  })
  // console.log(`DEBUG: events JSONBatch length = ${events.length}, summary: ${events}`)
  // console.log(`DEBUG: events JSONBatch length = ${events.length}, details: ${JSON.stringify(events)}`)
  assert(events !== null)
  t.ok(events)
  t.strictSame(events.length, 2)

  const deser = JSONBatch.deserializeEvents(ser, {
    logError: true,
    throwError: false,
    onlyValid: true // sample, to filter out not valid serialized instances ...
    // onlyIfLessThan64KB: true // to force throw here ...
  }, dumpCallback)
  // console.log(`DEBUG: deserialized JSONBatch length = ${deser.length}, summary: ${deser}`)
  // console.log(`DEBUG: deserialized JSONBatch length = ${deser.length}, details: ${JSON.stringify(deser)}`)
  assert(deser !== null)
  t.ok(deser)
  t.strictSame(deser.length, 2)

  // ensure events and deser contains similar CloudEvent instances
  t.strictSame(events.length, deser.length)
  events.forEach((e, i) => t.ok(e.id === deser[i].id)) // this count events.length tests ...
  events.forEach((e, i) => t.ok(e.isStrict === deser[i].isStrict)) // this count events.length tests ...

  t.throws(function () {
    const deserNoWrongArray = JSONBatch.deserializeEvents('[,]', {})
    assert(deserNoWrongArray === null) // never executed
  }, Error, 'No deserialization here due to selected flags (and a bad deserialization string) ...')

  const deserNoWrong = JSONBatch.deserializeEvents('["x"]', {})
  assert(deserNoWrong !== null)
  t.ok(deserNoWrong)
  t.strictSame(deserNoWrong.length, 0)

  t.throws(function () {
    const deserNoWrongArrayRaiseError = JSONBatch.deserializeEvents('[,]', {
      logError: true,
      throwError: true
    }, dumpCallback)
    assert(deserNoWrongArrayRaiseError === null) // never executed
  }, Error, 'No deserialization here due to selected flags (and a bad deserialization string) ...')

  const eventsEvenBad = JSONBatch.getEvents(arr, {})
  const serEventsEvenBad = JSONBatch.serializeEvents(eventsEvenBad, {})
  const deserStrict = JSONBatch.deserializeEvents(serEventsEvenBad, {
    onlyValid: true, // sample, to filter out not valid serialized instances ...
    // onlyIfLessThan64KB: true, // to force throw here ...
    strict: true // to force strict validation ...
  })
  assert(deserStrict !== null)
  t.ok(deserStrict)
  t.strictSame(deserStrict.length, 1)

  t.throws(function () {
    const deserStrictRaiseError = JSONBatch.deserializeEvents(serEventsEvenBad, {
      logError: true,
      throwError: true,
      onlyValid: true, // sample, to filter out not valid serialized instances ...
      // onlyIfLessThan64KB: true, // to force throw here ...
      strict: true // to force strict validation ...
    }, dumpCallback)
    assert(deserStrictRaiseError === null) // never executed
  }, Error, 'No deserialization here due to selected flags (and errors in deserialization content) ...')

  t.end()
})
