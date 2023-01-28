/*
 * Copyright 2018-2023 the original author or authors.
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

// get factory for instances to test
const ceFactory = require('../example/common-example-factory')

// import some common test data
// const ed = require('../example/common-example-data')
const {
  ceCommonOptions,
  ceNamespace,
  // ceOptionsNoStrict,
  // ceOptionsStrict,
  ceServerUrl,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
} = require('../example/common-example-data')

/** @test {CloudEvent} */
test('ensure CloudEvent and JSONBatch class (and related Validator and Transformer classes) are exported by the library', (t) => {
  // t.plan(28)

  const { CloudEvent, JSONBatch, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)
  t.ok(JSONBatch)
  // optional, using some standard Node.js assert statements, as a sample
  assert(CloudEvent !== null)
  assert.strictEqual(typeof CloudEvent, 'function')
  assert(ceFactory.createEmpty() instanceof CloudEvent)
  assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
  assert(JSONBatch !== null)
  assert.strictEqual(typeof JSONBatch, 'function')
  assert.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')
  t.ok(V)
  t.equal(typeof CloudEvent, 'function')
  t.equal(typeof JSONBatch, 'function')
  t.equal(typeof V, 'function')
  t.equal(typeof T, 'function')
  t.ok(V.isFunction(CloudEvent))
  t.ok(V.isFunction(JSONBatch))
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.equal(typeof CloudEvent, 'function')
  t.equal(ceFactory.createEmpty() instanceof CloudEvent, true)
  t.equal(CloudEvent.mediaType(), 'application/cloudevents+json')
  t.equal(typeof JSONBatch, 'function')
  t.equal(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

  t.throws(function () {
    const jsonBatch = new JSONBatch()
    assert(jsonBatch === null) // never executed
  }, Error, 'Expected exception when creating a JSONBatch instance')

  {
    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = ceFactory.createMinimal()
    t.ok(ceMinimal)
    // console.log(`DEBUG | cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

    // check that created instances belongs to the right base class
    t.equal(typeof ceMinimal, 'object')
    t.ok(V.isClass(ceMinimal, CloudEvent))
  }

  {
    // create an instance with only mandatory arguments but null data (and strict mode): expected success ...
    const ceMinimalStrict = ceFactory.createMinimalStrict()
    t.ok(ceMinimalStrict)
    t.ok(CloudEvent.isStrictEvent(ceMinimalStrict))
    t.ok(ceMinimalStrict.isStrict)

    // check that created instances belongs to the right base class
    t.equal(typeof ceMinimalStrict, 'object')
    t.ok(V.isClass(ceMinimalStrict, CloudEvent))

    t.equal(typeof ceMinimalStrict.data, 'object') // data is wrapped in an object, so even when null it's an object
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))

    // set ceMinimalStrict.data to null, to ensure validation is good the same
    ceMinimalStrict.data = null
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))
  }

  t.end()
})

/** @test {JSONBatch} */
test('ensure isValid and validate works good on undefined and null arguments, and even on empty and bad ones', (t) => {
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
    t.strictSame(JSONBatch.validateBatch(arg, valOptionsStrict).length, 1)
  }
  {
    // null
    const arg = null
    t.notOk(arg)
    t.notOk(JSONBatch.isValidBatch(arg))
    t.strictSame(JSONBatch.validateBatch(arg), [new Error('JSONBatch undefined or null')])
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, valOptionsStrict).length, 1)
  }
  {
    // empty array
    const arg = []
    t.strictSame(JSONBatch.validateBatch(arg), [])
    t.strictSame(JSONBatch.validateBatch(arg).length, 0)
    t.strictSame(JSONBatch.validateBatch(arg, valOptionsStrict).length, 0)
  }
  {
    // empty object (not a CloudEvent/subclass instance)
    const arg = {}
    t.strictSame(JSONBatch.validateBatch(arg), [new TypeError("The argument 'batch' must be an array or a CloudEvent instance (or a subclass), instead got a 'object'")])
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, valOptionsStrict).length, 1)
  }
  {
    // bad object type
    const arg = 'Sample string'
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, valOptionsStrict).length, 1)
  }
  {
    // bad object type
    const arg = 1234567890
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, valOptionsStrict).length, 1)
  }
  {
    // bad object type
    const arg = new Date()
    t.strictSame(JSONBatch.validateBatch(arg).length, 1)
    t.strictSame(JSONBatch.validateBatch(arg, valOptionsStrict).length, 1)
  }

  t.end()
})

function createFullTextDataBad () {
  const { CloudEvent } = require('../src/')

  return new CloudEvent('1/full',
    ceNamespace,
    ceServerUrl,
    // ceCommonData,
    'sample data', // data as string, to let this ce instance have some strict validation errors
    ceCommonOptions,
    // ceCommonExtensions
    {} // extensions as empty object, to let this ce instance have some strict validation errors
  )
}

/** @test {JSONBatch} */
test('ensure isValid and validate works good on array and related items', (t) => {
  const { CloudEvent, JSONBatch, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(JSONBatch)
  t.ok(V)

  const empty = []
  t.ok(empty)
  t.ok(JSONBatch.isJSONBatch(empty))
  t.ok(JSONBatch.isValidBatch(empty))
  t.strictSame(JSONBatch.validateBatch(empty, valOptionsNoStrict).length, 0)
  t.strictSame(JSONBatch.validateBatch(empty, valOptionsStrict).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { ...valOnlyValidAllInstance, ...valOptionsNoStrict }).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { ...valOnlyValidInstance, ...valOptionsNoStrict }).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { ...valOnlyValidInstance, ...valOptionsStrict }).length, 0)
  t.strictSame(JSONBatch.getEvents(empty, { ...valOnlyValidAllInstance, ...valOptionsStrict }).length, 0)

  // create a bad (valid but not in strict mode) instance
  const ceFullTextDataBad = createFullTextDataBad()
  t.ok(ceFullTextDataBad)
  t.ok(!ceFullTextDataBad.isStrict)
  t.ok(ceFullTextDataBad.isValid())
  t.notOk(ceFullTextDataBad.isValid({ ...valOptionsStrict }))
  t.ok(CloudEvent.isValidEvent(ceFullTextDataBad))
  t.ok(CloudEvent.isValidEvent(ceFullTextDataBad, valOptionsNoStrict))
  t.notOk(CloudEvent.isValidEvent(ceFullTextDataBad, valOptionsStrict)) // expected errors here
  t.strictSame(CloudEvent.validateEvent(ceFullTextDataBad), [])
  t.strictSame(CloudEvent.validateEvent(ceFullTextDataBad).length, 0)
  t.notOk(JSONBatch.isJSONBatch(ceFullTextDataBad))

  // create a good and strict (valid even in strict mode) instance
  const ceFullStrict = ceFactory.createFullStrict()
  t.ok(ceFullStrict)
  t.ok(ceFullStrict.isStrict)
  t.ok(ceFullStrict.isValid())
  t.ok(CloudEvent.isValidEvent(ceFullStrict, valOptionsNoOverride))
  t.ok(CloudEvent.isValidEvent(ceFullStrict, valOptionsNoStrict))
  t.ok(CloudEvent.isValidEvent(ceFullStrict, valOptionsStrict))
  t.strictSame(CloudEvent.validateEvent(ceFullStrict, valOptionsNoStrict).length, 0)
  t.strictSame(CloudEvent.validateEvent(ceFullStrict, valOptionsStrict).length, 0)
  t.notOk(JSONBatch.isJSONBatch(ceFullStrict))

  // create a sample minimal instance good for normal validation but not for strict validation ...
  const ceMinimalBadSource = ceFactory.createMinimal() // create it as a good instance
  ceMinimalBadSource.source = 'source (bad)' // change its attribute to fail strict validation
  t.ok(ceMinimalBadSource)
  t.ok(ceMinimalBadSource.isValid())
  t.notOk(ceMinimalBadSource.isValid({ ...valOptionsStrict }))

  // create a sample minimal instance ...
  const ceMinimal = ceFactory.createMinimal()
  t.ok(ceMinimal)
  t.ok(ceMinimal.isValid())
  t.ok(ceMinimal.isValid({ ...valOptionsStrict }))

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
    ceFullTextDataBad, // good but not for strict validation
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
  t.strictSame(JSONBatch.validateBatch(arr, valOptionsNoStrict).length, 8) // expected validation errors
  t.strictSame(JSONBatch.validateBatch(arr, valOptionsStrict).length, 14) // expected validation errors
  // console.log(`DEBUG | JSONBatch.getEvents, num: ${JSONBatch.getEvents(arr, { ...valOnlyValidAllInstance, ...valOptionsNoStrict }).length}`)
  t.strictSame(JSONBatch.getEvents(arr, { ...valOnlyValidAllInstance, ...valOptionsNoStrict }).length, 4) // no filtering
  t.strictSame(JSONBatch.getEvents(arr, { ...valOnlyValidAllInstance, ...valOptionsStrict }).length, 4) // strict true with onlyValid false makes no filtering
  t.strictSame(JSONBatch.getEvents(arr, { ...valOnlyValidInstance, ...valOptionsNoStrict }).length, 4) // only valid
  t.strictSame(JSONBatch.getEvents(arr, { ...valOnlyValidInstance, ...valOptionsStrict }).length, 2) // only valid in strict mode

  // additional test, ensure that all instances returned (only valid), are CloudEvent instances
  const eventsGot = JSONBatch.getEvents(arr, { ...valOnlyValidInstance, ...valOptionsNoStrict })
  t.ok(eventsGot.every((i) => CloudEvent.isCloudEvent(i)))
  // test with other instances returned (filtered in a different way)
  t.ok(JSONBatch.getEvents(arr, { ...valOnlyValidAllInstance, ...valOptionsNoStrict }).every((i) => CloudEvent.isCloudEvent(i)))

  t.end()
})

/** @test {JSONBatch} */
test('ensure isValid and validate works good on plain object and even CloudEvent instance and CloudEvent subclasses and not', (t) => {
  const { CloudEvent, JSONBatch, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(JSONBatch)

  class NotCESubclass {
  }
  class CESubclass extends CloudEvent {
  }

  const ceFullTextDataBad = createFullTextDataBad()
  t.ok(ceFullTextDataBad)
  // check that created instances belongs to the right base class
  t.ok(V.isClass(ceFullTextDataBad, CloudEvent))
  t.ok(!V.isClass(ceFullTextDataBad, NotCESubclass))
  t.ok(!V.isClass(ceFullTextDataBad, CESubclass))
  t.ok(!V.ensureIsClass(ceFullTextDataBad, CloudEvent, 'ceFull')) // no error returned
  t.ok(V.ensureIsClass(ceFullTextDataBad, CESubclass, 'ceFull')) // expected error returned
  t.ok(V.isClass(V.ensureIsClass(ceFullTextDataBad, CESubclass, 'ceFull'), TypeError)) // expected error returned
  t.ok(V.isClass(V.ensureIsClass(ceFullTextDataBad, NotCESubclass, 'ceFull'), TypeError)) // expected error returned
  // in following tests to simplify comparison of results, check only the  number of expected errors ...
  t.strictSame(JSONBatch.validateBatch(ceFullTextDataBad).length, 0)
  t.strictSame(JSONBatch.validateBatch(ceFullTextDataBad, valOptionsStrict).length, 2)
  t.notOk(JSONBatch.isJSONBatch(ceFullTextDataBad))

  const ceFullTextDataBadSubclass = new CESubclass('1/full/subclass',
    ceNamespace,
    ceServerUrl,
    // ceCommonData,
    'sample data', // data as string, to let this ce instance have some strict validation errors
    ceCommonOptions,
    // ceCommonExtensions
    {} // extensions as empty object, to let this ce instance have some strict validation errors
  )
  t.ok(ceFullTextDataBadSubclass)
  // check that created instances belongs to the right base class
  t.ok(V.isClass(ceFullTextDataBadSubclass, CloudEvent))
  t.ok(!V.isClass(ceFullTextDataBadSubclass, NotCESubclass))
  t.ok(V.isClass(ceFullTextDataBadSubclass, CESubclass))
  t.ok(!V.ensureIsClass(ceFullTextDataBadSubclass, CloudEvent, 'ceFullSubclass')) // no error returned
  t.ok(!V.ensureIsClass(ceFullTextDataBadSubclass, CESubclass, 'ceFullSubclass')) // no error returned
  t.ok(!V.isClass(V.ensureIsClass(ceFullTextDataBadSubclass, CESubclass, 'ceFullSubclass'), TypeError)) // no error returned
  t.ok(V.isClass(V.ensureIsClass(ceFullTextDataBadSubclass, NotCESubclass, 'ceFullSubclass'), TypeError)) // expected error returned
  // in following tests to simplify comparison of results, check only the  number of expected errors ...
  t.strictSame(JSONBatch.validateBatch(ceFullTextDataBadSubclass).length, 0)
  t.strictSame(JSONBatch.validateBatch(ceFullTextDataBadSubclass, valOptionsStrict).length, 2)
  t.notOk(JSONBatch.isJSONBatch(ceFullTextDataBadSubclass))

  // try even with a plain object
  const plainObject = { id: '1/plainObject', data: 'sample data' }
  t.strictSame(JSONBatch.validateBatch(plainObject).length, 1)
  t.strictSame(JSONBatch.validateBatch(plainObject, valOptionsStrict).length, 1)
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

  t.end()
})
