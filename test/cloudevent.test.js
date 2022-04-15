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
  // commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonOptionsWithSomeOptionalsNull,
  ceCommonOptionsWithSomeOptionalsNullStrict,
  ceCommonOptionsWithAllOptionalsNull,
  ceCommonOptionsWithAllOptionalsNullStrict,
  ceCommonOptionsForTextData,
  ceCommonOptionsForTextDataStrict,
  ceCommonExtensions,
  ceCommonExtensionsWithNullValue,
  ceExtensionStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceMapData,
  ceArrayData
} = require('./common-test-data')

/** @test {CloudEvent} */
test('ensure CloudEvent class (and related Validator and Transformer classes) are exported by the library', (t) => {
  // t.plan(25)

  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)
  // optional, using some standard Node.js assert statements, as a sample
  assert(CloudEvent !== null)
  assert.strictEqual(typeof CloudEvent, 'function')
  assert(new CloudEvent() instanceof CloudEvent)
  assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
  t.ok(V)
  t.equal(typeof CloudEvent, 'function')
  t.equal(typeof V, 'function')
  t.equal(typeof T, 'function')
  t.ok(V.isFunction(CloudEvent))
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.equal(typeof CloudEvent, 'function')
  t.equal(new CloudEvent() instanceof CloudEvent, true)
  t.equal(CloudEvent.mediaType(), 'application/cloudevents+json')

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

    // check that created instances belongs to the right base class
    t.equal(typeof ceMinimal, 'object')
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
    t.equal(typeof ceMinimalStrict, 'object')
    t.ok(V.isClass(ceMinimalStrict, CloudEvent))

    t.equal(typeof ceMinimalStrict.data, 'object') // data is wrapped in an object, so even when null it's an object
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))

    // set ceMinimalStrict.data to null, to ensure validation is good the same
    ceMinimalStrict.data = null
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))

    const ceStrictAsString = ceMinimalStrict.toString()
    // console.log(`DEBUG - ceStrictAsString: ${ceMinimalStrict}`)
    t.ok(V.isString(ceStrictAsString))
    const ceStrictPayloadDumped = T.dumpObject(ceMinimalStrict.payload, 'payload')
    // console.log(`DEBUG - ceStrictPayloadDumped: ${ceStrictPayloadDumped}`)
    t.ok(V.isString(ceStrictPayloadDumped))
    t.ok(ceStrictPayloadDumped.length < 1024)

    // ensure getter for time as Date works in the right way
    const ceStrictTimeAsString = ceMinimalStrict.time
    const ceStrictTimeAsDate = ceMinimalStrict.timeAsDate
    // console.log(`DEBUG - ceStrictTimeAsString: ${ceStrictTimeAsString}, ceStrictTimeAsDate: ${ceStrictTimeAsDate}`)
    t.ok(ceStrictTimeAsString)
    t.ok(V.isStringNotEmpty(ceStrictTimeAsString))
    t.ok(ceStrictTimeAsDate)
    t.ok(V.isDate(ceStrictTimeAsDate))
    t.ok(V.isDatePast(ceStrictTimeAsDate))
    t.ok(T.timestampFromString(ceStrictTimeAsString).toString())
    t.equal(ceStrictTimeAsDate.toString(), T.timestampFromString(ceStrictTimeAsString).toString())
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure isValid and validate works good on undefined and null objects', (t) => {
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

  t.end()
})

/** @test {CloudEvent} */
test('ensure dumpValidationResults works good on undefined, null, and wrong objects', (t) => {
  const { CloudEvent } = require('../src/')
  // t.ok(CloudEvent)

  {
    // undefined
    const ceDumpValidationResults = CloudEvent.dumpValidationResults(undefined, { strict: true })
    // console.log(`DEBUG - dump validation errors: ${ceDumpValidationResults}`)
    t.ok(ceDumpValidationResults.length > 0) // expected validation errors
  }

  {
    // null
    const ceDumpValidationResults = CloudEvent.dumpValidationResults(null, { strict: true })
    // console.log(`DEBUG - dump validation errors: ${ceDumpValidationResults}`)
    t.ok(ceDumpValidationResults.length > 0) // expected validation errors
  }

  {
    // object, not in strict mode
    const ceDumpValidationResults = CloudEvent.dumpValidationResults({})
    // console.log(`DEBUG - dump validation errors: ${ceDumpValidationResults}`)
    t.ok(ceDumpValidationResults.length > 0) // expected validation errors
  }

  {
    // object, with null options
    const ceDumpValidationResults = CloudEvent.dumpValidationResults({}, null)
    // console.log(`DEBUG - dump validation errors: ${ceDumpValidationResults}`)
    t.ok(ceDumpValidationResults.length > 0) // expected validation errors
  }

  {
    // object
    const ceDumpValidationResults = CloudEvent.dumpValidationResults({}, { strict: true })
    // console.log(`DEBUG - dump validation errors: ${ceDumpValidationResults}`)
    t.ok(ceDumpValidationResults.length > 0) // expected validation errors
  }

  t.end()
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (empty, without minimal arguments set or not set) and ensure they are different objects', (t) => {
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
    const ceDumpValidationResults = CloudEvent.dumpValidationResults(ceEmpty, { strict: true }, 'ceStrict')
    // console.log(`DEBUG - dump validation errors for ceEmpty: ${ceDumpValidationResults}`)
    t.ok(ceDumpValidationResults.length > 0) // expected validation errors
    t.strictSame(ceEmpty.validate({ strict: true }).length, 4) // simplify comparison of results, check only the  number of expected errors ...
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

  t.end()
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (with minimal fields set) and ensure they are different objects', (t) => {
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

  t.end()
})

/** @test {CloudEvent} */
test('ensure strict mode is managed in the right way', (t) => {
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  t.ok(!CloudEvent.setStrictExtensionInEvent()) // ok but no return value
  t.ok(!CloudEvent.setStrictExtensionInEvent(undefined, undefined)) // ok but no return value
  t.throws(function () {
    CloudEvent.setStrictExtensionInEvent(null, true)
    assert(false) // never executed
  }, TypeError, 'Expected exception when setting a strict extension flag into a null object')
  t.ok(!CloudEvent.setStrictExtensionInEvent({}, false)) // ok but no return value
  t.ok(!CloudEvent.setStrictExtensionInEvent({}, true)) // ok but no return value
  t.throws(function () {
    CloudEvent.setStrictExtensionInEvent({}, 'bad flag')
    assert(false) // never executed
  }, TypeError, 'Expected exception when setting a bad strict extension flag into an object')

  t.ok(!CloudEvent.getStrictExtensionOfEvent()) // ok but false return value
  t.ok(!CloudEvent.getStrictExtensionOfEvent(undefined)) // ok but false return value
  t.throws(function () {
    CloudEvent.getStrictExtensionOfEvent(null)
    assert(false) // never executed
  }, TypeError, 'Expected exception when getting a strict extension flag from a null event')
  t.ok(!CloudEvent.getStrictExtensionOfEvent({})) // ok but false return value
  t.ok(!CloudEvent.getStrictExtensionOfEvent({ strictvalidation: null })) // ok but false return value
  t.ok(!CloudEvent.getStrictExtensionOfEvent({ strict: 'bad value for a a wrong strict property' })) // ok but false return value
  t.ok(!CloudEvent.getStrictExtensionOfEvent({ strictvalidation: false })) // ok but false return value
  t.ok(CloudEvent.getStrictExtensionOfEvent({ strictvalidation: true })) // ok and true return value
  t.throws(function () {
    CloudEvent.getStrictExtensionOfEvent({ strictvalidation: 'bad flag' })
    assert(false) // never executed
  }, TypeError, 'Expected exception when getting a bad strict extension flag')

  t.end()
})

/** @test {CloudEvent} */
test('ensure extensions are managed in the right way', (t) => {
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  const sampleExtensions = ceCommonExtensions
  const sampleExtensionsWithStandardProperties = { ...sampleExtensions, id: 'myId' }

  t.ok(!CloudEvent.setExtensionsInEvent()) // ok but no return value
  t.ok(!CloudEvent.setExtensionsInEvent(undefined, undefined)) // ok but no return value
  t.throws(function () {
    CloudEvent.setExtensionsInEvent(null, sampleExtensions)
    assert(false) // never executed
  }, TypeError, 'Expected exception when setting extensions into a null object')
  t.ok(!CloudEvent.setExtensionsInEvent({}, sampleExtensions)) // ok but no return value
  t.throws(function () {
    CloudEvent.setExtensionsInEvent({}, 'bad extension')
    assert(false) // never executed
  }, TypeError, 'Expected exception when setting bad extensions into an object')

  t.notOk(CloudEvent.getExtensionsOfEvent()) // null as return value
  t.notOk(CloudEvent.getExtensionsOfEvent(undefined)) // null as return value
  t.throws(function () {
    CloudEvent.getExtensionsOfEvent(null)
    assert(false) // never executed
  }, TypeError, 'Expected exception when getting extensions from a null object')
  t.notOk(CloudEvent.getExtensionsOfEvent({})) // null as return value
  t.ok(CloudEvent.getExtensionsOfEvent(sampleExtensions))
  t.throws(function () {
    CloudEvent.getExtensionsOfEvent('bad extension')
    assert(false) // never executed
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

  t.end()
})

/** @test {CloudEvent} */
test('create two CloudEvent instances with all arguments (mandatory and optional arguments) and ensure they are different objects', (t) => {
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
  t.strictSame(ceFull1.payload, ceCommonData)

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
  t.strictSame(ceFull1Clone.payload, ceCommonData)

  // then ensure they are different objects ...
  assert(ceFull1 !== ceFull1Clone) // they must be different object references
  t.same(ceFull1, ceFull1Clone)
  t.strictSame(ceFull1, ceFull1Clone)

  t.end()
})

// sample validation function for the data of the given CloudEvent, using the given dataschema
// return always true if both are defined
function dataValidationOkIfDefined (data, schema) {
  if ((data !== undefined && data !== null) && (schema !== undefined && schema !== null)) return true
  // else
  return false
}

// sample validation function for the data of the given CloudEvent, using the given dataschema
// return always false
function dataValidationNotOk (data, schema) {
  return false
}

/** @test {CloudEvent} */
test('create CloudEvent instances with different kind of data attribute, and ensure the validation is right', (t) => {
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
    t.notOk(CloudEvent.isValidEvent(ceFullDataUndefinedStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataUndefinedStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefinedStrict), [])
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefinedStrict, { strict: true }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefinedStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataUndefinedStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataUndefinedStrict.isValid())
    t.ok(ceFullDataUndefinedStrict.isValid({ strict: true }))
    t.notOk(ceFullDataUndefinedStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataUndefinedStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataUndefinedStrict.validate(), [])
    t.strictSame(ceFullDataUndefinedStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceFullDataUndefinedStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(ceFullDataUndefinedStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
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
    t.strictSame(ceFullDataNull.dataType, 'Unknown')
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
    t.notOk(CloudEvent.isValidEvent(ceFullDataNullStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataNullStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataNullStrict), [])
    t.strictSame(CloudEvent.validateEvent(ceFullDataNullStrict, { strict: true }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataNullStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataNullStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataNullStrict.isValid())
    t.ok(ceFullDataNullStrict.isValid({ strict: true }))
    t.notOk(ceFullDataNullStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataNullStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataNullStrict.validate(), [])
    t.strictSame(ceFullDataNullStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceFullDataNullStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(ceFullDataNullStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    t.strictSame(ceFullDataNullStrict.payload, ceFullDataNullStrict.data)
    t.strictSame(ceFullDataNullStrict.dataType, 'Unknown')
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
    t.strictSame(ceFullDataMap.dataType, 'Text')
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
    t.strictSame(ceFullDataMapStrict.dataType, 'Text')
  }

  {
    // create an instance with a sample array data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataArray = new CloudEvent('1/full/array-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceArrayData, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullDataArray !== null)
    t.ok(ceFullDataArray)
    t.ok(CloudEvent.isValidEvent(ceFullDataArray))
    t.ok(CloudEvent.isValidEvent(ceFullDataArray, { strict: false }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataArray), []) // data type errors handled only in strict mode currently ...
    t.strictSame(CloudEvent.validateEvent(ceFullDataArray, { strict: false }).length, 0) // data type errors handled only in strict mode currently ...
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataArray.isValid())
    t.ok(ceFullDataArray.isValid({ strict: false }))
    t.strictSame(ceFullDataArray.validate(), []) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataArray.validate({ strict: false }).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataArray.payload, ceFullDataArray.data)
    t.strictSame(ceFullDataArray.dataType, 'Text')
    // the same but with strict mode enabled ...
    const ceFullDataArrayStrict = new CloudEvent('1/full/array-data/strict',
      ceNamespace,
      ceServerUrl,
      ceArrayData, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataArrayStrict !== null)
    t.ok(ceFullDataArrayStrict)
    t.ok(CloudEvent.isValidEvent(ceFullDataArrayStrict))
    t.ok(CloudEvent.isValidEvent(ceFullDataArrayStrict, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataArrayStrict).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(CloudEvent.validateEvent(ceFullDataArrayStrict, { strict: true }).length, 0) // data type errors handled only in strict mode currently ...
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataArrayStrict.isValid())
    t.ok(ceFullDataArrayStrict.isValid({ strict: true }))
    t.strictSame(ceFullDataArrayStrict.validate().length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataArrayStrict.validate({ strict: true }).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceFullDataArrayStrict.payload, ceFullDataArrayStrict.data)
    t.strictSame(ceFullDataArrayStrict.dataType, 'Text')
  }

  t.end()
})

/** @test {CloudEvent} */
test('create CloudEvent instances with a string data attribute, and ensure the validation is right', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  const value = 'data as a string'
  t.ok(V.isValue(value))

  {
    // create an instance with a string data attribute (and default datacontenttype), but with strict flag disabled: expected success ...
    // bad because of the default datacontenttype, but validation error only in strict mode
    const ceFullData = new CloudEvent('1/full/string-data/no-strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullData !== null)
    t.ok(ceFullData)
    // data type errors handled only in strict mode currently ...
    t.ok(CloudEvent.isValidEvent(ceFullData))
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: false })) // good the same
    t.ok(!CloudEvent.isValidEvent(ceFullData, { strict: true })) // bad here (right)
    t.strictSame(CloudEvent.validateEvent(ceFullData), [])
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: false }).length, 0) // good the same
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: true }).length, 1) // bad here (right)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullData.isValid())
    t.ok(ceFullData.isValid({ strict: false }))
    t.ok(!ceFullData.isValid({ strict: true }))
    t.strictSame(ceFullData.validate(), [])
    t.strictSame(ceFullData.validate({ strict: false }).length, 0)
    t.strictSame(ceFullData.validate({ strict: true }).length, 1)
    t.strictSame(ceFullData.payload, ceFullData.data)
    t.strictSame(ceFullData.dataType, 'Text')
    // the same but with strict mode enabled: expected validation errors ...
    const ceFullDataStrict = new CloudEvent('1/full/string-data/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataStrict !== null)
    t.ok(ceFullDataStrict)
    // data type errors handled only in strict mode currently ...
    // note that in the following lines even if I force 'strict: false' it won't be used because already set in the object instance ...
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict, { strict: true }))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict, { strict: false }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: false }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 2)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(!ceFullDataStrict.isValid())
    t.ok(!ceFullDataStrict.isValid({ strict: true }))
    t.ok(!ceFullDataStrict.isValid({ strict: false }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataStrict.validate().length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: false }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 2)
    t.strictSame(ceFullDataStrict.payload, ceFullDataStrict.data)
    t.strictSame(ceFullDataStrict.dataType, 'Text')
  }

  {
    // create an instance with a string data attribute (and the right datacontenttype), but with strict flag disabled: expected success ...
    // good because of the non default datacontenttype
    const ceFullData = new CloudEvent('1/full/string-data/no-strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextData,
      ceCommonExtensions
    )
    assert(ceFullData !== null)
    t.ok(ceFullData)
    // data type errors handled only in strict mode currently ...
    t.ok(CloudEvent.isValidEvent(ceFullData))
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: false })) // good
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: true })) // good
    t.strictSame(CloudEvent.validateEvent(ceFullData), [])
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: false }).length, 0) // good
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: true }).length, 0) // good
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullData.isValid())
    t.ok(ceFullData.isValid({ strict: false }))
    t.ok(ceFullData.isValid({ strict: true }))
    t.strictSame(ceFullData.validate(), [])
    t.strictSame(ceFullData.validate({ strict: false }).length, 0)
    t.strictSame(ceFullData.validate({ strict: true }).length, 0)
    t.strictSame(ceFullData.payload, ceFullData.data)
    t.strictSame(ceFullData.dataType, 'Text')
    // the same but with strict mode enabled: expected success ...
    const ceFullDataStrict = new CloudEvent('1/full/string-data/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextDataStrict,
      ceCommonExtensions
    )
    assert(ceFullDataStrict !== null)
    t.ok(ceFullDataStrict)
    // data type errors handled only in strict mode currently ...
    // note that in the following lines even if I force 'strict: false' it won't be used because already set in the object instance ...
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true }))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: false }))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataStrict.isValid())
    t.ok(ceFullDataStrict.isValid({ strict: true }))
    t.ok(ceFullDataStrict.isValid({ strict: false }))
    t.ok(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataStrict.validate().length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: false }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    t.strictSame(ceFullDataStrict.payload, ceFullDataStrict.data)
    t.strictSame(ceFullDataStrict.dataType, 'Text')
  }

  t.end()
})

/** @test {CloudEvent} */
test('create CloudEvent instances with a boolean data attribute, and ensure the validation is right', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  const value = true
  t.ok(V.isValue(value))

  {
    // create an instance with a boolean data attribute (and default datacontenttype), but with strict flag disabled: expected success ...
    // bad because of the default datacontenttype, but validation error only in strict mode
    const ceFullData = new CloudEvent('1/full/boolean-data/no-strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullData !== null)
    t.ok(ceFullData)
    // data type errors handled only in strict mode currently ...
    t.ok(CloudEvent.isValidEvent(ceFullData))
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: false })) // good the same
    t.ok(!CloudEvent.isValidEvent(ceFullData, { strict: true })) // bad here (right)
    t.strictSame(CloudEvent.validateEvent(ceFullData), [])
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: false }).length, 0) // good the same
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: true }).length, 1) // bad here (right)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullData.isValid())
    t.ok(ceFullData.isValid({ strict: false }))
    t.ok(!ceFullData.isValid({ strict: true }))
    t.strictSame(ceFullData.validate(), [])
    t.strictSame(ceFullData.validate({ strict: false }).length, 0)
    t.strictSame(ceFullData.validate({ strict: true }).length, 1)
    t.strictSame(ceFullData.payload, ceFullData.data)
    t.strictSame(ceFullData.dataType, 'Text')
    // the same but with strict mode enabled: expected validation errors ...
    const ceFullDataStrict = new CloudEvent('1/full/boolean-data/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataStrict !== null)
    t.ok(ceFullDataStrict)
    // data type errors handled only in strict mode currently ...
    // note that in the following lines even if I force 'strict: false' it won't be used because already set in the object instance ...
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict, { strict: true }))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict, { strict: false }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: false }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 2)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(!ceFullDataStrict.isValid())
    t.ok(!ceFullDataStrict.isValid({ strict: true }))
    t.ok(!ceFullDataStrict.isValid({ strict: false }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataStrict.validate().length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: false }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 2)
    t.strictSame(ceFullDataStrict.payload, ceFullDataStrict.data)
    t.strictSame(ceFullDataStrict.dataType, 'Text')
  }

  {
    // create an instance with a boolean data attribute (and the right datacontenttype), but with strict flag disabled: expected success ...
    // good because of the non default datacontenttype
    const ceFullData = new CloudEvent('1/full/boolean-data/no-strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextData,
      ceCommonExtensions
    )
    assert(ceFullData !== null)
    t.ok(ceFullData)
    // data type errors handled only in strict mode currently ...
    t.ok(CloudEvent.isValidEvent(ceFullData))
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: false })) // good
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: true })) // good
    t.strictSame(CloudEvent.validateEvent(ceFullData), [])
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: false }).length, 0) // good
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: true }).length, 0) // good
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullData.isValid())
    t.ok(ceFullData.isValid({ strict: false }))
    t.ok(ceFullData.isValid({ strict: true }))
    t.strictSame(ceFullData.validate(), [])
    t.strictSame(ceFullData.validate({ strict: false }).length, 0)
    t.strictSame(ceFullData.validate({ strict: true }).length, 0)
    t.strictSame(ceFullData.payload, ceFullData.data)
    t.strictSame(ceFullData.dataType, 'Text')
    // the same but with strict mode enabled: expected success ...
    const ceFullDataStrict = new CloudEvent('1/full/boolean-data/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextDataStrict,
      ceCommonExtensions
    )
    assert(ceFullDataStrict !== null)
    t.ok(ceFullDataStrict)
    // data type errors handled only in strict mode currently ...
    // note that in the following lines even if I force 'strict: false' it won't be used because already set in the object instance ...
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true }))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: false }))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataStrict.isValid())
    t.ok(ceFullDataStrict.isValid({ strict: true }))
    t.ok(ceFullDataStrict.isValid({ strict: false }))
    t.ok(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataStrict.validate().length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: false }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    t.strictSame(ceFullDataStrict.payload, ceFullDataStrict.data)
    t.strictSame(ceFullDataStrict.dataType, 'Text')
  }

  t.end()
})

/** @test {CloudEvent} */
test('create CloudEvent instances with a number as data attribute, and ensure the validation is right', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  const value = 1234567890
  t.ok(V.isValue(value))

  {
    // create an instance with a boolean data attribute (and default datacontenttype), but with strict flag disabled: expected success ...
    // bad because of the default datacontenttype, but validation error only in strict mode
    const ceFullData = new CloudEvent('1/full/number-data/no-strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullData !== null)
    t.ok(ceFullData)
    // data type errors handled only in strict mode currently ...
    t.ok(CloudEvent.isValidEvent(ceFullData))
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: false })) // good the same
    t.ok(!CloudEvent.isValidEvent(ceFullData, { strict: true })) // bad here (right)
    t.strictSame(CloudEvent.validateEvent(ceFullData), [])
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: false }).length, 0) // good the same
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: true }).length, 1) // bad here (right)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullData.isValid())
    t.ok(ceFullData.isValid({ strict: false }))
    t.ok(!ceFullData.isValid({ strict: true }))
    t.strictSame(ceFullData.validate(), [])
    t.strictSame(ceFullData.validate({ strict: false }).length, 0)
    t.strictSame(ceFullData.validate({ strict: true }).length, 1)
    t.strictSame(ceFullData.payload, ceFullData.data)
    t.strictSame(ceFullData.dataType, 'Text')
    // the same but with strict mode enabled: expected validation errors ...
    const ceFullDataStrict = new CloudEvent('1/full/number-data/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataStrict !== null)
    t.ok(ceFullDataStrict)
    // data type errors handled only in strict mode currently ...
    // note that in the following lines even if I force 'strict: false' it won't be used because already set in the object instance ...
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict, { strict: true }))
    t.ok(!CloudEvent.isValidEvent(ceFullDataStrict, { strict: false }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: false }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 2)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(!ceFullDataStrict.isValid())
    t.ok(!ceFullDataStrict.isValid({ strict: true }))
    t.ok(!ceFullDataStrict.isValid({ strict: false }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataStrict.validate().length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: false }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 1)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 2)
    t.strictSame(ceFullDataStrict.payload, ceFullDataStrict.data)
    t.strictSame(ceFullDataStrict.dataType, 'Text')
  }

  {
    // create an instance with a boolean data attribute (and the right datacontenttype), but with strict flag disabled: expected success ...
    // good because of the non default datacontenttype
    const ceFullData = new CloudEvent('1/full/number-data/no-strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextData,
      ceCommonExtensions
    )
    assert(ceFullData !== null)
    t.ok(ceFullData)
    // data type errors handled only in strict mode currently ...
    t.ok(CloudEvent.isValidEvent(ceFullData))
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: false })) // good
    t.ok(CloudEvent.isValidEvent(ceFullData, { strict: true })) // good
    t.strictSame(CloudEvent.validateEvent(ceFullData), [])
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: false }).length, 0) // good
    t.strictSame(CloudEvent.validateEvent(ceFullData, { strict: true }).length, 0) // good
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullData.isValid())
    t.ok(ceFullData.isValid({ strict: false }))
    t.ok(ceFullData.isValid({ strict: true }))
    t.strictSame(ceFullData.validate(), [])
    t.strictSame(ceFullData.validate({ strict: false }).length, 0)
    t.strictSame(ceFullData.validate({ strict: true }).length, 0)
    t.strictSame(ceFullData.payload, ceFullData.data)
    t.strictSame(ceFullData.dataType, 'Text')
    // the same but with strict mode enabled: expected success ...
    const ceFullDataStrict = new CloudEvent('1/full/number-data/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextDataStrict,
      ceCommonExtensions
    )
    assert(ceFullDataStrict !== null)
    t.ok(ceFullDataStrict)
    // data type errors handled only in strict mode currently ...
    // note that in the following lines even if I force 'strict: false' it won't be used because already set in the object instance ...
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true }))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: false }))
    t.ok(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(CloudEvent.isValidEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullDataStrict, { strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceFullDataStrict.isValid())
    t.ok(ceFullDataStrict.isValid({ strict: true }))
    t.ok(ceFullDataStrict.isValid({ strict: false }))
    t.ok(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationOkIfDefined }))
    t.notOk(ceFullDataStrict.isValid({ strict: true, dataschemavalidator: dataValidationNotOk }))
    t.strictSame(ceFullDataStrict.validate().length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: false }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationOkIfDefined }).length, 0)
    t.strictSame(ceFullDataStrict.validate({ strict: true, dataschemavalidator: dataValidationNotOk }).length, 1)
    t.strictSame(ceFullDataStrict.payload, ceFullDataStrict.data)
    t.strictSame(ceFullDataStrict.dataType, 'Text')
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure a CloudEvent/subclass instance is seen as a CloudEvent instance, but not other objects', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)
  t.ok(V)

  /** create some classes, for better reuse in following tests */
  class NotCESubclass {
  }
  class CESubclass extends CloudEvent {
  }

  {
    // check that an undefined object is not seen as a CloudEvent
    const ceObject = undefined
    t.equal(ceObject, undefined)
    t.equal(ceObject instanceof CloudEvent, false)
    t.ok(!V.isClass(ceObject, CloudEvent))
    t.throws(function () {
      const isCloudEvent = !CloudEvent.isCloudEvent(ceObject)
      assert(isCloudEvent === undefined) // never executed
    }, Error, "Expected exception when calling 'CloudEvent.isCloudEvent' with an undefined or null argument")
  }

  {
    // check that a null object is not seen as a CloudEvent
    const ceObject = null
    t.equal(typeof ceObject, 'object')
    t.equal(ceObject, null)
    t.equal(ceObject instanceof CloudEvent, false)
    t.ok(!V.isClass(ceObject, CloudEvent))
    t.throws(function () {
      const isCloudEvent = !CloudEvent.isCloudEvent(ceObject)
      assert(isCloudEvent === null) // never executed
    }, Error, "Expected exception when calling 'CloudEvent.isCloudEvent' with an undefined or null argument")
  }

  {
    // check that a generic object is not seen as a CloudEvent
    const ceObject = {}
    t.equal(typeof ceObject, 'object')
    t.equal(ceObject instanceof CloudEvent, false)
    t.ok(!V.isClass(ceObject, CloudEvent))
    t.ok(!CloudEvent.isCloudEvent(ceObject))
    t.ok(V.isStringNotEmpty(ceObject.toString()))
  }

  {
    // check that even an empty instance belongs to the right base class
    const ceEmpty = new CloudEvent()
    t.equal(typeof ceEmpty, 'object')
    t.equal(ceEmpty instanceof CloudEvent, true)
    t.ok(!V.isClass(ceEmpty, NotCESubclass))
    t.ok(V.isClass(ceEmpty, CloudEvent))
    t.ok(!V.isClass(ceEmpty, CESubclass))
    t.ok(CloudEvent.isCloudEvent(ceEmpty))
    t.ok(V.isStringNotEmpty(ceEmpty.toString()))

    // check that a subclass instance is seen as a CloudEvent
    const ceEmptySubclass = new CESubclass()
    t.equal(typeof ceEmptySubclass, 'object')
    t.equal(ceEmptySubclass instanceof CloudEvent, true)
    t.ok(!V.isClass(ceEmptySubclass, NotCESubclass))
    t.ok(V.isClass(ceEmptySubclass, CloudEvent))
    t.ok(V.isClass(ceEmptySubclass, CESubclass))
    t.ok(CloudEvent.isCloudEvent(ceEmptySubclass))
    t.ok(V.isStringNotEmpty(ceEmptySubclass.toString()))

    // check that a class instance outside CloudEvent class hierarchy is not seen as a CloudEvent
    const ceEmptyNoSubclass = new NotCESubclass()
    t.equal(typeof ceEmptyNoSubclass, 'object')
    t.equal(ceEmptyNoSubclass instanceof CloudEvent, false)
    t.ok(V.isClass(ceEmptyNoSubclass, NotCESubclass))
    t.ok(!V.isClass(ceEmptyNoSubclass, CloudEvent))
    t.ok(!V.isClass(ceEmptyNoSubclass, CESubclass))
    t.ok(!CloudEvent.isCloudEvent(ceEmptyNoSubclass))
    t.ok(V.isStringNotEmpty(ceEmptyNoSubclass.toString()))
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure CloudEvent and objects are merged in the right way', (t) => {
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
    // after the merge now I have to transform time from Date to the right string representation (like in the constructor)
    obj.time = T.timestampToString(obj.time)
    t.ok(obj)
    t.ok(V.isObject(obj))
    t.strictSame(Object.getPrototypeOf(obj), Object.getPrototypeOf(base))
    t.ok(obj.isValid({ strict: true }))
    t.ok(obj.isStrict)
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure CloudEvent with data encoded in base64 are managed in the right way', (t) => {
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
    t.strictNotSame(ceFull.data, ceDataAsString)
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
    t.strictSame(ceFull.payload, T.stringFromBase64(ceFull.data_base64))
    t.strictSame(ceFull.dataType, 'Binary')
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
    t.strictSame(ceFull.payload, T.stringFromBase64(ceFull.data_base64))
    t.strictSame(ceFull.dataType, 'Binary')
  }

  t.end()
})

// define my extension, valid in the spec version 0.3
const ceExtensionStrict03 = { com_github_smartiniOnGitHub_cloudevent: { strict: true } }

/** @test {CloudEvent} */
test('ensure old strict mode is no more valid (as per updated spec)', (t) => {
  const { CloudEvent } = require('../src/')

  t.throws(function () {
    CloudEvent.setStrictExtensionInEvent({}, ceExtensionStrict03)
    assert(false) // never executed
  }, TypeError, 'Expected exception when setting a non valid strict extension flag')
  t.ok(!CloudEvent.getStrictExtensionOfEvent({ ...ceExtensionStrict03 })) // ok but false return value

  t.end()
})

/** @test {CloudEvent} */
test('ensure internal methods on extensions checks are fully tested', (t) => {
  const { CloudEvent } = require('../src/')

  t.throws(function () {
    CloudEvent.isExtensionNameValid()
    assert(false) // never executed
  }, Error, 'Expected exception when checking a bad extension name')
  t.throws(function () {
    CloudEvent.isExtensionNameValid(undefined)
    assert(false) // never executed
  }, Error, 'Expected exception when checking a bad extension name')
  t.throws(function () {
    CloudEvent.isExtensionNameValid(null)
    assert(false) // never executed
  }, Error, 'Expected exception when checking a bad extension name')
  t.throws(function () {
    CloudEvent.isExtensionNameValid({})
    assert(false) // never executed
  }, TypeError, 'Expected exception when checking a bad extension name')

  t.throws(function () {
    CloudEvent.isExtensionValueValid()
    assert(false) // never executed
  }, Error, 'Expected exception when checking a bad extension value')
  t.throws(function () {
    CloudEvent.isExtensionValueValid(undefined)
    assert(false) // never executed
  }, Error, 'Expected exception when checking a bad extension value')
  t.notOk(CloudEvent.isExtensionValueValid({}))

  {
    // try with not valid extension name/value, expect validation errors ...
    const ceFull = new CloudEvent('1/no-strict',
      ceNamespace,
      ceServerUrl,
      null,
      ceCommonOptions,
      ceExtensionStrict03
    )
    t.ok(ceFull)
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.notOk(CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 2)
  }

  {
    // ensure that functions in extension objects give a strict validation error ...
    const ceFull = new CloudEvent('1/no-strict',
      ceNamespace,
      ceServerUrl,
      null,
      ceCommonOptions,
      { ...ceCommonExtensions, func (x) { return x }, exampleextension2: 'value2' }
    )
    t.ok(ceFull)
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.notOk(CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 1)
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure null values in some optional attributes are managed in the right way', (t) => {
  // const { CloudEvent, CloudEventTransformer: T } = require('../src/')
  const { CloudEvent } = require('../src/')

  {
    // create an instance with some optional attributes set to null, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ce = new CloudEvent('1/full/null-some-optionals/no-strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptionsWithSomeOptionalsNull,
      ceCommonExtensionsWithNullValue
    )
    assert(ce !== null)
    t.ok(ce)
    t.ok(CloudEvent.isValidEvent(ce))
    t.ok(CloudEvent.isValidEvent(ce, { strict: false }))
    t.strictSame(CloudEvent.validateEvent(ce), [])
    t.strictSame(CloudEvent.validateEvent(ce, { strict: false }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ce.isValid())
    t.ok(ce.isValid({ strict: false }))
    t.strictSame(ce.validate(), [])
    t.strictSame(ce.validate({ strict: false }).length, 0)
    t.strictSame(ce.payload, ce.data)
    t.strictSame(ce.dataType, 'Unknown')
    // the same but with strict mode enabled ...
    const ceStrict = new CloudEvent('1/full/null-some-optionals/strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptionsWithSomeOptionalsNullStrict,
      ceCommonExtensionsWithNullValue
    )
    assert(ceStrict !== null)
    t.ok(ceStrict)
    // console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ceStrict, null, 'ceStrict')}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceStrict, 'ceStrict')}`)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.ok(CloudEvent.isValidEvent(ceStrict, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceStrict), [])
    t.strictSame(CloudEvent.validateEvent(ceStrict, { strict: true }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceStrict.isValid())
    t.ok(ceStrict.isValid({ strict: true }))
    t.strictSame(ceStrict.validate(), [])
    t.strictSame(ceStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceStrict.payload, ce.data)
    t.strictSame(ceStrict.dataType, 'Unknown')
  }

  {
    // create an instance with all optional attributes set to null, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ce = new CloudEvent('1/full/null-all-optionals/no-strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptionsWithAllOptionalsNull,
      // ceCommonExtensionsWithNullValue
      null // set null extensions here
    )
    assert(ce !== null)
    t.ok(ce)
    t.ok(CloudEvent.isValidEvent(ce))
    t.ok(CloudEvent.isValidEvent(ce, { strict: false }))
    t.strictSame(CloudEvent.validateEvent(ce), [])
    t.strictSame(CloudEvent.validateEvent(ce, { strict: false }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ce.isValid())
    t.ok(ce.isValid({ strict: false }))
    t.strictSame(ce.validate(), [])
    t.strictSame(ce.validate({ strict: false }).length, 0)
    t.strictSame(ce.payload, ce.data)
    t.strictSame(ce.dataType, 'Unknown')
    // the same but with strict mode enabled ...
    const ceStrict = new CloudEvent('1/full/null-all-optionals/strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptionsWithAllOptionalsNullStrict,
      // ceCommonExtensionsWithNullValue
      null // set null extensions here
    )
    assert(ceStrict !== null)
    t.ok(ceStrict)
    // console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ceStrict, null, 'ceStrict')}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceStrict, 'ceStrict')}`)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.ok(CloudEvent.isValidEvent(ceStrict, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceStrict), [])
    t.strictSame(CloudEvent.validateEvent(ceStrict, { strict: true }).length, 0)
    // the same but using normal instance methods, to ensure they works good ...
    t.ok(ceStrict.isValid())
    t.ok(ceStrict.isValid({ strict: true }))
    t.strictSame(ceStrict.validate(), [])
    t.strictSame(ceStrict.validate({ strict: true }).length, 0)
    t.strictSame(ceStrict.payload, ce.data)
    t.strictSame(ceStrict.dataType, 'Unknown')
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure data type is managed in the right way', (t) => {
  // const { CloudEvent, CloudEventTransformer: T } = require('../src/')
  const { CloudEvent, CloudEventValidator: V } = require('../src/')

  const ceNullDataStrict = new CloudEvent('1-null-data-strict', ceNamespace, '/', null, { strict: true })
  t.ok(ceNullDataStrict)
  t.ok(CloudEvent.isStrictEvent(ceNullDataStrict))
  t.ok(ceNullDataStrict.isStrict)
  t.ok(V.isClass(ceNullDataStrict, CloudEvent))
  // console.log('ensureTypeOfDataIsRight on ceNullDataStrict: ' + CloudEvent.ensureTypeOfDataIsRight(ceNullDataStrict))
  t.notOk(CloudEvent.ensureTypeOfDataIsRight(ceNullDataStrict)) // no errors returned, good
  const ceEmptyObjectDataStrict = new CloudEvent('1-object-data-strict', ceNamespace, '/', {}, { strict: true })
  t.ok(ceEmptyObjectDataStrict)
  t.ok(CloudEvent.isStrictEvent(ceEmptyObjectDataStrict))
  t.ok(ceEmptyObjectDataStrict.isStrict)
  t.ok(V.isClass(ceEmptyObjectDataStrict, CloudEvent))
  // console.log('ensureTypeOfDataIsRight on ceEmptyObjectDataStrict: ' + CloudEvent.ensureTypeOfDataIsRight(ceEmptyObjectDataStrict))
  t.notOk(CloudEvent.ensureTypeOfDataIsRight(ceEmptyObjectDataStrict)) // no errors returned, good
  // ensure it's good even with other common data types
  const value = 'data as a string'
  const ceBadStrict = new CloudEvent('1-strict', ceNamespace, '/', value, { strict: true })
  t.ok(CloudEvent.ensureTypeOfDataIsRight(ceBadStrict))
  const ceFullDataStrict = new CloudEvent('1/full/string-data/strict',
    ceNamespace,
    ceServerUrl,
    value, // data
    ceCommonOptionsForTextDataStrict,
    ceCommonExtensions
  )
  t.ok(ceFullDataStrict)
  t.notOk(CloudEvent.ensureTypeOfDataIsRight(ceNullDataStrict)) // no errors returned, good
  t.throws(function () {
    const notCEDataTypeErrors = CloudEvent.ensureTypeOfDataIsRight({})
    assert(notCEDataTypeErrors === null) // bad assertion
  }, Error, 'Expected exception trying to check data type not for a CloudEvent instance')

  t.end()
})
