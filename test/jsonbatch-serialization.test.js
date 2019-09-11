/*
 * Copyright 2018 the original author or authors.
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

/** @test {CloudEvent} */
test('ensure serialization functions exists (check only the static method here)', (t) => {
  t.plan(12)

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
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
    t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    t.strictEqual(typeof JSONBatch, 'function')
    t.throws(function () {
      const batch = new JSONBatch()
      assert(batch === null) // never executed
    }, Error, 'Expected exception when creating a JSONBatch instance')
    t.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

    const batchSerialize = JSONBatch.serializeEvents
    assert(batchSerialize !== null)
    assert(typeof batchSerialize === 'function')
    t.ok(batchSerialize)
    t.strictEqual(typeof batchSerialize, 'function')

    const batchDeserialize = JSONBatch.deserializeEvents
    assert(batchDeserialize !== null)
    assert(typeof batchDeserialize === 'function')
    t.ok(batchDeserialize)
    t.strictEqual(typeof batchDeserialize, 'function')
  }
})

/** @test {JSONBatch} */
test('ensure serialization functions works good on undefined and null arguments, and even on empty and bad ones', (t) => {
  t.plan(17)
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
  }
  {
    // empty array with prettyPrint enabled
    const arg = []
    t.strictSame(JSONBatch.serializeEvents(arg, { prettyPrint: true }), '[\n]')
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
    // TODO: add test for deserialization; then even for empty string ... wip
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
})

/** @test {CloudEvent} */
test('ensure serialization functions works in the right way', (t) => {
  t.plan(0)

  // TODO: in progress ... wip
})
