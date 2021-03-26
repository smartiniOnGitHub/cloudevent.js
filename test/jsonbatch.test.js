/*
 * Copyright 2018-2021 the original author or authors.
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

/** @test {CloudEvent} */
test('ensure CloudEvent and JSONBatch class (and related Validator and Transformer classes) are exported by the library', (t) => {
  t.plan(28)

  const { CloudEvent, JSONBatch, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
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
  t.ok(V)
  t.strictEqual(typeof CloudEvent, 'function')
  t.strictEqual(typeof JSONBatch, 'function')
  t.strictEqual(typeof V, 'function')
  t.strictEqual(typeof T, 'function')
  t.ok(V.isFunction(CloudEvent))
  t.ok(V.isFunction(JSONBatch))
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.strictEqual(typeof CloudEvent, 'function')
  t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
  t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
  t.strictEqual(typeof JSONBatch, 'function')
  t.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

  t.throws(function () {
    const jsonBatch = new JSONBatch()
    assert(jsonBatch === null) // never executed
  }, Error, 'Expected exception when creating a JSONBatch instance')

  {
    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = new CloudEvent('1', // id
      ceNamespace, // type
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal)
    // console.log(`DEBUG - cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

    // check that created instances belongs to the right base class
    t.strictEqual(typeof ceMinimal, 'object')
    t.ok(V.isClass(ceMinimal, CloudEvent))
  }

  {
    // create an instance with only mandatory arguments but null data (and strict mode): expected success ...
    const ceMinimalStrict = new CloudEvent('1-strict', // id
      ceNamespace, // type
      '/', // source
      null, // data // optional, but useful the same in this sample usage
      { strict: true }
    )
    t.ok(ceMinimalStrict)
    t.ok(CloudEvent.isStrictEvent(ceMinimalStrict))
    t.ok(ceMinimalStrict.isStrict)

    // check that created instances belongs to the right base class
    t.strictEqual(typeof ceMinimalStrict, 'object')
    t.ok(V.isClass(ceMinimalStrict, CloudEvent))

    t.strictEqual(typeof ceMinimalStrict.data, 'object') // data is wrapped in an object, so even when null it's an object
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))

    // set ceMinimalStrict.data to null, to ensure validation is good the same
    ceMinimalStrict.data = null
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))
  }
})

/** @test {JSONBatch} */
test('ensure isValid and validate works good on undefined and null arguments, and even on empty and bad ones', (t) => {
  t.plan(23)
  const { JSONBatch } = require('../src/')
  t.ok(JSONBatch)

  // in following tests to simplify comparison of results, check only the  number of expected errors ...
  {
    // undefined
    const arg = undefined
    t.notOk(arg)
    t.notOk(JSONBatch.isValidBatch())
    t.strictSame(JSONBatch.validateBatch(), [new Error('JSONBatch undefined or null')])
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, { strict: true }).length, 1)
  }
  {
    // null
    const arg = null
    t.notOk(arg)
    t.notOk(JSONBatch.isValidBatch(arg))
    t.strictSame(JSONBatch.validateBatch(arg), [new Error('JSONBatch undefined or null')])
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, { strict: true }).length, 1)
  }
  {
    // empty array
    const arg = []
    t.strictSame(JSONBatch.validateBatch(arg), [])
    t.strictSame(JSONBatch.validateBatch(arg).length, 0)
    t.strictSame(JSONBatch.validateBatch(arg, { strict: true }).length, 0)
  }
  {
    // empty object (not a CloudEvent/subclass instance)
    const arg = {}
    t.strictSame(JSONBatch.validateBatch(arg), [new TypeError("The argument 'batch' must be an array or a CloudEvent instance (or a subclass), instead got a 'object'")])
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, { strict: true }).length, 1)
  }
  {
    // bad object type
    const arg = 'Sample string'
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, { strict: true }).length, 1)
  }
  {
    // bad object type
    const arg = 1234567890
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, { strict: true }).length, 1)
  }
  {
    // bad object type
    const arg = new Date()
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, { strict: true }).length, 1)
  }
})

/** @test {JSONBatch} */
test('ensure isValid and validate works good on array and related items', (t) => {
  t.plan(41)
  const { CloudEvent, JSONBatch, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(JSONBatch)
  t.ok(V)

  const empty = []
  t.ok(empty)
  t.ok(JSONBatch.isJSONBatch(empty))
  t.ok(JSONBatch.isValidBatch(empty))
  t.strictSame(JSONBatch.validateBatch(empty, { strict: false }).length, 0)
  t.strictSame(JSONBatch.validateBatch(empty, { strict: true }).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { onlyValid: false, strict: false }).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { onlyValid: true, strict: false }).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { onlyValid: true, strict: true }).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { onlyValid: false, strict: true }).length, 0)

  const ceFull = new CloudEvent('1/full',
    ceNamespace,
    ceServerUrl,
    // ceCommonData,
    'sample data', // data as string, to let this ce instance have some strict validation errors
    ceCommonOptions,
    // ceCommonExtensions
    {} // extensions as empty object, to let this ce instance have some strict validation errors
  )
  t.ok(ceFull)
  t.ok(CloudEvent.isValidEvent(ceFull))
  t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
  t.notOk(CloudEvent.isValidEvent(ceFull, { strict: true })) // expected errors here
  t.strictSame(CloudEvent.validateEvent(ceFull), [])
  t.strictSame(CloudEvent.validateEvent(ceFull).length, 0)
  t.notOk(JSONBatch.isJSONBatch(ceFull))

  const ceFullStrict = new CloudEvent('1/full-strict',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptionsStrict,
    ceCommonExtensions
  )
  t.ok(ceFullStrict)
  t.ok(CloudEvent.isValidEvent(ceFull))
  t.ok(CloudEvent.isValidEvent(ceFullStrict, { strict: false }))
  t.ok(CloudEvent.isValidEvent(ceFullStrict, { strict: true }))
  t.strictSame(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length, 0)
  t.strictSame(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length, 0)
  t.notOk(JSONBatch.isJSONBatch(ceFullStrict))

  // create a sample minimal instance good for normal validation but not for strict validation ...
  const ceMinimalBadSource = new CloudEvent('1', ceNamespace, 'source (bad)', null)
  t.ok(ceMinimalBadSource)

  // create a sample minimal instance ...
  const ceMinimal = new CloudEvent('1', ceNamespace, '/', {})
  t.ok(ceMinimal)

  // define an array containing different CloudEvent instances, and even other objects ...
  const arr = [
    undefined,
    null,
    'string', // bad
    1234567890, // bad
    3.14159, // bad
    false, // bad
    true, // bad
    ceMinimalBadSource, // good but not for strict validation
    ceMinimal,
    ceFull, // good but not for strict validation
    new Date(), // bad
    {}, // bad
    [], // bad
    ceFullStrict,
    // ceErrorStrict,
    // ceFullStrictOtherContentType, // good, but to serialize/deserialize related options must be used
    // ceFullTextData,
    // ceFullStrictBinaryData,
    null,
    undefined
  ]
  t.ok(arr)
  t.strictSame(arr.length, 16)
  t.strictSame(arr.filter((i) => V.isDefinedAndNotNull(i)).length, 12) // number of not null items

  // in following tests to simplify comparison of results, check only the  number of expected errors ...
  t.ok(JSONBatch.isJSONBatch(arr))
  t.notOk(JSONBatch.isValidBatch(arr)) // it has some validation error (on its content)
  t.strictSame(JSONBatch.validateBatch(arr, { strict: false }).length, 8) // expected validation errors
  t.strictSame(JSONBatch.validateBatch(arr, { strict: true }).length, 14) // expected validation errors
  // console.log(`DEBUG - JSONBatch.getEvents, num: ${JSONBatch.getEvents(arr, { onlyValid: false, strict: false }).length}`)
  t.strictSame(JSONBatch.getEvents(arr, { onlyValid: false, strict: false }).length, 4) // no filtering
  t.strictSame(JSONBatch.getEvents(arr, { onlyValid: false, strict: true }).length, 4) // strict true with onlyValid false makes no filtering
  t.strictSame(JSONBatch.getEvents(arr, { onlyValid: true, strict: false }).length, 4) // only valid
  t.strictSame(JSONBatch.getEvents(arr, { onlyValid: true, strict: true }).length, 2) // only valid in strict mode

  // additional test, ensure that all instances returned (only valid), are CloudEvent instances
  const eventsGot = JSONBatch.getEvents(arr, { onlyValid: true, strict: false })
  t.ok(eventsGot.every((i) => CloudEvent.isCloudEvent(i)))
  // test with other instances returned (filtered in a different way)
  t.ok(JSONBatch.getEvents(arr, { onlyValid: false, strict: false }).every((i) => CloudEvent.isCloudEvent(i)))
})

/** @test {JSONBatch} */
test('ensure isValid and validate works good on plain object and even CloudEvent instance and CloudEvent subclasses and not', (t) => {
  t.plan(33)
  const { CloudEvent, JSONBatch, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(JSONBatch)

  class NotCESubclass {
  }
  class CESubclass extends CloudEvent {
  }

  const ceFull = new CloudEvent('1/full',
    ceNamespace,
    ceServerUrl,
    // ceCommonData,
    'sample data', // data as string, to let this ce instance have some strict validation errors
    ceCommonOptions,
    // ceCommonExtensions
    {} // extensions as empty object, to let this ce instance have some strict validation errors
  )
  t.ok(ceFull)
  // check that created instances belongs to the right base class
  t.ok(V.isClass(ceFull, CloudEvent))
  t.ok(!V.isClass(ceFull, NotCESubclass))
  t.ok(!V.isClass(ceFull, CESubclass))
  t.ok(!V.ensureIsClass(ceFull, CloudEvent, 'ceFull')) // no error returned
  t.ok(V.ensureIsClass(ceFull, CESubclass, 'ceFull')) // expected error returned
  t.ok(V.isClass(V.ensureIsClass(ceFull, CESubclass, 'ceFull'), TypeError)) // expected error returned
  t.ok(V.isClass(V.ensureIsClass(ceFull, NotCESubclass, 'ceFull'), TypeError)) // expected error returned
  // in following tests to simplify comparison of results, check only the  number of expected errors ...
  t.strictSame(JSONBatch.validateBatch(ceFull).length, 0)
  t.strictSame(JSONBatch.validateBatch(ceFull, { strict: true }).length, 2)
  t.notOk(JSONBatch.isJSONBatch(ceFull))

  const ceFullSubclass = new CESubclass('1/full/subclass',
    ceNamespace,
    ceServerUrl,
    // ceCommonData,
    'sample data', // data as string, to let this ce instance have some strict validation errors
    ceCommonOptions,
    // ceCommonExtensions
    {} // extensions as empty object, to let this ce instance have some strict validation errors
  )
  t.ok(ceFullSubclass)
  // check that created instances belongs to the right base class
  t.ok(V.isClass(ceFullSubclass, CloudEvent))
  t.ok(!V.isClass(ceFullSubclass, NotCESubclass))
  t.ok(V.isClass(ceFullSubclass, CESubclass))
  t.ok(!V.ensureIsClass(ceFullSubclass, CloudEvent, 'ceFullSubclass')) // no error returned
  t.ok(!V.ensureIsClass(ceFullSubclass, CESubclass, 'ceFullSubclass')) // no error returned
  t.ok(!V.isClass(V.ensureIsClass(ceFullSubclass, CESubclass, 'ceFullSubclass'), TypeError)) // no error returned
  t.ok(V.isClass(V.ensureIsClass(ceFullSubclass, NotCESubclass, 'ceFullSubclass'), TypeError)) // expected error returned
  // in following tests to simplify comparison of results, check only the  number of expected errors ...
  t.strictSame(JSONBatch.validateBatch(ceFullSubclass).length, 0)
  t.strictSame(JSONBatch.validateBatch(ceFullSubclass, { strict: true }).length, 2)
  t.notOk(JSONBatch.isJSONBatch(ceFullSubclass))

  // try even with a plain object
  const plainObject = { id: '1/plainObject', data: 'sample data' }
  t.strictSame(JSONBatch.validateBatch(plainObject).length, 1)
  t.strictSame(JSONBatch.validateBatch(plainObject, { strict: true }).length, 1)
  t.notOk(JSONBatch.isJSONBatch(plainObject))
  t.throws(function () {
    const ce = [] // CloudEvent instances
    // get values from the generator function
    for (const event of JSONBatch.getEvent(plainObject, { })) {
      assert(event === null) // never executed
      ce.push(event) // never executed
    }
    assert(ce.length === 0) // never executed
  }, Error, 'Expected exception when trying to get an event from a bad JSONBatch')
  t.throws(function () {
    const eventsGot = JSONBatch.getEvents(plainObject)
    assert(eventsGot === null) // never executed
  }, Error, 'Expected exception when trying to get events from a bad JSONBatch')

  // try with some references
  t.throws(function () {
    JSONBatch.isJSONBatch(undefined)
    assert(true) // never executed
  }, Error, 'Expected exception when checking for a JSONBatch with bad data')
  t.throws(function () {
    JSONBatch.isJSONBatch(null)
    assert(true) // never executed
  }, Error, 'Expected exception when checking for a JSONBatch with bad data')
  t.notOk(JSONBatch.isJSONBatch({}))
  t.ok(JSONBatch.isJSONBatch([]))
})
