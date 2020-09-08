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

// import some common test data
const {
  // commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonExtensions,
  ceExtensionStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceMapData
} = require('./common-test-data')

/** @test {CloudEvent} */
test('ensure CloudEvent class (and related Validator and Transformer classes) are exported by the library', (t) => {
  t.plan(20)

  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)
  // optional, using some standard Node.js assert statements, as a sample
  assert(CloudEvent !== null)
  assert.strictEqual(typeof CloudEvent, 'function')
  assert(new CloudEvent() instanceof CloudEvent)
  assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
  t.ok(V)
  t.strictEqual(typeof CloudEvent, 'function')
  t.strictEqual(typeof V, 'function')
  t.strictEqual(typeof T, 'function')
  t.ok(V.isFunction(CloudEvent))
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.strictEqual(typeof CloudEvent, 'function')
  t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
  t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')

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
      null // data // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimalStrict)

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

/** @test {CloudEvent} */
test('ensure isValid and validate works good on undefined and null objects', (t) => {
  t.plan(7)
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  // undefined
  t.notOk()
  t.notOk(CloudEvent.isValidEvent())
  t.strictSame(CloudEvent.validateEvent(), [new Error('CloudEvent undefined or null')])

  // null
  t.notOk(null)
  t.notOk(CloudEvent.isValidEvent(null))
  t.strictSame(CloudEvent.validateEvent(null), [new Error('CloudEvent undefined or null')])
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (empty, without minimal arguments set or not set) and ensure they are different objects', (t) => {
  t.plan(13)
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  // note that when creating an instance with an undefined mandatory argument (without a default value), but with strict flag disabled: expected success ...
  // note that null values are not handled by default values, only undefined values ...

  {
    // create an instance without mandatory arguments (but no strict mode): expected success ...
    const ceEmpty = new CloudEvent()
    t.ok(ceEmpty)
    t.ok(!CloudEvent.isValidEvent(ceEmpty))
    // t.strictSame(CloudEvent.validateEvent(ceEmpty), []) // temp, to see the error during development ...
    t.strictSame(CloudEvent.validateEvent(ceEmpty).length, 3) // simplify comparison of results, check only the  number of expected errors ...
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(!ceEmpty.isValid())
    t.strictSame(ceEmpty.validate().length, 3) // simplify comparison of results, check only the  number of expected errors ...
    t.ok(!ceEmpty.isStrict)
    t.strictSame(ceEmpty.validate({ strict: true }).length, 5) // simplify comparison of results, check only the  number of expected errors ...
  }

  {
    // create an instance without mandatory arguments (but with strict mode): expected failure ...
    let ceEmpty2 = null
    try {
      ceEmpty2 = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true })
      assert(ceEmpty2 === null) // never executed
    } catch (e) {
      t.ok(e) // expected error here
      t.ok(!CloudEvent.isValidEvent(ceEmpty2))
      t.strictSame(CloudEvent.validateEvent(ceEmpty2), [new Error('CloudEvent undefined or null')])
      // the same but using normal instance methods, to ensure they works good ... no because here instance is null
    }
    t.equal(ceEmpty2, null)
    // the same test, but in a shorter form ...
    t.throws(function () {
      const ce = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true })
      assert(ce === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
  }
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (with minimal fields set) and ensure they are different objects', (t) => {
  t.plan(41)
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  // t.notSame(CloudEvent.isValidEvent, CloudEvent.validateEvent)
  t.strictNotSame(CloudEvent.isValidEvent, CloudEvent.validateEvent)

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
    // console.log(`DEBUG - cloudEvent details: ${ceMinimal}`) // implicit call of its toString method ...
    t.ok(CloudEvent.isValidEvent(ceMinimal))
    t.strictSame(CloudEvent.validateEvent(ceMinimal), [])
    // t.strictSame(CloudEvent.validateEvent(ceEmpty), []) // temp, to see the error during development ...
    t.strictSame(CloudEvent.validateEvent(ceMinimal).length, 0) // simplify comparison of results, check only the  number of expected errors ...
    // create another instance, similar
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceMinimal.isValid())
    t.strictSame(ceMinimal.validate(), [])
    t.strictSame(ceMinimal.validate().length, 0) // simplify comparison of results, check only the  number of expected errors ...
    t.ok(!ceMinimal.isStrict)
    const ceMinimal2 = new CloudEvent('2', // id
      ceNamespace, // type
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal2)
    t.ok(CloudEvent.isValidEvent(ceMinimal2)) // using default strict mode in the event
    t.ok(CloudEvent.isValidEvent(ceMinimal2, { strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(CloudEvent.validateEvent(ceMinimal2), [])
    t.strictSame(CloudEvent.validateEvent(ceMinimal2).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceMinimal2.isValid()) // using default strict mode in the event
    t.ok(ceMinimal2.isValid({ strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(ceMinimal2.validate(), [])
    t.strictSame(ceMinimal2.validate().length, 0)
    // then ensure they are different (have different values inside) ...
    assert(ceMinimal !== ceMinimal2) // they must be different object references
    t.notSame(ceMinimal, ceMinimal2)
    t.strictNotSame(ceMinimal, ceMinimal2)
  }

  {
    // create an instance with a mandatory argument undefined (but no strict mode): expected success ...
    // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
    const ceMinimalMandatoryUndefinedNoStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: false })
    assert(ceMinimalMandatoryUndefinedNoStrict !== null)
    t.ok(ceMinimalMandatoryUndefinedNoStrict)
    t.ok(!CloudEvent.isValidEvent(ceMinimalMandatoryUndefinedNoStrict)) // using default strict mode in the event
    t.ok(!CloudEvent.isValidEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(CloudEvent.validateEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: false }).length, 3)
    t.ok(!CloudEvent.isValidEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: true })) // the same but validate with strict mode enabled ...
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(!ceMinimalMandatoryUndefinedNoStrict.isValid()) // using default strict mode in the event
    t.ok(!ceMinimalMandatoryUndefinedNoStrict.isValid({ strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(ceMinimalMandatoryUndefinedNoStrict.validate({ strict: false }).length, 3)
    t.ok(!ceMinimalMandatoryUndefinedNoStrict.isValid({ strict: true })) // the same but validate with strict mode enabled ...

    // the same but with strict mode: expected exception ...
    t.throws(function () {
      const ceMinimalMandatoryUndefinedStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true })
      assert(ceMinimalMandatoryUndefinedStrict === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
  }

  {
    // create an instance with a mandatory argument null (but no strict mode): expected success ...
    // note that only undefined arguments will be assigned a default value (if set), so all will be good the same here ...
    const ceMinimalMandatoryNullNoStrict = new CloudEvent(null, null, null, null, { strict: false })
    assert(ceMinimalMandatoryNullNoStrict !== null)
    t.ok(ceMinimalMandatoryNullNoStrict)
    t.ok(!CloudEvent.isValidEvent(ceMinimalMandatoryNullNoStrict)) // using default strict mode in the event
    t.ok(!CloudEvent.isValidEvent(ceMinimalMandatoryNullNoStrict, { strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(CloudEvent.validateEvent(ceMinimalMandatoryNullNoStrict, { strict: false }).length, 3)
    t.ok(!CloudEvent.isValidEvent(ceMinimalMandatoryNullNoStrict, { strict: true })) // the same but validate with strict mode enabled ...
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(!ceMinimalMandatoryNullNoStrict.isValid()) // using default strict mode in the event
    t.ok(!ceMinimalMandatoryNullNoStrict.isValid({ strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(ceMinimalMandatoryNullNoStrict.validate({ strict: false }).length, 3)
    t.ok(!ceMinimalMandatoryNullNoStrict.isValid({ strict: true })) // the same but validate with strict mode enabled ...

    // the same but with strict mode: expected exception ...
    t.throws(function () {
      const ceMinimalMandatoryNullStrict = new CloudEvent(null, null, null, null, { strict: true })
      assert(ceMinimalMandatoryNullStrict === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
  }
})

/** @test {CloudEvent} */
test('ensure strict mode is managed in the right way', (t) => {
  t.plan(16)
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  t.ok(!CloudEvent.setStrictExtensionInEvent()) // ok but no return value
  t.ok(!CloudEvent.setStrictExtensionInEvent(undefined, undefined)) // ok but no return value
  t.throws(function () {
    CloudEvent.setStrictExtensionInEvent(null, true)
    assert(true) // never executed
  }, TypeError, 'Expected exception when setting a strict extension flag into a null object')
  t.ok(!CloudEvent.setStrictExtensionInEvent({}, false)) // ok but no return value
  t.ok(!CloudEvent.setStrictExtensionInEvent({}, true)) // ok but no return value
  t.throws(function () {
    CloudEvent.setStrictExtensionInEvent({}, 'bad flag')
    assert(true) // never executed
  }, TypeError, 'Expected exception when setting a bad strict extension flag into an object')

  t.ok(!CloudEvent.getStrictExtensionOfEvent()) // ok but false return value
  t.ok(!CloudEvent.getStrictExtensionOfEvent(undefined)) // ok but false return value
  t.throws(function () {
    CloudEvent.getStrictExtensionOfEvent(null)
    assert(true) // never executed
  }, TypeError, 'Expected exception when getting a strict extension flag from a null object')
  t.ok(!CloudEvent.getStrictExtensionOfEvent({})) // ok but false return value
  t.ok(!CloudEvent.getStrictExtensionOfEvent({ com_github_smartiniOnGitHub_cloudevent: {} })) // ok but false return value
  t.throws(function () {
    CloudEvent.getStrictExtensionOfEvent({ com_github_smartiniOnGitHub_cloudevent: 'bad value' })
    assert(true) // never executed
  }, TypeError, 'Expected exception when getting a strict extension flag from a wrong property for my custom extensions object')
  t.ok(!CloudEvent.getStrictExtensionOfEvent({ com_github_smartiniOnGitHub_cloudevent: { strict: false } })) // ok but false return value
  t.ok(CloudEvent.getStrictExtensionOfEvent({ com_github_smartiniOnGitHub_cloudevent: { strict: true } })) // ok and true return value
  t.throws(function () {
    CloudEvent.getStrictExtensionOfEvent({ com_github_smartiniOnGitHub_cloudevent: { strict: 'bad flag' } })
    assert(true) // never executed
  }, TypeError, 'Expected exception when getting a bad strict extension flag from my custom extensions object')
})

/** @test {CloudEvent} */
test('ensure extensions are managed in the right way', (t) => {
  t.plan(19)
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  const sampleExtensions = { exampleExtension: 'value' }
  const sampleExtensionsWithStandardProperties = { ...sampleExtensions, id: 'myId' }

  t.ok(!CloudEvent.setExtensionsInEvent()) // ok but no return value
  t.ok(!CloudEvent.setExtensionsInEvent(undefined, undefined)) // ok but no return value
  t.throws(function () {
    CloudEvent.setExtensionsInEvent(null, sampleExtensions)
    assert(true) // never executed
  }, TypeError, 'Expected exception when setting extensions into a null object')
  t.ok(!CloudEvent.setExtensionsInEvent({}, sampleExtensions)) // ok but no return value
  t.throws(function () {
    CloudEvent.setExtensionsInEvent({}, 'bad extension')
    assert(true) // never executed
  }, TypeError, 'Expected exception when setting bad extensions into an object')

  t.notOk(CloudEvent.getExtensionsOfEvent()) // null as return value
  t.notOk(CloudEvent.getExtensionsOfEvent(undefined)) // null as return value
  t.throws(function () {
    CloudEvent.getExtensionsOfEvent(null)
    assert(true) // never executed
  }, TypeError, 'Expected exception when getting extensions from a null object')
  t.notOk(CloudEvent.getExtensionsOfEvent({})) // null as return value
  t.ok(CloudEvent.getExtensionsOfEvent(sampleExtensions))
  t.throws(function () {
    CloudEvent.getExtensionsOfEvent('bad extension')
    assert(true) // never executed
  }, TypeError, 'Expected exception when getting bad extensions')

  // ensure no instance will be created if extensions contains standard properties, but only in strict mode
  const ceFull = new CloudEvent('1/full',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptions,
    sampleExtensionsWithStandardProperties
  )
  t.ok(ceFull)
  t.ok(CloudEvent.isValidEvent(ceFull))
  t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
  t.strictSame(CloudEvent.validateEvent(ceFull), [])
  t.strictSame(CloudEvent.validateEvent(ceFull).length, 0)
  t.throws(function () {
    const ceFullStrict = new CloudEvent('1/full-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceCommonOptionsStrict,
      sampleExtensionsWithStandardProperties
    )
    assert(ceFullStrict === undefined) // never executed
  }, Error, 'Expected exception when creating a CloudEvent with extensions containing standard prioperties, in strict mode')
  // ensure no instance will be created if extensions are defined but empty (not valid in strict mode)
  t.throws(function () {
    const ceFullStrictEmptyExtensions = new CloudEvent('1/full-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceCommonOptionsStrict,
      {} // defined but empty extensions (null or undefined would be good otherwise)
    )
    assert(ceFullStrictEmptyExtensions === undefined) // never executed
  }, Error, 'Expected exception when creating a CloudEvent with extensions defined but empty, in strict mode')
})

/** @test {CloudEvent} */
test('create two CloudEvent instances with all arguments (mandatory and optional arguments) and ensure they are different objects', (t) => {
  t.plan(21)
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  // create an instance with some common options, but with strict flag disabled: expected success ...
  const ceFull1 = new CloudEvent('1/full',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptions,
    ceCommonExtensions
  )
  t.ok(ceFull1)
  t.ok(CloudEvent.isValidEvent(ceFull1))
  t.ok(CloudEvent.isValidEvent(ceFull1, { strict: false }))
  t.strictSame(CloudEvent.validateEvent(ceFull1), [])
  t.strictSame(CloudEvent.validateEvent(ceFull1).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFull1.isValid())
  t.ok(ceFull1.isValid({ strict: false }))
  t.strictSame(ceFull1.validate(), [])
  t.strictSame(ceFull1.validate().length, 0)

  // create another instance with all fields equals: expected success ...
  const ceFull1Clone = new CloudEvent('1/full', // should be '2/full/no-strict' ...
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptions,
    ceCommonExtensions
  )
  t.ok(ceFull1Clone)
  t.ok(CloudEvent.isValidEvent(ceFull1Clone))
  t.ok(CloudEvent.isValidEvent(ceFull1Clone, { strict: false }))
  t.strictSame(CloudEvent.validateEvent(ceFull1Clone), [])
  t.strictSame(CloudEvent.validateEvent(ceFull1Clone).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFull1Clone.isValid())
  t.ok(ceFull1Clone.isValid({ strict: false }))
  t.strictSame(ceFull1Clone.validate(), [])
  t.strictSame(ceFull1Clone.validate().length, 0)

  // then ensure they are different objects ...
  assert(ceFull1 !== ceFull1Clone) // they must be different object references
  t.same(ceFull1, ceFull1Clone)
  t.strictSame(ceFull1, ceFull1Clone)
})

/** @test {CloudEvent} */
test('create CloudEvent instances with different kind of data attribute, and ensure the validation is right', (t) => {
  t.plan(87)
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  {
    // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataUndefined = new CloudEvent('1/full/undefined-data/no-strict',
      ceNamespace,
      ceServerUrl,
      undefined, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullDataUndefined !== null)
    t.ok(ceFullDataUndefined)
    t.ok(CloudEvent.isValidEvent(ceFullDataUndefined))
    t.ok(CloudEvent.isValidEvent(ceFullDataUndefined, { strict: false }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefined), [])
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefined, { strict: false }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataUndefined.isValid())
    t.ok(ceFullDataUndefined.isValid({ strict: false }))
    t.strictSame(ceFullDataUndefined.validate(), [])
    t.strictSame(ceFullDataUndefined.validate({ strict: false }).length, 0)
    // the same but with strict mode enabled ...
    const ceFullDataUndefinedStrict = new CloudEvent('1/full/undefined-data/strict',
      ceNamespace,
      ceServerUrl,
      undefined, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataUndefinedStrict !== null)
    t.ok(ceFullDataUndefinedStrict)
    t.ok(CloudEvent.isValidEvent(ceFullDataUndefinedStrict))
    t.ok(CloudEvent.isValidEvent(ceFullDataUndefinedStrict, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefinedStrict), [])
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefinedStrict, { strict: true }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataUndefinedStrict.isValid())
    t.ok(ceFullDataUndefinedStrict.isValid({ strict: true }))
    t.strictSame(ceFullDataUndefinedStrict.validate(), [])
    t.strictSame(ceFullDataUndefinedStrict.validate({ strict: true }).length, 0)
  }

  {
    // create an instance with null data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataNull = new CloudEvent('1/full/null-data/no-strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullDataNull !== null)
    t.ok(ceFullDataNull)
    t.ok(CloudEvent.isValidEvent(ceFullDataNull))
    t.ok(CloudEvent.isValidEvent(ceFullDataNull, { strict: false }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataNull), [])
    t.strictSame(CloudEvent.validateEvent(ceFullDataNull, { strict: false }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataNull.isValid())
    t.ok(ceFullDataNull.isValid({ strict: false }))
    t.strictSame(ceFullDataNull.validate(), [])
    t.strictSame(ceFullDataNull.validate({ strict: false }).length, 0)
    t.strictSame(ceFullDataNull.payload, ceFullDataNull.data)
    // the same but with strict mode enabled ...
    const ceFullDataNullStrict = new CloudEvent('1/full/null-data/strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataNullStrict !== null)
    t.ok(ceFullDataNullStrict)
    t.ok(CloudEvent.isValidEvent(ceFullDataNullStrict))
    t.ok(CloudEvent.isValidEvent(ceFullDataNullStrict, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataNullStrict), [])
    t.strictSame(CloudEvent.validateEvent(ceFullDataNullStrict, { strict: true }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataNullStrict.isValid())
    t.ok(ceFullDataNullStrict.isValid({ strict: true }))
    t.strictSame(ceFullDataNullStrict.validate(), [])
    t.strictSame(ceFullDataNullStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceFullDataNullStrict.payload, ceFullDataNullStrict.data)
  }

  {
    // create an instance with a string data attribute, but with strict flag disabled: expected success ...
    const ceFullDataString = new CloudEvent('1/full/string-data/no-strict',
      ceNamespace,
      ceServerUrl,
      'data as a string, bad here', // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullDataString !== null)
    t.ok(ceFullDataString)
    // data type errors handled only in strict mode currently ...
    t.ok(CloudEvent.isValidEvent(ceFullDataString))
    t.ok(CloudEvent.isValidEvent(ceFullDataString, { strict: false })) // good the same
    t.ok(!CloudEvent.isValidEvent(ceFullDataString, { strict: true })) // bad here (right)
    t.strictSame(CloudEvent.validateEvent(ceFullDataString), [])
    t.strictSame(CloudEvent.validateEvent(ceFullDataString, { strict: false }).length, 0) // good the same
    t.strictSame(CloudEvent.validateEvent(ceFullDataString, { strict: true }).length, 1) // bad here (right)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataString.isValid())
    t.ok(ceFullDataString.isValid({ strict: false }))
    t.ok(!ceFullDataString.isValid({ strict: true }))
    t.strictSame(ceFullDataString.validate(), [])
    t.strictSame(ceFullDataString.validate({ strict: false }).length, 0)
    t.strictSame(ceFullDataString.validate({ strict: true }).length, 1)
    t.strictSame(ceFullDataString.payload, ceFullDataString.data)
    // the same but with strict mode enabled ...
    const ceFullDataStringStrict = new CloudEvent('1/full/string-data/strict',
      ceNamespace,
      ceServerUrl,
      'data as a string, bad here', // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataStringStrict !== null)
    t.ok(ceFullDataStringStrict)
    // data type errors handled only in strict mode currently ...
    // note that in the following lines even if I force 'strict: false' he won't be used because already set in the object instance ...
    t.ok(!CloudEvent.isValidEvent(ceFullDataStringStrict))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStringStrict, { strict: true }))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStringStrict, { strict: false }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataStringStrict).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStringStrict, { strict: true }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStringStrict, { strict: false }).length, 1)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(!ceFullDataStringStrict.isValid())
    t.ok(!ceFullDataStringStrict.isValid({ strict: true }))
    t.ok(!ceFullDataStringStrict.isValid({ strict: false }))
    t.strictSame(ceFullDataStringStrict.validate().length, 1)
    t.strictSame(ceFullDataStringStrict.validate({ strict: true }).length, 1)
    t.strictSame(ceFullDataStringStrict.validate({ strict: false }).length, 1)
    t.strictSame(ceFullDataStringStrict.payload, ceFullDataStringStrict.data)
  }

  {
    // create an instance with a sample Map data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataMap = new CloudEvent('1/full/map-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceMapData, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullDataMap !== null)
    t.ok(ceFullDataMap)
    t.ok(CloudEvent.isValidEvent(ceFullDataMap))
    t.ok(CloudEvent.isValidEvent(ceFullDataMap, { strict: false }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataMap), []) // data type errors handled only in strict mode currently ...
    t.strictSame(CloudEvent.validateEvent(ceFullDataMap, { strict: false }).length, 0) // data type errors handled only in strict mode currently ...
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataMap.isValid())
    t.ok(ceFullDataMap.isValid({ strict: false }))
    t.strictSame(ceFullDataMap.validate(), []) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataMap.validate({ strict: false }).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataMap.payload, ceFullDataMap.data)
    // the same but with strict mode enabled ...
    const ceFullDataMapStrict = new CloudEvent('1/full/map-data/strict',
      ceNamespace,
      ceServerUrl,
      ceMapData, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataMapStrict !== null)
    t.ok(ceFullDataMapStrict)
    t.ok(CloudEvent.isValidEvent(ceFullDataMapStrict))
    t.ok(CloudEvent.isValidEvent(ceFullDataMapStrict, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataMapStrict).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(CloudEvent.validateEvent(ceFullDataMapStrict, { strict: true }).length, 0) // data type errors handled only in strict mode currently ...
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataMapStrict.isValid())
    t.ok(ceFullDataMapStrict.isValid({ strict: true }))
    t.strictSame(ceFullDataMapStrict.validate().length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataMapStrict.validate({ strict: true }).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataMapStrict.payload, ceFullDataMapStrict.data)
  }
})

/** @test {CloudEvent} */
test('ensure a CloudEvent/subclass instance is seen as a CloudEvent instance, but not other objects', (t) => {
  t.plan(36)

  const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)

  /** create some classes, for better reuse in following tests */
  class NotCESubclass {
  }
  class CESubclass extends CloudEvent {
  }

  {
    // check that an undefined object is not seen as a CloudEvent
    const ceObject = undefined
    t.strictEqual(ceObject, undefined)
    t.strictEqual(ceObject instanceof CloudEvent, false)
    t.ok(!V.isClass(ceObject, CloudEvent))
    t.throws(function () {
      const isCloudEvent = !CloudEvent.isCloudEvent(ceObject)
      assert(isCloudEvent === undefined) // never executed
    }, Error, 'Expected exception when calling \'CloudEvent.isCloudEvent\' with an undefined or null argument')
  }

  {
    // check that a null object is not seen as a CloudEvent
    const ceObject = null
    t.strictEqual(typeof ceObject, 'object')
    t.strictEqual(ceObject, null)
    t.strictEqual(ceObject instanceof CloudEvent, false)
    t.ok(!V.isClass(ceObject, CloudEvent))
    t.throws(function () {
      const isCloudEvent = !CloudEvent.isCloudEvent(ceObject)
      assert(isCloudEvent === null) // never executed
    }, Error, 'Expected exception when calling \'CloudEvent.isCloudEvent\' with an undefined or null argument')
  }

  {
    // check that a generic object is not seen as a CloudEvent
    const ceObject = {}
    t.strictEqual(typeof ceObject, 'object')
    t.strictEqual(ceObject instanceof CloudEvent, false)
    t.ok(!V.isClass(ceObject, CloudEvent))
    t.ok(!CloudEvent.isCloudEvent(ceObject))
    t.ok(V.isStringNotEmpty(ceObject.toString()))
  }

  {
    // check that even an empty instance belongs to the right base class
    const ceEmpty = new CloudEvent()
    t.strictEqual(typeof ceEmpty, 'object')
    t.strictEqual(ceEmpty instanceof CloudEvent, true)
    t.ok(!V.isClass(ceEmpty, NotCESubclass))
    t.ok(V.isClass(ceEmpty, CloudEvent))
    t.ok(!V.isClass(ceEmpty, CESubclass))
    t.ok(CloudEvent.isCloudEvent(ceEmpty))
    t.ok(V.isStringNotEmpty(ceEmpty.toString()))

    // check that a subclass instance is seen as a CloudEvent
    const ceEmptySubclass = new CESubclass()
    t.strictEqual(typeof ceEmptySubclass, 'object')
    t.strictEqual(ceEmptySubclass instanceof CloudEvent, true)
    t.ok(!V.isClass(ceEmptySubclass, NotCESubclass))
    t.ok(V.isClass(ceEmptySubclass, CloudEvent))
    t.ok(V.isClass(ceEmptySubclass, CESubclass))
    t.ok(CloudEvent.isCloudEvent(ceEmptySubclass))
    t.ok(V.isStringNotEmpty(ceEmptySubclass.toString()))

    // check that a class instance outside CloudEvent class hierarchy is not seen as a CloudEvent
    const ceEmptyNoSubclass = new NotCESubclass()
    t.strictEqual(typeof ceEmptyNoSubclass, 'object')
    t.strictEqual(ceEmptyNoSubclass instanceof CloudEvent, false)
    t.ok(V.isClass(ceEmptyNoSubclass, NotCESubclass))
    t.ok(!V.isClass(ceEmptyNoSubclass, CloudEvent))
    t.ok(!V.isClass(ceEmptyNoSubclass, CESubclass))
    t.ok(!CloudEvent.isCloudEvent(ceEmptyNoSubclass))
    t.ok(V.isStringNotEmpty(ceEmptyNoSubclass.toString()))
  }
})

/** @test {CloudEvent} */
test('ensure CloudEvent and objects are merged in the right way', (t) => {
  t.plan(14)

  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
  t.ok(V.isFunction(CloudEvent))
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.ok(V.isFunction(T.mergeObjects))

  {
    const base = new CloudEvent()
    const obj = T.mergeObjects(base)
    t.ok(V.isObject(obj))
    t.strictSame(Object.getPrototypeOf(obj), Object.getPrototypeOf(base))
  }
  {
    const base = new CloudEvent('1', // id
      ceNamespace,
      ceServerUrl,
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(base)
    t.ok(base.isValid({ strict: false })) // strict false here because base is missing some attribute, for the test
    t.ok(!base.isStrict)
    const obj = T.mergeObjects(base, { data: ceCommonData }, ceCommonOptions, ceExtensionStrict)
    // console.log(`DEBUG - merged details: ${T.dumpObject(obj, 'obj')}`)
    t.ok(obj)
    t.ok(V.isObject(obj))
    t.strictSame(Object.getPrototypeOf(obj), Object.getPrototypeOf(base))
    t.ok(obj.isValid({ strict: true }))
    t.ok(obj.isStrict)
  }
})

/** @test {CloudEvent} */
test('ensure CloudEvent with data encoded in base64 are managed in the right way', (t) => {
  t.plan(44)

  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring

  const ceDataAsString = 'Hello World, 2020'
  const ceDataEncoded = 'SGVsbG8gV29ybGQsIDIwMjA='
  const ceOptionsWithDataInBase64 = { ...ceCommonOptions, datainbase64: ceDataEncoded }
  {
    // data_base64 bad (not a string), expect validation errors ...
    const ceFull = new CloudEvent('1/full',
      ceNamespace,
      ceServerUrl,
      null,
      { ...ceCommonOptions, datainbase64: {} },
      ceCommonExtensions
    )
    t.ok(ceFull)
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 1)
  }
  {
    // data_base64 good, but data defined here, expect validation errors ...
    const ceFull = new CloudEvent('1/full',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceOptionsWithDataInBase64,
      ceCommonExtensions
    )
    t.ok(ceFull)
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 1)
    t.ok(V.isObject(ceFull.data))
    t.notStrictSame(ceFull.data, ceDataAsString)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
  }
  {
    // data_base64 good, but data defined as a string here, expect validation errors ...
    const ceFull = new CloudEvent('1/full',
      ceNamespace,
      ceServerUrl,
      ceDataAsString,
      ceOptionsWithDataInBase64,
      ceCommonExtensions
    )
    t.ok(ceFull)
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 2)
    t.ok(V.isString(ceFull.data))
    t.strictSame(ceFull.data, ceDataAsString)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
  }
  {
    // data_base64 good, and no data defined here (good), expect no validation errors ...
    const ceFull = new CloudEvent('1/full',
      ceNamespace,
      ceServerUrl,
      null,
      ceOptionsWithDataInBase64,
      ceCommonExtensions
    )
    t.ok(ceFull)
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 0)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
  }

  // the same but with strict mode ...
  // note that in this case validation will use the strict flag set into ce instance ...
  {
    // data_base64 bad (not a string), expect validation errors ...
    const ceFull = new CloudEvent('1/full-strict',
      ceNamespace,
      ceServerUrl,
      null,
      { ...ceCommonOptions, datainbase64: {}, strict: true },
      ceCommonExtensions
    )
    t.ok(ceFull)
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.ok(!CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 1)
  }
  // data_base64 good, but data defined here, expect instantiation errors ...
  t.throws(function () {
    const ce = new CloudEvent('1/full-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      { ...ceOptionsWithDataInBase64, strict: true },
      ceCommonExtensions
    )
    assert(ce === null) // never executed
  }, Error, 'Expected exception when creating a CloudEvent with data and datainbase64 with strict flag enabled')
  // data_base64 good, but data defined as a string here, expect validation errors ...
  t.throws(function () {
    const ce = new CloudEvent('1/full-strict',
      ceNamespace,
      ceServerUrl,
      ceDataAsString,
      { ...ceOptionsWithDataInBase64, strict: true },
      ceCommonExtensions
    )
    assert(ce === null) // never executed
  }, Error, 'Expected exception when creating a CloudEvent with data and datainbase64 with strict flag enabled')
  {
    // data_base64 good, and no data defined here (good), expect no validation errors ...
    const ceFull = new CloudEvent('1/full-strict',
      ceNamespace,
      ceServerUrl,
      null,
      { ...ceOptionsWithDataInBase64, strict: true },
      ceCommonExtensions
    )
    t.ok(ceFull)
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 0)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
  }
})
