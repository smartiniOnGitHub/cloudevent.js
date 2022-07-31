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

const assert = require('node:assert').strict
const test = require('tap').test

// import some common test data
const {
  // ceArrayData,
  // ceCommonData,
  ceCommonExtensions,
  // ceCommonExtensionsWithNullValue,
  ceCommonOptions,
  // ceCommonOptionsForTextData,
  // ceCommonOptionsForTextDataStrict,
  // ceCommonOptionsStrict,
  // ceCommonOptionsWithAllOptionalsNull,
  // ceCommonOptionsWithAllOptionalsNullStrict,
  // ceCommonOptionsWithSomeOptionalsNull,
  // ceCommonOptionsWithSomeOptionalsNullStrict,
  // ceExtensionStrict,
  // ceMapData,
  ceNamespace,
  ceOptionsNoStrict,
  ceOptionsStrict,
  ceServerUrl,
  // commonEventTime,
  valDebugInfoDisable,
  valDebugInfoEnable,
  valExcludeExtensionsDisable,
  valExcludeExtensionsEnable,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
} = require('./common-test-data')

const { CloudEvent, CloudEventValidator: V, CloudEventUtilities: U } = require('../src/') // get references via destructuring
assert(CloudEvent !== null)
assert(V !== null)
assert(U !== null)

/** @test {CloudEvent} */
test('ensure utility module exists and has the right type', (t) => {
  // const { CloudEvent, CloudEventValidator: V, CloudEventUtilities: U } = require('../src/')
  t.ok(CloudEvent)
  t.ok(V)
  t.ok(U)
  t.equal(typeof U, 'object')

  {
    const CloudEventExports = require('../src') // reference the library
    assert(CloudEventExports !== null)
    assert(CloudEventExports.CloudEventUtilities !== null)
  }

  {
    const U = require('../src/utility') // direct reference to the library
    t.ok(U)
    t.equal(typeof U, 'object')

    // optional, using some standard Node.js assert statements, as a sample
    assert(U !== null)
    assert.strictEqual(typeof U, 'object')
  }

  t.end()
})

/** @test {CloudEventUtilities} */
test('ensure utility function createFromObject exists and works in the right way: initial tests', (t) => {
  t.ok(U)
  t.ok(U.createFromObject)
  t.equal(typeof U.createFromObject, 'function')

  // ensure parity (same behavior) with normal creation of events, important

  {
    // undefined mandatory argument (so default value apply) and no properties,
    // but no strict mode nor validation: expected success
    const ce = U.createFromObject(undefined) // undefined, so default value apply
    // assert(ce !== null)
    t.ok(ce)
  }

  {
    // default type for mandatory argument and no properties, but no strict mode nor validation: expected success
    // options: strict flag set but no validation triggered
    const ce = U.createFromObject(undefined, { ...valOptionsStrict })
    // assert(ce !== null)
    t.ok(ce)
  }

  // test with some bad arguments (expected errors)
  t.throws(function () {
    // undefined mandatory argument (so default apply), options: strict validation, only valid instances
    const ce = U.createFromObject(undefined, { ...valOptionsStrict, ...valOnlyValidInstance })
    assert(ce !== null) // wrong assertion, but never executed
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')
  t.throws(function () {
    const ce = U.createFromObject(null) // null mandatory argument
    // expect failure here because of null main argument
    assert(ce !== null) // wrong assertion, but never executed
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')
  t.throws(function () {
    // null mandatory argument but specified strict mode and no validation
    const ce = U.createFromObject(null, { ...valOptionsStrict })
    assert(ce !== null)
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')
  t.throws(function () {
    const ce = U.createFromObject([]) // wrong type for mandatory argument
    assert(ce !== null)
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')
  t.throws(function () {
    const ce = U.createFromObject('Sample string') // wrong type for mandatory argument
    assert(ce !== null)
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')

  t.throws(function () {
    // good type for ce but no properties
    // options: strict mode, only valid instances
    const ce = U.createFromObject({}, { ...valOptionsStrict, ...valOnlyValidInstance })
    assert(ce !== null)
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')
  t.throws(function () {
    // good type for ce but no properties and strict flag
    // options: empty strict override, valid all
    const ce = U.createFromObject({ ...ceOptionsStrict }, { ...valOptionsNoOverride, ...valOnlyValidAllInstance })
    assert(ce !== null)
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')
  t.throws(function () {
    // good type for ce but no properties, strict flag
    // options: empty strict override, only valid instances
    const ce = U.createFromObject({ ...ceOptionsStrict }, { ...valOptionsNoOverride, ...valOnlyValidInstance })
    assert(ce !== null)
  }, Error, 'Expected exception when ask to create a CloudEvent with wrong arguments')

  t.end()
})

/** @test {CloudEventUtilities} */
test('ensure utility function createFromObject exists and works in the right way', (t) => {
  t.ok(U.createFromObject)

  // test with some good arguments but ce mandatory arguments missing
  // (but with no strict mode in ce) or no validation requested (expected success)
  {
    // good type for ce but no properties, no strict mode
    // options: no validation: expected success
    const ce = U.createFromObject({})
    // assert(ce !== null)
    t.ok(ce)
  }
  {
    // good type for ce but no properties, no strict mode: expected success
    // options: strict flag set but validation not requested
    const ce = U.createFromObject({}, { ...valOptionsStrict, ...valOnlyValidAllInstance })
    // assert(ce !== null)
    t.ok(ce)
  }

  // reference some imported variables, even when not used, mainly to avoid linting errors
  assert(valDebugInfoDisable !== null)
  assert(valDebugInfoEnable !== null)
  assert(valExcludeExtensionsDisable !== null)
  assert(valExcludeExtensionsEnable !== null)

  // test with other bad arguments (missing/wrong/duplicated ce mandatory arguments)
  const objMinimalBadSource = { id: '1/minimal-bad-source', type: ceNamespace, source: 'source (bad in strict mode)', data: null }
  {
    const obj = { ...objMinimalBadSource, ...ceOptionsNoStrict }
    const ce = U.createFromObject(obj, valDebugInfoDisable) // show usage of debug info show, same value of its default used here
    t.ok(ce)
    t.ok(ce.isValid()) // ce is not strict
    t.ok(ce.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ce.isValid(valOptionsStrict)) // force validation strict

    // ce with strict mode and source bad but given, so ce creation expected
    const objStrict = { ...objMinimalBadSource, ...ceOptionsStrict }
    const ceStrict = U.createFromObject(objStrict, valDebugInfoDisable) // expected success because no validation requested
    t.ok(ceStrict)
    // console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ceStrict, null, 'ceStrict')}`)
    // console.log(`DEBUG - cloudEvent details: ${JSON.stringify(ceStrict)}`)
    t.notOk(ceStrict.isValid()) // ce is already strict
    t.ok(ceStrict.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ceStrict.isValid(valOptionsStrict)) // force validation strict
  }
  t.throws(function () {
    const ce = U.createFromObject(objMinimalBadSource, { ...valOptionsStrict, ...valOnlyValidInstance })
    // console.log(`DEBUG - cloudEvent details: ${JSON.stringify(ce)}`)
    // console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ce, null, 'ce')}`)
    // console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ce, { ...valOptionsStrict }, 'ce')}`)
    assert(ce !== null) // wrong assertion but never executed
  }, Error, 'Expected exception when ask to create a CloudEvent with not valid properties and validation requested')

  const objFullBadDatatype = {
    id: '1/full/string-data/no-strict',
    type: ceNamespace,
    source: ceServerUrl,
    data: 'data as a string',
    ...ceCommonOptions,
    ...ceCommonExtensions
  }
  {
    // create an instance with a string data attribute (and default datacontenttype), but with strict flag disabled: expected success ...
    // bad because of the default datacontenttype, but validation error only in strict mode
    const obj = { ...objFullBadDatatype, ...ceOptionsNoStrict }
    const ce = U.createFromObject(obj, { ...valDebugInfoDisable, ...valExcludeExtensionsDisable }) // default options
    t.ok(ce)
    t.ok(ce.isValid()) // ce is not strict
    t.ok(ce.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ce.isValid(valOptionsStrict)) // force validation strict
    t.ok(ce.exampleextension) // ensure the given extension is present here
  }

  {
    // exclude (do not use) extensions from the given object
    const obj = { ...objFullBadDatatype, ...ceOptionsNoStrict }
    const ce = U.createFromObject(obj, { ...valDebugInfoDisable, ...valExcludeExtensionsEnable })
    t.ok(ce)
    t.ok(ce.isValid()) // ce is not strict
    t.ok(ce.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ce.isValid(valOptionsStrict)) // force validation strict
    t.notOk(ce.exampleextension) // ensure the given extension is not present here
  }

  {
    const objStrict = { ...objFullBadDatatype, ...ceOptionsStrict }
    const ceStrict = U.createFromObject(objStrict, { ...valDebugInfoDisable, ...valExcludeExtensionsDisable }) // default options
    t.ok(ceStrict) // expected success because no validation requested
    t.notOk(ceStrict.isValid()) // ce is already strict
    t.ok(ceStrict.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ceStrict.isValid(valOptionsStrict)) // force validation strict
    t.ok(ceStrict.exampleextension) // ensure the given extension is present here
  }

  {
    // exclude (do not use) extensions from the given object
    const objStrict = { ...objFullBadDatatype, ...ceOptionsStrict }
    const ceStrict = U.createFromObject(objStrict, { ...valDebugInfoDisable, ...valExcludeExtensionsEnable })
    t.ok(ceStrict) // expected success because no validation requested
    t.notOk(ceStrict.isValid()) // ce is already strict
    t.ok(ceStrict.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ceStrict.isValid(valOptionsStrict)) // force validation strict
    t.notOk(ceStrict.exampleextension) // ensure the given extension is not present here
  }

  t.throws(function () {
    const ce = U.createFromObject(objFullBadDatatype, { ...valOptionsStrict, ...valOnlyValidInstance, ...valDebugInfoDisable })
    // const ce = U.createFromObject(objFullBadDatatype, { ...valOptionsStrict, ...valOnlyValidInstance, ...valDebugInfoEnable })
    assert(ce !== null) // wrong assertion but never executed
  }, Error, 'Expected exception when ask to create a CloudEvent with not valid properties and validation requested')

  // more tests later ...

  t.end()
})

/** @test {CloudEventUtilities} */
test('ensure utility function createFromObject exists and works in the right way: test with good arguments and attributes', (t) => {
  t.ok(U.createFromObject)

  /*
  // test with some good arguments for ce and good attributes
  {
    // TODO: ... wip
  }
  */

  // test with some good arguments: ce in strict mode (even with good extensions) and only valid ce false/true
  // TODO: ... wip

  t.end()
})
