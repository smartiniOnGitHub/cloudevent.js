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

// get factory for instances to test, in its own source
const ceFactory = require('../example/common-example-factory')

// import some common test data
const {
  ceCommonData,
  ceCommonExtensions,
  ceCommonOptionsWithFixedTime,
  ceNamespace,
  ceOptionsNoStrict,
  ceOptionsStrict,
  ceOptionsWithDataInBase64,
  ceServerUrl,
  valDebugInfoDisable,
  valDebugInfoEnable,
  valExcludeExtensionsDisable,
  valExcludeExtensionsEnable,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
} = require('../example/common-example-data')

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
  const objMinimalBadSource = {
    id: '1/minimal-bad-source',
    type: ceNamespace,
    source: 'source (bad in strict mode)',
    data: null
  }
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
    // console.log(`DEBUG | ${CloudEvent.dumpValidationResults(ceStrict, null, 'ceStrict')}`)
    // console.log(`DEBUG | cloudEvent details: ${JSON.stringify(ceStrict)}`)
    t.notOk(ceStrict.isValid()) // ce is already strict
    t.ok(ceStrict.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ceStrict.isValid(valOptionsStrict)) // force validation strict
  }
  t.throws(function () {
    const ce = U.createFromObject(objMinimalBadSource, { ...valOptionsStrict, ...valOnlyValidInstance })
    // console.log(`DEBUG | cloudEvent details: ${JSON.stringify(ce)}`)
    // console.log(`DEBUG | ${CloudEvent.dumpValidationResults(ce, null, 'ce')}`)
    // console.log(`DEBUG | ${CloudEvent.dumpValidationResults(ce, { ...valOptionsStrict }, 'ce')}`)
    assert(ce !== null) // wrong assertion but never executed
  }, Error, 'Expected exception when ask to create a CloudEvent with not valid properties and validation requested')

  const objFullBadDatatype = {
    id: '1/full/string-data/no-strict',
    type: ceNamespace,
    source: ceServerUrl,
    data: 'data as a string',
    ...ceCommonOptionsWithFixedTime,
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
    const ceStrict = U.createFromObject(objStrict, {
      ...valDebugInfoEnable, // override, as a sample
      ...valExcludeExtensionsEnable // override to exclude all non-standard properties (extensions)
    })
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

  // test with some good arguments for ce and good attributes
  // use directly strict ce for better/safer compliance
  const objFullBinaryData = {
    id: '1/full/binary-data/strict',
    type: ceNamespace,
    source: ceServerUrl,
    data: null, // data must be null here
    ...ceOptionsWithDataInBase64,
    ...ceCommonExtensions
  }
  t.notOk(objFullBinaryData.data)
  {
    const objStrict = { ...objFullBinaryData, ...ceOptionsStrict }
    const ceStrict = U.createFromObject(objStrict) // omit options, as a sample (use its defaults)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict)) // omit options, as a sample (use its defaults)
  }
  {
    const objStrict = { ...objFullBinaryData, ...ceOptionsStrict }
    const ceStrict = U.createFromObject(objStrict, { ...valOptionsStrict, ...valOnlyValidInstance, ...valDebugInfoEnable }) // force strict validation, return only if valid, but enable print debug info (as a sample)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict, { ...valDebugInfoEnable, ...valOptionsStrict })) // force defaults: validation strict (already strict), but enable print debug info (as a sample)
  }

  const objFullData = {
    id: '1/full/normal-data/strict',
    type: ceNamespace,
    source: ceServerUrl,
    data: ceCommonData,
    ...ceCommonOptionsWithFixedTime,
    ...ceCommonExtensions
  }
  t.ok(objFullData.data)
  {
    const objStrict = { ...objFullData, ...ceOptionsStrict }
    const ceStrict = U.createFromObject(objStrict) // omit options, as a sample (use its defaults)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict)) // omit options, as a sample (use its defaults)
  }
  {
    const objStrict = { ...objFullData, ...ceOptionsStrict }
    const ceStrict = U.createFromObject(objStrict, { ...valOptionsStrict, ...valOnlyValidInstance, ...valDebugInfoEnable }) // force strict validation, return only if valid, but enable print debug info (as a sample)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict, { ...valDebugInfoEnable, ...valOptionsStrict })) // force defaults: validation strict (already strict), but enable print debug info (as a sample)
  }

  // more tests later ...

  t.end()
})

/** @test {CloudEventUtilities} */
test('ensure utility function cloneToObject exists and works in the right way', (t) => {
  t.ok(U.cloneToObject)
  t.equal(typeof U.cloneToObject, 'function')

  // undefined mandatory argument (so default value apply, not a ce instance) and no properties: expected failure
  t.throws(function () {
    const ce = U.cloneToObject(undefined) // undefined, so default value apply
    assert(ce !== null) // wrong assertion but never executed
  }, Error, 'Expected exception when ask to clone a bad CloudEvent')

  // undefined mandatory argument (so default value apply, not a ce instance) and strict mode nor validation: expected failure
  t.throws(function () {
    const ce = U.cloneToObject(undefined, { ...valOptionsStrict })
    assert(ce !== null) // wrong assertion but never executed
  }, Error, 'Expected exception when ask to clone a bad CloudEvent')

  // test with other bad arguments (missing/wrong/duplicated ce mandatory arguments)
  {
    // create an instance with a string data attribute (and default datacontenttype), but with strict flag disabled: expected success ...
    // bad because of the default datacontenttype, but validation error only in strict mode
    const ce = ceFactory.createMinimalBadSource()
    t.ok(ce)
    t.ok(CloudEvent.isCloudEvent(ce))
    t.ok(ce.isValid()) // ce is not strict
    t.ok(ce.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ce.isValid(valOptionsStrict)) // force validation strict

    const obj = U.cloneToObject(ce, { ...valDebugInfoDisable, ...valOptionsNoStrict }) // force defaults: validation no strict (already set), print debug info disable
    t.ok(obj)
    t.notOk(CloudEvent.isCloudEvent(obj)) // obj is not a CloudEvent instance
    t.notOk(obj.isValid) // ensure that method/function does not exist in obj

    t.throws(function () {
      // expected failure because this ce is not valid in strict mode
      const objOnlyIfValid = U.cloneToObject(ce, { ...valDebugInfoDisable, ...valOptionsStrict, ...valOnlyValidInstance }) // override some options: validation strict, return obj only if ce is valid
      assert(objOnlyIfValid !== null) // wrong assertion but never executed
    }, Error, 'Expected exception when ask to clone a not valid CloudEvent (depending on validation options)')
  }

  {
    // create an instance with a string data attribute, with strict flag disabled: expected success ...
    // bad because of the default datacontenttype, but validation error only in strict mode
    const ce = ceFactory.createFullTextDataBadContentType()
    t.ok(ce)
    t.ok(CloudEvent.isCloudEvent(ce))
    t.ok(ce.isValid()) // ce is not strict
    t.ok(ce.isValid(valOptionsNoStrict)) // force validation no strict
    t.notOk(ce.isValid(valOptionsStrict)) // force validation strict

    const obj = U.cloneToObject(ce, { ...valDebugInfoDisable, ...valOptionsNoStrict }) // force defaults: validation no strict (already set), print debug info disable
    t.ok(obj)
    t.notOk(CloudEvent.isCloudEvent(obj)) // obj is not a CloudEvent instance
    t.notOk(obj.isValid) // ensure that method/function does not exist in obj

    t.throws(function () {
      // expected failure because this ce is not valid in strict mode
      const objOnlyIfValid = U.cloneToObject(ce, { ...valDebugInfoDisable, ...valOptionsStrict, ...valOnlyValidInstance }) // override some options: validation strict, return obj only if ce is valid
      assert(objOnlyIfValid !== null) // wrong assertion but never executed
    }, Error, 'Expected exception when ask to clone a not valid CloudEvent (depending on validation options)')
  }

  // more tests later ...

  t.end()
})

/** @test {CloudEventUtilities} */
test('ensure utility function cloneToObject exists and works in the right way: test with good arguments and attributes', (t) => {
  t.ok(U.cloneToObject)

  // test with some good arguments for ce and good attributes
  // use directly strict ce instances in some cases for better/safer compliance
  {
    // create an instance with a string data attribute, with strict flag disabled: expected success ...
    // good even in strict mode
    const ce = ceFactory.createFullTextData()
    t.ok(ce)
    t.ok(CloudEvent.isCloudEvent(ce))
    t.ok(ce.isValid()) // ce is not strict
    t.ok(ce.isValid(valOptionsNoStrict)) // force validation no strict
    t.ok(ce.isValid(valOptionsStrict)) // force validation strict

    const obj = U.cloneToObject(ce, {
      ...valDebugInfoDisable, // default
      ...valOptionsStrict, // override to strict
      ...valOnlyValidInstance, // override
      ...valExcludeExtensionsDisable // default
    })
    t.ok(obj)
    t.notOk(CloudEvent.isCloudEvent(obj)) // obj is not a CloudEvent instance
    t.notOk(obj.isValid) // ensure that method/function does not exist in obj
    t.ok(obj.exampleextension) // ensure a specific extension property has not been filtered out in obj
    t.ok(ce.exampleextension) // ensure a specific extension property is still present in the ce

    // the same but filtering out extensions, as a sample
    const objNoExtensions = U.cloneToObject(ce, {
      ...valDebugInfoEnable, // override, as a sample
      ...valOptionsStrict, // override to strict
      ...valOnlyValidInstance, // override
      ...valExcludeExtensionsEnable // override to exclude all non-standard properties (extensions)
    })
    t.ok(objNoExtensions)
    t.notOk(CloudEvent.isCloudEvent(objNoExtensions)) // objNoExtensions is not a CloudEvent instance
    t.notOk(obj.isValid) // ensure that method/function does not exist in objNoExtensions
    // ensure extension proprties does not exist in objNoExtensions, but still exist in ce
    t.notOk(objNoExtensions.exampleextension)
    t.ok(ce.exampleextension) // ensure a specific extension property is still present in the ce
  }

  {
    const ce = ceFactory.createFullStrictJSONTextData()
    t.ok(ce)
    t.ok(CloudEvent.isCloudEvent(ce))
    t.ok(ce.isValid()) // ce is strict

    const obj = U.cloneToObject(ce, {
      ...valDebugInfoDisable, // default
      ...valOptionsStrict, // override to strict
      ...valOnlyValidInstance, // override
      ...valExcludeExtensionsDisable // default
    })
    t.ok(obj)
    t.notOk(CloudEvent.isCloudEvent(obj)) // obj is not a CloudEvent instance
    t.notOk(obj.isValid) // ensure that method/function does not exist in obj
    t.ok(obj.exampleextension) // ensure a specific extension property has not been filtered out in obj
    t.ok(ce.exampleextension) // ensure a specific extension property is still present in the ce
    // ensure changes to the cloned obj does not impact ce instance
    // but this depnds on ce content (if nested or not) and then clone method used (by default shallow, or full/structured)
    delete obj.exampleextension // its value is a string here
    t.notOk(obj.exampleextension) // ensure that property doesn't exist anymore
    t.ok(ce.exampleextension) // ensure that property is still present in the ce
    delete obj.data // its value is a string here
    t.notOk(obj.data) // ensure that property doesn't exist anymore
    t.ok(ce.data) // ensure that property is still present in the ce
  }

  {
    const ce = ceFactory.createFullStrict()
    t.ok(ce)
    t.ok(CloudEvent.isCloudEvent(ce))
    t.ok(ce.isValid()) // ce is strict

    const obj = U.cloneToObject(ce, {
      ...valDebugInfoDisable, // default
      ...valOptionsStrict, // override to strict
      ...valOnlyValidInstance, // override
      ...valExcludeExtensionsDisable // default
    })
    t.ok(obj)
    t.notOk(CloudEvent.isCloudEvent(obj)) // obj is not a CloudEvent instance
    t.notOk(obj.isValid) // ensure that method/function does not exist in obj
    t.ok(obj.exampleextension) // ensure a specific extension property has not been filtered out in obj
    t.ok(ce.exampleextension) // ensure a specific extension property is still present in the ce
    // ensure changes to the cloned obj does not impact ce instance
    // but this depnds on ce content (if nested or not) and then clone method used (by default shallow, or full/structured)
    delete obj.exampleextension // its value is a string here
    t.notOk(obj.exampleextension) // ensure that property doesn't exist anymore
    t.ok(ce.exampleextension) // ensure that property is still present in the ce
    delete obj.data // its value is a string here
    t.notOk(obj.data) // ensure that property doesn't exist anymore
    t.ok(ce.data) // ensure that property is still present in the ce
  }

  {
    const ce = ceFactory.createFullNestedDataStrict()
    t.ok(ce)
    t.ok(CloudEvent.isCloudEvent(ce))
    t.ok(ce.isValid()) // ce is strict

    const obj = U.cloneToObject(ce, {
      ...valDebugInfoDisable, // default
      ...valOptionsStrict, // override to strict
      ...valOnlyValidInstance, // override
      ...valExcludeExtensionsDisable // default
    })
    t.ok(obj)
    t.notOk(CloudEvent.isCloudEvent(obj)) // obj is not a CloudEvent instance
    t.notOk(obj.isValid) // ensure that method/function does not exist in obj
    t.ok(obj.exampleextension) // ensure a specific extension property has not been filtered out in obj
    t.ok(ce.exampleextension) // ensure a specific extension property is still present in the ce
    // ensure changes to the cloned obj does not impact ce instance
    // but this depnds on ce content (if nested or not) and then clone method used (by default shallow, or full/structured)
    delete obj.exampleextension // its value is a string here
    t.notOk(obj.exampleextension) // ensure that property doesn't exist anymore
    t.ok(ce.exampleextension) // ensure that property is still present in the ce
    // change data nested attribute, as a sample
    t.ok(obj.data.nested1.nested2)
    // console.log(`DEBUG | obj.data: ${JSON.stringify(obj.data)}`)
    delete obj.data.nested1.nested2
    t.notOk(obj.data.nested1.nested2) // ensure that attribute has been deleted
    // t.ok(ce.data.nested1.nested2) // true when cloned in a full/structured way
    t.notOk(ce.data.nested1.nested2) // that attribute has been deleted even here, because of the shallow clone; pay attention
    // console.log(`DEBUG | obj.data: ${JSON.stringify(obj.data)}`)
    // console.log(`DEBUG | ce.data:  ${JSON.stringify(ce.data)}`)

    delete obj.data // its value is a string here
    t.notOk(obj.data) // ensure that property doesn't exist anymore
    t.ok(ce.data) // ensure that property is still present in the ce
  }

  // more tests later ...

  t.end()
})
