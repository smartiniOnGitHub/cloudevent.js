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
  ceArrayData,
  ceCommonData,
  ceCommonExtensions,
  // ceCommonOptions,
  ceCommonOptionsForTextDataStrict,
  ceCommonOptionsStrict,
  ceCommonOptionsWithAllOptionalsNullStrict,
  ceCommonOptionsWithSomeOptionalsNullStrict,
  ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded,
  // ceDataNested,
  ceDataXMLAsString,
  ceNamespace,
  // ceOptionsNoStrict,
  ceOptionsStrict,
  ceServerUrl,
  commonEventTime,
  fixedEventTime,
  getRandomString,
  valDebugInfoDisable,
  valDebugInfoEnable,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
} = require('../example/common-example-data')

/** create a sample string big (more than 64 KB) */
const ceBigStringLength = 100_000
const ceBigString = getRandomString(ceBigStringLength) // a random string with n chars

/** @test {CloudEvent} */
test('ensure serialization functions exists (check only the static method here)', (t) => {
  // t.plan(9)

  {
    const { CloudEvent } = require('../src/') // get references via destructuring
    t.ok(CloudEvent)
    // optional, using some standard Node.js assert statements, as a sample
    assert(CloudEvent !== null)
    assert.strictEqual(typeof CloudEvent, 'function')
    assert(ceFactory.createEmpty() instanceof CloudEvent)
    assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    t.ok(CloudEvent)
    t.equal(typeof CloudEvent, 'function')
    t.equal(ceFactory.createEmpty() instanceof CloudEvent, true)
    t.equal(CloudEvent.mediaType(), 'application/cloudevents+json')

    const ceSerialize = CloudEvent.serializeEvent
    assert(ceSerialize !== null)
    assert(typeof ceSerialize === 'function')
    t.ok(ceSerialize)
    t.equal(typeof ceSerialize, 'function')

    const ceDeserialize = CloudEvent.deserializeEvent
    assert(ceDeserialize !== null)
    assert(typeof ceDeserialize === 'function')
    t.ok(ceDeserialize)
    t.equal(typeof ceDeserialize, 'function')
  }

  t.end()
})

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  // t.ok(CloudEvent)

  {
    // create an instance with a sample data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFull = ceFactory.createFull({ ...fixedEventTime })
    assert(ceFull !== null)
    t.ok(CloudEvent.isCloudEvent(ceFull))
    t.ok(ceFull)
    t.ok(!ceFull.isStrict)
    t.ok(ceFull.isValid())
    t.ok(ceFull.validate().length === 0)
    t.ok(ceFull.validate(valOptionsNoStrict).length === 0)
    t.ok(ceFull.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFull))
    t.ok(CloudEvent.validateEvent(ceFull).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, valOptionsStrict).length === 0)
    t.equal(ceFull.datacontenttype, CloudEvent.datacontenttypeDefault())
    t.ok(CloudEvent.isDatacontenttypeJSONEvent(ceFull))
    const ceFullAsString = ceFull.toString()
    // console.log(`DEBUG | ceFullAsString: ${ceFullAsString}`)
    t.ok(V.isString(ceFullAsString))
    const ceFullPayloadDumped = T.dumpObject(ceFull.payload, 'payload')
    // console.log(`DEBUG | ceFullPayloadDumped: ${ceFullPayloadDumped}`)
    t.ok(V.isString(ceFullPayloadDumped))
    t.ok(ceFullPayloadDumped.length < 1024)

    t.throws(function () {
      const ceFullSerialized = CloudEvent.serializeEvent(undefined)
      assert(ceFullSerialized === null) // never executed
    }, Error, 'Expected exception when serializing an undefined / null CloudEvent instance')
    t.throws(function () {
      const ceFullSerialized = CloudEvent.serializeEvent(null)
      assert(ceFullSerialized === null) // never executed
    }, Error, 'Expected exception when serializing an undefined / null CloudEvent instance')

    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
    t.ok(ceFullSerializedStatic)
    const ceFullSerialized = ceFull.serialize()
    t.ok(ceFullSerialized)
    assert(ceFullSerializedStatic === ceFullSerialized)
    t.strictSame(ceFullSerializedStatic, ceFullSerialized)
    const ceSerialize = CloudEvent.serializeEvent
    assert(ceSerialize !== null)
    t.ok(ceSerialize)
    const ceFullSerializedFunction = ceSerialize(ceFull)
    t.ok(ceFullSerializedFunction)
    t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
    t.strictSame(ceFullSerializedFunction, ceFullSerialized)

    const ceFullSerializedComparison = `{"id":"2/full","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0","source":"/test","data":{"hello":"world","year":2020,"enabled":true},"specversion":"1.0","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${T.timestampToString(commonEventTime)}","subject":"subject","exampleextension":"value"}`
    t.strictSame(ceFullSerialized, ceFullSerializedComparison)
    // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
    const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    // ceFullDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFull, ceFullDeserialized)
    t.ok(!CloudEvent.isCloudEvent(ceFullDeserialized))
    t.ok(!ceFullDeserialized.isStrict) // ok here, but doesn't mattter because is not a real CloudEvent instance

    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFull, valOnlyValidAllInstance)
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFull, valOnlyValidInstance)
    t.ok(ceFullSerializedOnlyValidTrue)

    {
      const ceFullBad = ceFactory.createFull() // at the moment ce is good
      assert(ceFullBad !== null)
      t.ok(ceFullBad)
      ceFullBad.id = null // remove a mandatory attribute now (so ce won't be valid anymore), to let serialization of only valid instances fail
      t.ok(!ceFullBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = ceSerialize(ceFullBad, valOnlyValidAllInstance)
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = ceSerialize(ceFullBad, valOnlyValidInstance)
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }

    // test to ensure that old style extensions are not serialized
    const ceFullSerializedStaticWithoutExtensionsProperty = CloudEvent.serializeEvent({ ...ceFull, extensions: { exampleexttoskip: 'valueToSkip' } })
    t.ok(ceFullSerializedStaticWithoutExtensionsProperty)
    t.strictSame(ceFullSerializedStaticWithoutExtensionsProperty.search('exampleexttoskip'), -1)
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = ceFactory.createFullStrict({ ...fixedEventTime })
    assert(ceFullStrict !== null)
    t.ok(CloudEvent.isCloudEvent(ceFullStrict))
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.validate().length === 0)
    t.ok(ceFullStrict.validate(valOptionsStrict).length === 0)
    t.ok(ceFullStrict.validate(valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFullStrict))
    t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, valOptionsStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, valOptionsNoStrict).length === 0)
    t.equal(ceFullStrict.datacontenttype, CloudEvent.datacontenttypeDefault())
    t.ok(CloudEvent.isDatacontenttypeJSONEvent(ceFullStrict))
    const ceFullStrictAsString = ceFullStrict.toString()
    // console.log(`DEBUG | ceFullStrictAsString: ${ceFullStrictAsString}`)
    t.ok(V.isString(ceFullStrictAsString))
    const ceFullStrictPayloadDumped = T.dumpObject(ceFullStrict.payload, 'payload')
    // console.log(`DEBUG | ceFullStrictPayloadDumped: ${ceFullStrictPayloadDumped}`)
    t.ok(V.isString(ceFullStrictPayloadDumped))
    t.ok(ceFullStrictPayloadDumped.length < 1024)

    t.throws(function () {
      const ceFullSerialized = CloudEvent.serializeEvent(undefined)
      assert(ceFullSerialized === null) // never executed
    }, Error, 'Expected exception when serializing an undefined / null CloudEvent instance')
    t.throws(function () {
      const ceFullSerialized = CloudEvent.serializeEvent(null)
      assert(ceFullSerialized === null) // never executed
    }, Error, 'Expected exception when serializing an undefined / null CloudEvent instance')

    const ceFullStrictSerializedStatic = CloudEvent.serializeEvent(ceFullStrict)
    t.ok(ceFullStrictSerializedStatic)
    const ceFullStrictSerialized = ceFullStrict.serialize()
    t.ok(ceFullStrictSerialized)
    assert(ceFullStrictSerializedStatic === ceFullStrictSerialized)
    t.strictSame(ceFullStrictSerializedStatic, ceFullStrictSerialized)
    const ceSerialize = CloudEvent.serializeEvent
    assert(ceSerialize !== null)
    t.ok(ceSerialize)
    const ceFullStrictSerializedFunction = ceSerialize(ceFullStrict)
    t.ok(ceFullStrictSerializedFunction)
    t.strictSame(ceFullStrictSerializedFunction, ceFullStrictSerializedStatic)
    t.strictSame(ceFullStrictSerializedFunction, ceFullStrictSerialized)

    const ceFullStrictSerializedComparison = `{"id":"2/full-strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0","source":"/test","data":{"hello":"world","year":2020,"enabled":true},"specversion":"1.0","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${T.timestampToString(commonEventTime)}","subject":"subject","strictvalidation":true,"exampleextension":"value"}`
    t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
    // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
    const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    // ceFullStrictDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullStrictDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFullStrict, ceFullStrictDeserialized)
    t.ok(!CloudEvent.isCloudEvent(ceFullStrictDeserialized))
    t.ok(!ceFullStrictDeserialized.isStrict) // wrong here, but doesn't mattter because is not a real CloudEvent instance

    const ceFullStrictSerializedOnlyValidFalse = ceSerialize(ceFullStrict, valOnlyValidAllInstance)
    t.ok(ceFullStrictSerializedOnlyValidFalse)
    const ceFullStrictSerializedOnlyValidTrue = ceSerialize(ceFullStrict, valOnlyValidInstance)
    t.ok(ceFullStrictSerializedOnlyValidTrue)

    {
      const ceFullStrictBad = ceFactory.createFullStrict() // at the moment ce is good
      assert(ceFullStrictBad !== null)
      t.ok(ceFullStrictBad)
      ceFullStrictBad.id = null // remove a mandatory attribute now (so ce won't be valid anymore), to let serialization of only valid instances fail
      t.ok(!ceFullStrictBad.isValid())
      const ceFullStrictBadSerializedOnlyValidFalse = ceSerialize(ceFullStrictBad, valOnlyValidAllInstance)
      t.ok(ceFullStrictBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullStrictBadSerializedOnlyValidTrue = ceSerialize(ceFullStrictBad, valOnlyValidInstance)
        assert(ceFullStrictBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }

    // test to ensure that old style extensions are not serialized
    const ceFullStrictSerializedStaticWithoutExtensionsProperty = CloudEvent.serializeEvent({ ...ceFullStrict, extensions: { exampleexttoskip: 'valueToSkip' } })
    t.ok(ceFullStrictSerializedStaticWithoutExtensionsProperty)
    t.strictSame(ceFullStrictSerializedStaticWithoutExtensionsProperty.search('exampleexttoskip'), -1)
  }

  t.end()
})

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contenttype and empty serialization options, expect error', (t) => {
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  {
    // create an instance with non default contenttype (other options default): expected success ...
    // when I try to serialize it without specifying serialization options, expect to have an error raised ...
    const ceFullOtherContentType = ceFactory.createFullXMLData() // create a good ce
    assert(ceFullOtherContentType !== null)
    t.ok(ceFullOtherContentType)
    t.ok(ceFullOtherContentType.isValid())
    t.ok(!ceFullOtherContentType.isStrict)
    t.ok(ceFullOtherContentType.isValid({ ...valOptionsStrict }))
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = ceFullOtherContentType.serialize()
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentType, {
        encoder: 'encoderToXmlSample'
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentType, {
        encodedData: true
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const flag = CloudEvent.isStrictEvent(undefined)
      assert(flag === false) // never executed
    }, Error, 'Expected exception when trying to get the strict mode for an undefined/null CloudEvent instance')
    t.throws(function () {
      const flag = CloudEvent.isStrictEvent(null)
      assert(flag === false) // never executed
    }, Error, 'Expected exception when trying to get the strict mode for an undefined/null CloudEvent instance')
    t.throws(function () {
      const flag = CloudEvent.isStrictEvent({})
      assert(flag === false) // never executed
    }, Error, 'Expected exception when trying to get the strict mode for for not a CloudEvent instance')

    {
      const ce = ceFullOtherContentType
      CloudEvent.setStrictExtensionInEvent(ce, false)
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, false)
    }
    {
      const ce = ceFullOtherContentType
      CloudEvent.setStrictExtensionInEvent(ce, true)
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, true)
    }

    {
      const ceFullOtherContentTypeBad = ceFactory.createFullXMLData() // create a good ce
      ceFullOtherContentTypeBad.id = null // but change its data, to become bad here (change this is enough)
      ceFullOtherContentTypeBad.data = ceCommonData // but change its data, to become bad here (change this is enough)
      assert(ceFullOtherContentTypeBad !== null)
      t.ok(ceFullOtherContentTypeBad)
      t.ok(!ceFullOtherContentTypeBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeBad, {
        encodedData: ceDataXMLAsString,
        ...valOnlyValidAllInstance
      })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeBad, {
          encodedData: ceDataXMLAsString,
          ...valOnlyValidInstance
        })
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  }

  {
    // the same but with strict mode enabled ...
    // expect success even if content type is not default and data is not a string,
    // anyway use encoder/decoder to let serialization/deserialization work in this case (strict) ...
    const ceFullOtherContentTypeStrict = ceFactory.createFullXMLDataStrict() // create a good ce
    assert(ceFullOtherContentTypeStrict !== null)
    t.ok(ceFullOtherContentTypeStrict)
    t.ok(ceFullOtherContentTypeStrict.isValid())
    t.ok(ceFullOtherContentTypeStrict.isStrict)
    t.throws(function () {
      const ceFullOtherContentTypeStrictSerialized = ceFullOtherContentTypeStrict.serialize()
      assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeStrictSerialized = ceFullOtherContentTypeStrict.serialize({
        encoder: null,
        encodedData: null
      })
      assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeStrictSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, valOnlyValidInstance)
      assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeStrictSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encoder: null,
        encodedData: null,
        ...valOnlyValidInstance
      })
      assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encoder: 'encoderToXmlSample'
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encodedData: true
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const flag = CloudEvent.isStrictEvent(undefined)
      assert(flag === false) // never executed
    }, Error, 'Expected exception when trying to get the strict mode for an undefined/null CloudEvent instance')
    t.throws(function () {
      const flag = CloudEvent.isStrictEvent(null)
      assert(flag === false) // never executed
    }, Error, 'Expected exception when trying to get the strict mode for an undefined/null CloudEvent instance')
    t.throws(function () {
      const flag = CloudEvent.isStrictEvent({})
      assert(flag === false) // never executed
    }, Error, 'Expected exception when trying to get the strict mode for for not a CloudEvent instance')

    {
      const ce = ceFullOtherContentTypeStrict
      CloudEvent.setStrictExtensionInEvent(ce, false)
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, false)
    }
    {
      const ce = ceFullOtherContentTypeStrict
      CloudEvent.setStrictExtensionInEvent(ce, true)
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, true)
    }

    {
      const ceFullOtherContentTypeStrictBad = ceFactory.createFullXMLDataStrict() // create a good ce
      assert(ceFullOtherContentTypeStrictBad !== null)
      t.ok(ceFullOtherContentTypeStrictBad)
      ceFullOtherContentTypeStrictBad.id = null // remove a mandatory attribute now (so ce won't be valid anymore), to let serialization of only valid instances fail
      // ceFullOtherContentTypeStrictBad.data = ceCommonData // but change its data, to become bad here (but no effect in following tests here)
      t.ok(!ceFullOtherContentTypeStrictBad.isValid())
      const ceFullStrictBadSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
        encodedData: ceDataXMLAsString,
        ...valOnlyValidAllInstance
      })
      t.ok(ceFullStrictBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullStrictBadSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
          encodedData: ceDataXMLAsString,
          ...valOnlyValidInstance
        })
        assert(ceFullStrictBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  }

  t.end()
})

// sample encoding function, to use in tests here
function encoderToXmlSample (data) {
  // return ceDataAsXmlString
  // return data.toString()
  return '<data encoder="sample" />'
}

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contenttype and right serialization options, expect success', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(encoderToXmlSample)
  t.ok(V.isFunction(encoderToXmlSample))
  t.ok(!V.ensureIsFunction(encoderToXmlSample, 'encoderToXmlSample')) // no error returned

  {
    // create an instance with non default contenttype (other options default): expected success ...
    // when I try to serialize specifying right serialization options, expect success ...
    const ceFullOtherContentType = ceFactory.createFullDataAsXMLType()
    assert(ceFullOtherContentType !== null)
    t.ok(ceFullOtherContentType)
    t.ok(ceFullOtherContentType.isValid())
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeSerialized1 = ceFullOtherContentType.serialize({
      encoder: encoderToXmlSample
    })
    t.ok(ceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const ceFullOtherContentTypeSerialized2 = ceFullOtherContentType.serialize({
      encodedData: ceDataXMLAsString
    })
    t.ok(ceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const fixedEncodedData = '<data "fixed"="encoded" />'
    const ceFullOtherContentTypeSerialized3 = ceFullOtherContentType.serialize({
      encoder: encoderToXmlSample,
      // encodedData: undefined
      // encodedData: null
      // encodedData: ceDataAsXmlString
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const ceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderToXmlSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidAllInstance,
      ...valDebugInfoEnable // enable print debug info (as a sample)
    })
    t.ok(ceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const ceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderToXmlSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidInstance,
      ...valDebugInfoEnable // enable print debug info (as a sample)
    })
    t.ok(ceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
  }

  {
    // the same but with strict mode enabled ...
    // expect success even if content type is not default and data is not a string,
    // anyway use encoder/decoder to let serialization/deserialization work in this case (strict) ...
    const ceFullOtherContentTypeStrict = ceFactory.createFullDataAsXMLTypeStrict()
    assert(ceFullOtherContentTypeStrict !== null)
    t.ok(ceFullOtherContentTypeStrict)
    t.ok(ceFullOtherContentTypeStrict.isValid())
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeStrictSerialized1 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderToXmlSample
    })
    t.ok(ceFullOtherContentTypeStrictSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized2 = ceFullOtherContentTypeStrict.serialize({
      encodedData: ceDataXMLAsString
    })
    t.ok(ceFullOtherContentTypeStrictSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const fixedEncodedData = '<data "fixed"="encoded" />'
    const ceFullOtherContentTypeStrictSerialized3 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderToXmlSample,
      // encodedData: undefined
      // encodedData: null
      // encodedData: ceDataAsXmlString
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeStrictSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderToXmlSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidAllInstance
    })
    t.ok(ceFullOtherContentTypeStrictSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderToXmlSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidInstance
    })
    // note that onlyValid here is a check on transformed data ...
    t.ok(ceFullOtherContentTypeStrictSerialized5)
    t.ok(V.isStringNotEmpty(ceFullOtherContentTypeStrictSerialized5))
  }

  t.end()
})

// sample encoding function to JSON, to use in tests here
function encoderToJSON (data) {
  // return ceDataAsJSONString
  return JSON.stringify(data)
}

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contenttype (but in the JSON-like family) and right serialization options, expect success', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(encoderToJSON)
  t.ok(V.isFunction(encoderToJSON))
  t.ok(!V.ensureIsFunction(encoderToJSON, 'encoderToJSON')) // no error returned

  {
    // create an instance with non default contenttype (other options default): expected success ...
    const ceFullOtherContentTypeJSON = ceFactory.createFullDataAsJSONNonDefaultType()
    assert(ceFullOtherContentTypeJSON !== null)
    t.ok(ceFullOtherContentTypeJSON)
    t.ok(ceFullOtherContentTypeJSON.isValid())
    t.ok(!ceFullOtherContentTypeJSON.isStrict)
    t.not(ceFullOtherContentTypeJSON.datacontenttype, CloudEvent.datacontenttypeDefault())
    t.ok(CloudEvent.isDatacontenttypeJSONEvent(ceFullOtherContentTypeJSON))

    // improve coverage on that method
    t.throws(function () {
      const dct = CloudEvent.isDatacontenttypeJSONEvent(undefined)
      assert(dct === false) // never executed
    }, Error, 'Expected exception when trying to get the data content type for an undefined/null CloudEvent instance')
    t.throws(function () {
      const dct = CloudEvent.isDatacontenttypeJSONEvent(null)
      assert(dct === false) // never executed
    }, Error, 'Expected exception when trying to get the data content type for an undefined/null CloudEvent instance')
    t.throws(function () {
      const dct = CloudEvent.isDatacontenttypeJSONEvent({})
      assert(dct === false) // never executed
    }, Error, 'Expected exception when trying to get the data content type for for not a CloudEvent instance')
    {
      const ce = ceFullOtherContentTypeJSON
      CloudEvent.setStrictExtensionInEvent(ce, false)
      const dct = CloudEvent.isDatacontenttypeJSONEvent(ce)
      t.strictSame(dct, true)
      t.strictSame(ce.isDatacontenttypeJSON, true)
    }
    {
      const ce = ceFullOtherContentTypeJSON
      CloudEvent.setStrictExtensionInEvent(ce, true)
      const dct = CloudEvent.isDatacontenttypeJSONEvent(ce)
      t.strictSame(dct, true)
      t.strictSame(ce.isDatacontenttypeJSON, true)
    }

    // when I try to serialize it without specifying serialization options, expect to have an error raised ...
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = ceFullOtherContentTypeJSON.serialize()
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeJSON, {
        encoder: 'encoderToJSON'
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeJSON, {
        encodedData: true
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')

    // when I try to serialize specifying right serialization options, expect success ...
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeSerialized1 = ceFullOtherContentTypeJSON.serialize({
      encoder: encoderToJSON
    })
    t.ok(ceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSON))
    const ceFullOtherContentTypeSerialized2 = ceFullOtherContentTypeJSON.serialize({
      encodedData: ceDataAsJSONString
    })
    t.ok(ceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSON))
    const fixedEncodedData = { fixed: 'encoded' }
    const ceFullOtherContentTypeSerialized3 = ceFullOtherContentTypeJSON.serialize({
      encoder: encoderToJSON,
      // encodedData: undefined
      // encodedData: null
      // encodedData: ceDataAsJSONString
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSON))
    const ceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentTypeJSON, {
      encoder: encoderToJSON,
      encodedData: fixedEncodedData,
      ...valOnlyValidAllInstance
    })
    t.ok(ceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSON))
    const ceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeJSON, {
      encoder: encoderToJSON,
      encodedData: fixedEncodedData,
      ...valOnlyValidInstance
    })
    t.ok(ceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSON))

    // the same for deserializtion ...
  }

  {
    // create an instance with non default contenttype (other options default): expected success ...
    const ceFullOtherContentTypeJSONStrict = ceFactory.createFullDataAsJSONNonDefaultTypeStrict()
    assert(ceFullOtherContentTypeJSONStrict !== null)
    t.ok(ceFullOtherContentTypeJSONStrict)
    t.ok(ceFullOtherContentTypeJSONStrict.isValid())
    t.ok(ceFullOtherContentTypeJSONStrict.isStrict)
    t.not(ceFullOtherContentTypeJSONStrict.datacontenttype, CloudEvent.datacontenttypeDefault())
    t.ok(CloudEvent.isDatacontenttypeJSONEvent(ceFullOtherContentTypeJSONStrict))

    // improve coverage on that method
    t.throws(function () {
      const dct = CloudEvent.isDatacontenttypeJSONEvent(undefined)
      assert(dct === false) // never executed
    }, Error, 'Expected exception when trying to get the data content type for an undefined/null CloudEvent instance')
    t.throws(function () {
      const dct = CloudEvent.isDatacontenttypeJSONEvent(null)
      assert(dct === false) // never executed
    }, Error, 'Expected exception when trying to get the data content type for an undefined/null CloudEvent instance')
    t.throws(function () {
      const dct = CloudEvent.isDatacontenttypeJSONEvent({})
      assert(dct === false) // never executed
    }, Error, 'Expected exception when trying to get the data content type for for not a CloudEvent instance')
    {
      const ce = ceFullOtherContentTypeJSONStrict
      CloudEvent.setStrictExtensionInEvent(ce, false)
      const dct = CloudEvent.isDatacontenttypeJSONEvent(ce)
      t.strictSame(dct, true)
      t.strictSame(ce.isDatacontenttypeJSON, true)
    }
    {
      const ce = ceFullOtherContentTypeJSONStrict
      CloudEvent.setStrictExtensionInEvent(ce, true)
      const dct = CloudEvent.isDatacontenttypeJSONEvent(ce)
      t.strictSame(dct, true)
      t.strictSame(ce.isDatacontenttypeJSON, true)
    }

    // when I try to serialize it without specifying serialization options, expect to have an error raised ...
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = ceFullOtherContentTypeJSONStrict.serialize()
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeJSONStrict, {
        encoder: 'encoderToJSON'
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeJSONStrict, {
        encodedData: true
      })
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')

    // when I try to serialize specifying right serialization options, expect success ...
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeSerialized1 = ceFullOtherContentTypeJSONStrict.serialize({
      encoder: encoderToJSON
    })
    t.ok(ceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSONStrict))
    const ceFullOtherContentTypeSerialized2 = ceFullOtherContentTypeJSONStrict.serialize({
      encodedData: ceDataAsJSONString
    })
    t.ok(ceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSONStrict))
    const fixedEncodedData = { fixed: 'encoded' }
    const ceFullOtherContentTypeSerialized3 = ceFullOtherContentTypeJSONStrict.serialize({
      encoder: encoderToJSON,
      // encodedData: undefined
      // encodedData: null
      // encodedData: ceDataAsJSONString
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSONStrict))
    const ceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentTypeJSONStrict, {
      encoder: encoderToJSON,
      encodedData: fixedEncodedData,
      ...valOnlyValidAllInstance
    })
    t.ok(ceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSONStrict))
    const ceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeJSONStrict, {
      encoder: encoderToJSON,
      encodedData: fixedEncodedData,
      ...valOnlyValidInstance
    })
    t.ok(ceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeJSONStrict))

    // the same for deserializtion ...
  }

  t.end()
})

/** @test {CloudEvent} */
test('ensure the JSON Schema for a CloudEvent (static and for a normal instance) is available', (t) => {
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  // get JSON Schema from a static method
  const jsonSchemaStatic = CloudEvent.getJSONSchema()
  assert(jsonSchemaStatic !== null)
  t.ok(jsonSchemaStatic)
  t.equal(typeof jsonSchemaStatic, 'object')

  // create a sample CloudEvent instance ...
  const ceFullStrict = ceFactory.createFullStrict()
  assert(ceFullStrict !== null)
  t.ok(ceFullStrict)
  // get JSON Schema from that instance
  const jsonSchema = ceFullStrict.schema
  assert(jsonSchema !== null)
  t.ok(jsonSchema)
  t.equal(typeof jsonSchema, 'object')

  t.end()
})

const { CloudEventTransformer: T } = require('../src/')
const ceNestedFullSerializedJson = `{"id":"3/full-no-strict-nested-data","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0","source":"/test","data":{"hello":"world","year":2020,"enabled":true,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"specversion":"1.0","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${T.timestampToString(commonEventTime)}","subject":"subject","exampleextension":"value"}`
const ceNestedFullStrictSerializedJson = `{"id":"3/full-strict-nested-data","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0","source":"/test","data":{"hello":"world","year":2020,"enabled":true,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"specversion":"1.0","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${T.timestampToString(commonEventTime)}","subject":"subject","strictvalidation":true,"exampleextension":"value"}`
const ceFullOtherContentTypeSerializedJson = `{"id":"1/full/sample-data-nested/no-strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":"<data 'hello'='world' 'year'='2020' />","specversion":"1.0","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleextension":"value","dataschema":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeStrictSerializedJson = `{"id":"1/full/sample-data-nested/strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":"<data 'hello'='world' 'year'='2020' />","specversion":"1.0","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleextension":"value","strictvalidation":true,"dataschema":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeStrictSerializedNoDataJson = `{"id":"1/full/sample-no-data/strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","specversion":"1.0","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleextension":"value","strictvalidation":true,"dataschema":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeSerializedBadJson = `{"data":"<data 'hello'='world' 'year'='2020' />","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleextension":"value"}`
const ceFullOtherContentTypeStrictSerializedBadJson = `{"data":"<data 'hello'='world' 'year'='2020' />","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleextension":"value","strictvalidation":true}`

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON with nested data, and ensure they are right', (t) => {
  const { CloudEvent } = require('../src/')
  // t.ok(CloudEvent)

  {
    const ceFull = ceFactory.createFullNestedData(fixedEventTime)
    assert(ceFull !== null)
    t.ok(ceFull)
    t.ok(ceFull.isValid())
    t.ok(ceFull.validate().length === 0)
    t.ok(ceFull.validate(valOptionsNoStrict).length === 0)
    t.ok(ceFull.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFull))
    t.ok(CloudEvent.validateEvent(ceFull).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, valOptionsStrict).length === 0)

    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
    t.ok(ceFullSerializedStatic)
    const ceFullSerialized = ceFull.serialize()
    t.ok(ceFullSerialized)
    assert(ceFullSerializedStatic === ceFullSerialized)
    t.strictSame(ceFullSerializedStatic, ceFullSerialized)
    const ceSerialize = CloudEvent.serializeEvent
    assert(ceSerialize !== null)
    t.ok(ceSerialize)
    const ceFullSerializedFunction = ceSerialize(ceFull)
    t.ok(ceFullSerializedFunction)
    t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
    t.strictSame(ceFullSerializedFunction, ceFullSerialized)

    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFull, valOnlyValidAllInstance)
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFull, valOnlyValidInstance)
    t.ok(ceFullSerializedOnlyValidTrue)

    const ceFullSerializedComparison = ceNestedFullSerializedJson
    t.strictSame(ceFullSerialized, ceFullSerializedComparison)
    const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    // ceFullDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFull, ceFullDeserialized)

    // ensure payload data is a copy of event data
    let dataShallowClone = ceFull.payload
    // then ensure they are different object (references) ...
    assert(dataShallowClone !== null)
    assert(dataShallowClone !== ceFull.data) // they must be different object references
    assert(dataShallowClone !== ceFull.payload) // they must be different object references, at any invocation
    t.not(dataShallowClone, ceFull.data)
    t.not(dataShallowClone, ceFull.data)
    t.not(dataShallowClone, ceFull.payload)
    dataShallowClone = 'changed: true' // reassign to test that data won't be affected by that change
    t.not(dataShallowClone, ceFull.data)
    t.strictNotSame(dataShallowClone, ceFull.data)
    t.not(dataShallowClone, ceFull.payload)
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = ceFactory.createFullNestedDataStrict(fixedEventTime)
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.validate().length === 0)
    t.ok(ceFullStrict.validate(valOptionsStrict).length === 0)
    t.ok(ceFullStrict.validate(valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFullStrict))
    t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, valOptionsStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, valOptionsNoStrict).length === 0)

    const ceFullStrictSerializedStatic = CloudEvent.serializeEvent(ceFullStrict)
    t.ok(ceFullStrictSerializedStatic)
    const ceFullStrictSerialized = ceFullStrict.serialize()
    t.ok(ceFullStrictSerialized)
    assert(ceFullStrictSerializedStatic === ceFullStrictSerialized)
    t.strictSame(ceFullStrictSerializedStatic, ceFullStrictSerialized)
    const ceSerialize = CloudEvent.serializeEvent
    assert(ceSerialize !== null)
    t.ok(ceSerialize)
    const ceFullStrictSerializedFunction = ceSerialize(ceFullStrict)
    t.ok(ceFullStrictSerializedFunction)
    t.strictSame(ceFullStrictSerializedFunction, ceFullStrictSerializedStatic)
    t.strictSame(ceFullStrictSerializedFunction, ceFullStrictSerialized)

    const ceFullStrictSerializedOnlyValidFalse = ceSerialize(ceFullStrict, valOnlyValidAllInstance)
    t.ok(ceFullStrictSerializedOnlyValidFalse)
    const ceFullStrictSerializedOnlyValidTrue = ceSerialize(ceFullStrict, valOnlyValidInstance)
    t.ok(ceFullStrictSerializedOnlyValidTrue)

    const ceFullStrictSerializedComparison = ceNestedFullStrictSerializedJson
    t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
    const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    // ceFullStrictDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullStrictDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFullStrict, ceFullStrictDeserialized)

    // ensure payload data is a copy of event data
    let dataShallowCloneStrict = ceFullStrict.payload
    // then ensure they are different object (references) ...
    assert(dataShallowCloneStrict !== null)
    assert(dataShallowCloneStrict !== ceFullStrict.data) // they must be different object references
    assert(dataShallowCloneStrict !== ceFullStrict.payload) // they must be different object references, at any invocation
    t.not(dataShallowCloneStrict, ceFullStrict.data)
    t.not(dataShallowCloneStrict, ceFullStrict.data)
    t.not(dataShallowCloneStrict, ceFullStrict.payload)
    dataShallowCloneStrict = 'changed: true' // reassign to test that data won't be affected by that change
    t.not(dataShallowCloneStrict, ceFullStrict.data)
    t.strictNotSame(dataShallowCloneStrict, ceFullStrict.data)
    t.not(dataShallowCloneStrict, ceFullStrict.payload)
  }

  t.end()
})

/** @test {CloudEvent} */
test('deserialize generic strings (not JSON representation for an Object) into a CloudEvent instance, expected Errors', (t) => {
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent()
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing an undefined reference')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent(undefined)
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing an undefined reference')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent(null)
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a null reference')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent('')
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing an empty string')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent('sample string')
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a string not representing an object (in JSON)')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent('{ sample string, not a valid json }')
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a string not representing an object (in JSON)')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent('[ "sample array/list", "of", "values" ]')
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a string representing an array (in JSON)')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent('{ sample string, not a valid json }', valOnlyValidAllInstance)
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a string not representing an object (in JSON)')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent('{ sample string, not a valid json }', valOnlyValidInstance)
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a string not representing an object (in JSON)')

  t.end()
})

/** @test {CloudEvent} */
test('deserialize some CloudEvent instances from JSON, and ensure built instances are right', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')

  {
    const serialized = ceNestedFullSerializedJson
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    const ceDeserialized = CloudEvent.deserializeEvent(serialized)
    assert(ceDeserialized !== null)
    // console.log(`DEBUG | cloudEvent type: ${typeof ceDeserialized}`)
    // console.log(`DEBUG | cloudEvent details: ceDeserialized = ${JSON.stringify(ceDeserialized)}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG | cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG | cloudEvent validation (strict): ${ceDeserialized.validate(valOptionsStrict)}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate(valOptionsNoStrict).length === 0)
    t.ok(ceDeserialized.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isStringNotEmpty(ceDeserialized.time))
    const ceDeserializedTimeTransformed = T.timestampFromString(ceDeserialized.time)
    t.ok(ceDeserializedTimeTransformed)
    t.ok(V.isDate(ceDeserializedTimeTransformed))
    t.ok(V.isDateValid(ceDeserializedTimeTransformed))
    t.ok(V.isDatePast(ceDeserializedTimeTransformed))
    t.strictSame(ceDeserializedTimeTransformed.getTime(), commonEventTime.getTime())
    t.not(ceDeserializedTimeTransformed, commonEventTime)
    t.not(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG | cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG | cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data)
    t.ok(V.isObject(ceDeserialized.data))
    t.ok(ceDeserialized.payload)
    t.ok(V.isObject(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictSame(ceDeserialized.data, ceDeserialized.payload)
    // then ensure they are different object (references) ...
    t.not(ceDeserialized.data, ceDeserialized.payload)
    t.not(ceDeserialized.data, ceDeserialized.payload)
    t.ok(!ceDeserialized.isStrict)
  }

  {
    // the same but with strict mode enabled ...
    const serialized = ceNestedFullStrictSerializedJson
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    const ceDeserialized = CloudEvent.deserializeEvent(serialized)
    assert(ceDeserialized !== null)
    // console.log(`DEBUG | cloudEvent type: ${typeof ceDeserialized}`)
    // console.log(`DEBUG | cloudEvent details: ceDeserialized = ${JSON.stringify(ceDeserialized)}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG | cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG | cloudEvent validation (strict): ${ceDeserialized.validate(valOptionsStrict)}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate(valOptionsNoStrict).length === 0)
    t.ok(ceDeserialized.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isStringNotEmpty(ceDeserialized.time))
    const ceDeserializedTimeTransformed = T.timestampFromString(ceDeserialized.time)
    t.ok(ceDeserializedTimeTransformed)
    t.ok(V.isDate(ceDeserializedTimeTransformed))
    t.ok(V.isDateValid(ceDeserializedTimeTransformed))
    t.ok(V.isDatePast(ceDeserializedTimeTransformed))
    t.strictSame(ceDeserializedTimeTransformed.getTime(), commonEventTime.getTime())
    t.not(ceDeserializedTimeTransformed, commonEventTime)
    t.not(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG | cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG | cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data)
    t.ok(V.isObject(ceDeserialized.data))
    t.ok(ceDeserialized.payload)
    t.ok(V.isObject(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictSame(ceDeserialized.data, ceDeserialized.payload)
    // then ensure they are different object (references) ...
    t.not(ceDeserialized.data, ceDeserialized.payload)
    t.not(ceDeserialized.data, ceDeserialized.payload)
    t.ok(ceDeserialized.isStrict)
  }

  t.end()
})

/** @test {CloudEvent} */
test('deserialize a CloudEvent instance with a non default contenttype and empty/wrong deserialization options, expect error', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')

  {
    const serialized = ceFullOtherContentTypeSerializedJson
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized)
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: 'decoderFromXmlSample' // bad decoder function
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: true // bad decoded data
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidAllInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeSerializedBadJson, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidAllInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeSerializedBadJson, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
  }

  {
    // the same but with strict mode enabled ...
    const serialized = ceFullOtherContentTypeStrictSerializedJson
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    t.throws(function () {
      // const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
      // test even another condition using a serialized string but without a data attribute inside ...
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeStrictSerializedNoDataJson, {
        decoder: null,
        decodedData: null
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: 'decoderFromXmlSample' // bad decoder function
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: true // bad decoded data
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      // test even another condition using a serialized string but without a data attribute inside ...
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: Symbol('bad decoded data') // bad decoded data
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidAllInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeStrictSerializedBadJson, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidAllInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeStrictSerializedBadJson, {
        decodedData: ceDataXMLAsString,
        ...valOnlyValidInstance
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
  }

  t.end()
})

// sample decoding function, to use in tests here
function decoderFromXmlSample (data) {
  // return ceCommonData
  // return data.toString()
  return '<data "decoded"="Sample" />'
}

/** @test {CloudEvent} */
test('deserialize a CloudEvent instance with a non default contenttype and right deserialization options, expect success', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(V)
  t.ok(decoderFromXmlSample)
  t.ok(V.isFunction(decoderFromXmlSample))
  t.ok(!V.ensureIsFunction(decoderFromXmlSample, 'decoderFromXmlSample')) // no error returned

  {
    const serialized = ceFullOtherContentTypeSerializedJson
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    // test different combinations of deserialization options
    // note that if given, decoder function has priority over decoded data
    const ceFullOtherContentTypeDeserialized1 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample
    })
    t.ok(ceFullOtherContentTypeDeserialized1)
    const fixedDecodedData = '<data "fixed"="decoded" />'
    const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized2)
    const ceFullOtherContentTypeDeserialized3 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample,
      // decodedData: undefined
      // decodedData: null
      // decodedData: ceCommonData
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized3)
    const ceFullOtherContentTypeDeserialized4 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample,
      decodedData: fixedDecodedData,
      ...valOnlyValidAllInstance
    })
    t.ok(ceFullOtherContentTypeDeserialized4)
    const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample,
      decodedData: fixedDecodedData,
      ...valOnlyValidInstance
    })
    t.ok(ceFullOtherContentTypeDeserialized5)
  }

  {
    // the same but with strict mode enabled ...
    const serialized = ceFullOtherContentTypeStrictSerializedJson
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    // test different combinations of deserialization options
    // note that if given, decoder function has priority over decoded data
    const ceFullOtherContentTypeDeserialized1 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample,
      ...valDebugInfoEnable // enable print debug info (as a sample)
    })
    t.ok(ceFullOtherContentTypeDeserialized1)
    const fixedDecodedData = '<data "fixed"="decoded" />'
    const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
      decodedData: fixedDecodedData,
      ...valDebugInfoEnable // enable print debug info (as a sample)
    })
    t.ok(ceFullOtherContentTypeDeserialized2)
    const ceFullOtherContentTypeDeserialized3 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample,
      // decodedData: undefined
      // decodedData: null
      // decodedData: ceCommonData
      decodedData: fixedDecodedData,
      ...valDebugInfoEnable // enable print debug info (as a sample)
    })
    t.ok(ceFullOtherContentTypeDeserialized3)
    const ceFullOtherContentTypeDeserialized4 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample,
      decodedData: fixedDecodedData,
      ...valOnlyValidAllInstance,
      ...valDebugInfoEnable // enable print debug info (as a sample)
    })
    t.ok(ceFullOtherContentTypeDeserialized4)
    const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderFromXmlSample,
      decodedData: fixedDecodedData,
      ...valOnlyValidInstance,
      ...valDebugInfoEnable // enable print debug info (as a sample)
    })
    t.ok(ceFullOtherContentTypeDeserialized5)
  }

  t.end()
})

/** @test {CloudEvent} */
test('serialize and deserialize a big CloudEvent instance (more than 64 KB)', (t) => {
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  t.ok(ceBigString)
  t.strictSame(ceBigString.length, ceBigStringLength)

  {
    const ceFull = ceFactory.createFullBigStringData()
    assert(ceFull !== null)
    t.ok(ceFull)
    t.ok(ceFull.isValid())
    t.ok(ceFull.validate().length === 0)
    t.ok(ceFull.validate(valOptionsNoStrict).length === 0)
    t.ok(ceFull.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFull))
    t.ok(CloudEvent.validateEvent(ceFull).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, valOptionsStrict).length === 0)

    // with defaults
    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
    t.ok(ceFullSerializedStatic)
    const ceFullDeserializedStatic = CloudEvent.deserializeEvent(ceFullSerializedStatic)
    t.ok(ceFullDeserializedStatic)
    const ceFullSerialized = ceFull.serialize()
    t.ok(ceFullSerialized)
    const ceFullDeserialized = CloudEvent.deserializeEvent(ceFullSerialized)
    t.ok(ceFullDeserialized)
    assert(ceFullSerializedStatic === ceFullSerialized)
    t.strictSame(ceFullSerializedStatic, ceFullSerialized)

    // set some flags
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFull, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse)
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFull, { ...valOnlyValidInstance, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidTrue)
    const ceFullDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue)
    t.ok(ceFullDeserializedOnlyValidTrue)
    t.strictSame(ceFullSerializedOnlyValidFalse, ceFullSerializedOnlyValidTrue)

    // enable the flag to return the serialized string only if it's less than 64 KB, expected errors here
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFull, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFull, { ...valOnlyValidInstance, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, { ...valOnlyValidInstance, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    const ceFullBadBig = ceFactory.createFullBigStringData() // create a good ce
    ceFullBadBig.id = null // but change its data, to become bad here (change this is enough)
    assert(ceFullBadBig !== null)
    t.ok(ceFullBadBig)
    const serialized = CloudEvent.serializeEvent(ceFullBadBig, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: false })
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, valOnlyValidInstance)
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = ceFactory.createFullBigStringData({ ...ceOptionsStrict }) // create a good ce
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.validate().length === 0)
    t.ok(ceFullStrict.validate(valOptionsNoStrict).length === 0)
    t.ok(ceFullStrict.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFullStrict))
    t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, valOptionsStrict).length === 0)

    // with defaults
    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFullStrict)
    t.ok(ceFullSerializedStatic)
    const ceFullDeserializedStatic = CloudEvent.deserializeEvent(ceFullSerializedStatic)
    t.ok(ceFullDeserializedStatic)
    const ceFullSerialized = ceFullStrict.serialize()
    t.ok(ceFullSerialized)
    const ceFullDeserialized = CloudEvent.deserializeEvent(ceFullSerialized)
    t.ok(ceFullDeserialized)
    assert(ceFullSerializedStatic === ceFullSerialized)
    t.strictSame(ceFullSerializedStatic, ceFullSerialized)

    // set some flags
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullStrict, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse)
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullStrict, { ...valOnlyValidInstance, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidTrue)
    const ceFullDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue)
    t.ok(ceFullDeserializedOnlyValidTrue)
    t.strictSame(ceFullSerializedOnlyValidFalse, ceFullSerializedOnlyValidTrue)

    // enable the flag to return the serialized string only if it's less than 64 KB, expected errors here
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullStrict, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullStrict, { ...valOnlyValidInstance, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, { ...valOnlyValidInstance, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    // the same but with strict mode enabled ...
    const ceFullBadBigStrict = ceFactory.createFullBigStringData({ ...ceOptionsStrict }) // create a good ce
    assert(ceFullBadBigStrict !== null)
    t.ok(ceFullBadBigStrict)
    t.ok(ceFullBadBigStrict.isStrict)
    const serialized = CloudEvent.serializeEvent(ceFullBadBigStrict, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: false })
    ceFullBadBigStrict.id = null // but change its data, to become bad here (change this is enough)
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, valOnlyValidInstance)
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }

  t.end()
})

// sample encoding function, to use in tests here
function encoderBigSample () {
  return `<data encoder="${ceBigString}" />`
}

// sample decoding function, to use in tests here
function decoderBigSample () {
  return `<data decoded="${ceBigString}" />`
}

/** @test {CloudEvent} */
test('serialize and deserialize a big CloudEvent instance with a non default contenttype (more than 64 KB)', (t) => {
  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  t.ok(ceBigString)
  t.strictSame(ceBigString.length, ceBigStringLength)

  {
    // create an instance with non default contenttype (other options default): expected success ...
    // when I try to serialize specifying right serialization options, expect success ...
    const ceFullOtherContentType = ceFactory.createFullDataAsXMLType()
    assert(ceFullOtherContentType !== null)
    t.ok(ceFullOtherContentType)
    ceFullOtherContentType.data = { random: ceBigString } // change its data to a different type, as a sample
    t.ok(ceFullOtherContentType.isValid())
    t.ok(ceFullOtherContentType.isValid({ ...valOptionsStrict })) // good even in strict mode
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeSerialized1 = ceFullOtherContentType.serialize({
      encoder: encoderBigSample
    })
    t.ok(ceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const ceFullOtherContentTypeSerialized2 = ceFullOtherContentType.serialize({
      encodedData: `<data "random"="${ceBigString}" />`
    })
    t.ok(ceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const fixedEncodedData = `<data "fixed"="${ceBigString}" />`
    const ceFullOtherContentTypeSerialized3 = ceFullOtherContentType.serialize({
      encoder: encoderBigSample,
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const ceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidAllInstance
    })
    t.ok(ceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const ceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidInstance
    })
    t.ok(ceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))

    // set some flags
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: false
    })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
      decoder: decoderBigSample
    })
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample, ...valOnlyValidInstance, onlyIfLessThan64KB: false
    })
    t.ok(ceFullSerializedOnlyValidTrue)
    const ceFullDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, {
      decoder: decoderBigSample
    })
    t.ok(ceFullDeserializedOnlyValidTrue)
    t.strictSame(ceFullSerializedOnlyValidFalse, ceFullSerializedOnlyValidTrue)

    // enable the flag to return the serialized string only if it's less than 64 KB, expected errors here
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullOtherContentType, {
        encoder: encoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullOtherContentType, {
        encoder: encoderBigSample, ...valOnlyValidInstance, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
        decoder: decoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, {
        decoder: decoderBigSample, ...valOnlyValidInstance, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    // bad because no id
    const ceFullBadBig = ceFactory.createFullXMLData() // create a good ce
    ceFullBadBig.id = null // but change its data, to become bad here (change this is enough)
    assert(ceFullBadBig !== null)
    t.ok(ceFullBadBig)
    t.ok(!ceFullBadBig.isValid())
    const serialized = CloudEvent.serializeEvent(ceFullBadBig, {
      encoder: encoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: false
    })
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, ...valOnlyValidInstance
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }

  {
    // the same but with strict mode enabled ...
    // bad because of the default datacontenttype
    const ceFullOtherContentTypeBadStrict = new CloudEvent('1/non-default-contenttype/bad-data/strict',
      ceNamespace,
      ceServerUrl,
      1234567890, // data
      // Symbol('test-no-object-nor-string'), // data
      {
        ...ceCommonOptionsStrict
        // datacontenttype: 'application/xml' // ok with a non default one
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentTypeBadStrict !== null)
    t.ok(ceFullOtherContentTypeBadStrict)
    t.notOk(ceFullOtherContentTypeBadStrict.isValid()) // no validation strict mode override
    t.notOk(ceFullOtherContentTypeBadStrict.isValid(valOptionsNoOverride)) // same of previous
    t.ok(ceFullOtherContentTypeBadStrict.isValid(valOptionsNoStrict)) // override validation to use no strict mode
    t.notOk(ceFullOtherContentTypeBadStrict.isValid(valOptionsStrict)) // override validation to use strict mode

    const ceFullOtherContentTypeStrict = ceFactory.createFullBigStringData()
    assert(ceFullOtherContentTypeStrict !== null)
    t.ok(ceFullOtherContentTypeStrict)
    t.ok(ceFullOtherContentTypeStrict.isValid())
    ceFullOtherContentTypeStrict.datacontenttype = 'application/xml' // change its data type, to be not valid in serialization here
    t.ok(ceFullOtherContentTypeStrict.isValid()) // good the same for validation
    t.ok(ceFullOtherContentTypeStrict.isValid({ ...valOptionsStrict })) // good the same for validation
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeSerialized1 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderBigSample
    })
    t.ok(ceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeSerialized2 = ceFullOtherContentTypeStrict.serialize({
      encodedData: `<data "random"="${ceBigString}" />`
    })
    t.ok(ceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const fixedEncodedData = `<data "fixed"="${ceBigString}" />`
    const ceFullOtherContentTypeSerialized3 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderBigSample,
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidAllInstance
    })
    t.ok(ceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      ...valOnlyValidInstance
    })
    t.ok(ceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))

    // set some flags
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: false
    })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
      decoder: decoderBigSample
    })
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample, ...valOnlyValidInstance, onlyIfLessThan64KB: false
    })
    t.ok(ceFullSerializedOnlyValidTrue)
    const ceFullDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, {
      decoder: decoderBigSample
    })
    t.ok(ceFullDeserializedOnlyValidTrue)
    t.strictSame(ceFullSerializedOnlyValidFalse, ceFullSerializedOnlyValidTrue)

    // enable the flag to return the serialized string only if it's less than 64 KB, expected errors here
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encoder: encoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encoder: encoderBigSample, ...valOnlyValidInstance, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
        decoder: decoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, {
        decoder: decoderBigSample, ...valOnlyValidInstance, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    const ceFullBadBigStrict = ceFactory.createFullBigStringData({ ...ceOptionsStrict })
    assert(ceFullBadBigStrict !== null)
    t.ok(ceFullBadBigStrict)
    t.ok(ceFullBadBigStrict.isStrict)
    const serialized = CloudEvent.serializeEvent(ceFullBadBigStrict, {
      encoder: encoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: false
    })
    ceFullBadBigStrict.id = null // remove some mandatory attribute now, to let deserialization fail
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, ...valOnlyValidInstance
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, ...valOnlyValidAllInstance, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }

  t.end()
})

/** @test {CloudEvent} */
test('create and deserialize some CloudEvent instances with data encoded in base64, and ensure they are right', (t) => {
  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
  // t.ok(CloudEvent)

  // const ceDataEncoded = T.stringToBase64(ceDataAsString) // ok
  const ceDataEncoded = ceDataAsStringEncoded

  t.ok(ceDataAsString)
  t.ok(V.isString(ceDataAsString))
  t.ok(ceDataEncoded)
  t.ok(V.isString(ceDataEncoded))
  t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
  t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)

  {
    const ceFull = ceFactory.createFullBinaryData({ ...fixedEventTime })
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceFull, 'ceFull')}`)
    t.ok(ceFull)
    t.ok(!ceFull.isStrict)
    t.ok(CloudEvent.isValidEvent(ceFull, valOptionsNoStrict))
    t.ok(CloudEvent.isValidEvent(ceFull, valOptionsStrict))
    t.strictSame(CloudEvent.validateEvent(ceFull, valOptionsNoStrict).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFull, valOptionsStrict).length, 0)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringToBase64(T.stringFromBase64(ceDataEncoded)), ceDataEncoded)
    t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)

    // reference some imported variables, even when not used, mainly to avoid linting errors
    assert(valDebugInfoDisable !== null)
    assert(valDebugInfoEnable !== null)

    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceFullSerializedStatic, 'ceFullSerializedStatic')}`)
    t.ok(ceFullSerializedStatic)
    const ceFullSerialized = ceFull.serialize()
    t.ok(ceFullSerialized)
    t.strictSame(ceFullSerializedStatic, ceFullSerialized)
    const ceSerialize = CloudEvent.serializeEvent
    t.ok(ceSerialize)
    const ceFullSerializedFunction = ceSerialize(ceFull, { ...valDebugInfoDisable })
    t.ok(ceFullSerializedFunction)
    t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
    t.strictSame(ceFullSerializedFunction, ceFullSerialized)
    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFull, valOnlyValidAllInstance)
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFull, valOnlyValidInstance)
    t.ok(ceFullSerializedOnlyValidTrue)

    const ceDeserialized = CloudEvent.deserializeEvent(ceFullSerializedStatic, { ...valDebugInfoDisable })
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG | cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG | cloudEvent validation (strict): ${ceDeserialized.validate(valOptionsStrict)}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate(valOptionsNoStrict).length === 0)
    t.ok(ceDeserialized.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isStringNotEmpty(ceDeserialized.time))
    const ceDeserializedTimeTransformed = T.timestampFromString(ceDeserialized.time)
    t.ok(ceDeserializedTimeTransformed)
    t.ok(V.isDate(ceDeserializedTimeTransformed))
    t.ok(V.isDateValid(ceDeserializedTimeTransformed))
    t.ok(V.isDatePast(ceDeserializedTimeTransformed))
    t.strictSame(ceDeserializedTimeTransformed.getTime(), commonEventTime.getTime())
    t.not(ceDeserializedTimeTransformed, commonEventTime)
    t.not(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG | cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG | cloudEvent data_base64: ${T.dumpObject(ceDeserialized.data_base64, 'ceDeserialized.data_base64')}`)
    // console.log(`DEBUG | cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data_base64)
    t.ok(V.isString(ceDeserialized.data_base64))
    t.ok(ceDeserialized.payload)
    t.ok(V.isString(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictNotSame(ceDeserialized.payload, ceDeserialized.data)
    t.strictSame(ceDeserialized.payload, T.stringFromBase64(ceDeserialized.data_base64))
    // and that they are the same of initial value ...
    t.strictSame(ceDeserialized.data, ceFull.data)
    t.strictNotSame(ceDeserialized.data, ceDataEncoded)
    // then ensure they are different object (references) ...
    // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...

    {
      const serialized = ceFullSerializedStatic
      // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
      t.ok(serialized)
      t.ok(V.isString(serialized))
      // some checks on serialized instance
      const ceFullDeserializedJSON = JSON.parse(ceFullSerializedStatic) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullDeserializedJSON.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      // console.log(`DEBUG | original cloudEvent: data = '${ceFull.data}', data_base64 = '${ceFull.data_base64}'`)
      // console.log(`DEBUG | deserialized cloudEvent: data = '${ceFullDeserializedJSON.data}', data_base64 = '${ceFullDeserializedJSON.data_base64}'`)
      // next tests are so because here deserialization is done with standard JSON, and not with ce specific method ...
      t.strictNotSame(ceFullDeserializedJSON, ceFull)
      t.strictSame(ceFullDeserializedJSON.data, ceFull.data)
      t.strictSame(ceFullDeserializedJSON.data_base64, ceFull.data_base64)
    }
    {
      // test with not supported data (not a string representation)
      const serialized = ceFullSerializedStatic.replace(ceDataEncoded, '{}')
      // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
      // some checks on serialized instance, but using deserialization methods
      t.throws(function () {
        const ceDeserialized = CloudEvent.deserializeEvent(serialized)
        assert(ceDeserialized === undefined) // never executed
      }, Error, 'Expected exception when creating a CloudEvent with data_base64 set but wrong')
    }
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = ceFactory.createFullBinaryData({ ...ceOptionsStrict, ...fixedEventTime })
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceFullStrict, 'ceFullStrict')}`)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isStrict)
    t.ok(CloudEvent.isValidEvent(ceFullStrict, valOptionsNoStrict))
    t.ok(CloudEvent.isValidEvent(ceFullStrict, valOptionsStrict))
    t.strictSame(CloudEvent.validateEvent(ceFullStrict, valOptionsNoStrict).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullStrict, valOptionsStrict).length, 0)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringToBase64(T.stringFromBase64(ceDataEncoded)), ceDataEncoded)
    t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)

    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFullStrict, { ...valDebugInfoEnable }) // enable print debug info (as a sample)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceFullSerializedStatic, 'ceFullSerializedStatic')}`)
    t.ok(ceFullSerializedStatic)
    const ceFullSerialized = ceFullStrict.serialize()
    t.ok(ceFullSerialized)
    t.strictSame(ceFullSerializedStatic, ceFullSerialized)
    const ceSerialize = CloudEvent.serializeEvent
    t.ok(ceSerialize)
    const ceFullSerializedFunction = ceSerialize(ceFullStrict)
    t.ok(ceFullSerializedFunction)
    t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
    t.strictSame(ceFullSerializedFunction, ceFullSerialized)
    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFullStrict, valOnlyValidAllInstance)
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFullStrict, valOnlyValidInstance)
    t.ok(ceFullSerializedOnlyValidTrue)

    const ceDeserialized = CloudEvent.deserializeEvent(ceFullSerializedStatic, { ...valDebugInfoEnable }) // enable print debug info (as a sample)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG | cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG | cloudEvent validation (strict): ${ceDeserialized.validate(valOptionsStrict)}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate(valOptionsNoStrict).length === 0)
    t.ok(ceDeserialized.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isStringNotEmpty(ceDeserialized.time))
    const ceDeserializedTimeTransformed = T.timestampFromString(ceDeserialized.time)
    t.ok(ceDeserializedTimeTransformed)
    t.ok(V.isDate(ceDeserializedTimeTransformed))
    t.ok(V.isDateValid(ceDeserializedTimeTransformed))
    t.ok(V.isDatePast(ceDeserializedTimeTransformed))
    t.strictSame(ceDeserializedTimeTransformed.getTime(), commonEventTime.getTime())
    t.not(ceDeserializedTimeTransformed, commonEventTime)
    t.not(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG | cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG | cloudEvent data_base64: ${T.dumpObject(ceDeserialized.data_base64, 'ceDeserialized.data_base64')}`)
    // console.log(`DEBUG | cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data_base64)
    t.ok(V.isString(ceDeserialized.data_base64))
    t.ok(ceDeserialized.payload)
    t.ok(V.isString(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictNotSame(ceDeserialized.payload, ceDeserialized.data)
    t.strictSame(ceDeserialized.payload, T.stringFromBase64(ceDeserialized.data_base64))
    // and that they are the same of initial value ...
    t.strictSame(ceDeserialized.data, ceFullStrict.data)
    t.strictNotSame(ceDeserialized.data, ceDataEncoded)
    // then ensure they are different object (references) ...
    // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...

    {
      const serialized = ceFullSerializedStatic
      // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
      t.ok(serialized)
      t.ok(V.isString(serialized))
      // some checks on serialized instance
      const ceFullDeserializedJSON = JSON.parse(ceFullSerializedStatic) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullDeserializedJSON.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      // console.log(`DEBUG | original cloudEvent: data = '${ceFullStrict.data}', data_base64 = '${ceFullStrict.data_base64}'`)
      // console.log(`DEBUG | deserialized cloudEvent: data = '${ceFullDeserializedJSON.data}', data_base64 = '${ceFullDeserializedJSON.data_base64}'`)
      // next tests are so because here deserialization is done with standard JSON, and not with ce specific method ...
      t.strictNotSame(ceFullDeserializedJSON, ceFullStrict)
      t.strictSame(ceFullDeserializedJSON.data, ceFullStrict.data)
      t.strictSame(ceFullDeserializedJSON.data_base64, ceFullStrict.data_base64)
    }
    {
      // test with not supported data (not a string representation)
      const serialized = ceFullSerializedStatic.replace(ceDataEncoded, '{}')
      // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
      // some checks on serialized instance, but using deserialization methods
      t.throws(function () {
        const ceDeserialized = CloudEvent.deserializeEvent(serialized)
        assert(ceDeserialized === undefined) // never executed
      }, Error, 'Expected exception when creating a CloudEvent with data_base64 set but wrong')
    }
  }

  t.end()
})

/** @test {CloudEvent} */
test('create and deserialize some CloudEvent instances with (big) data encoded in base64, and ensure they are right', (t) => {
  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')

  const ceDataAsString = ceBigString
  const ceDataEncoded = T.stringToBase64(ceDataAsString)

  t.ok(ceDataAsString)
  t.ok(V.isString(ceDataAsString))
  t.ok(ceDataEncoded)
  t.ok(V.isString(ceDataEncoded))
  t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
  t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)

  {
    const ceBig = ceFactory.createFullBigBinaryData(ceDataEncoded, { ...fixedEventTime })
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceBig, 'ceBig')}`)
    t.ok(ceBig)
    t.notOk(ceBig.isStrict)
    t.ok(CloudEvent.isValidEvent(ceBig, valOptionsNoStrict))
    t.ok(CloudEvent.isValidEvent(ceBig, valOptionsStrict))
    t.strictSame(CloudEvent.validateEvent(ceBig, valOptionsNoStrict).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceBig, valOptionsStrict).length, 0)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringToBase64(T.stringFromBase64(ceDataEncoded)), ceDataEncoded)
    t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
    const ceBigAsString = ceBig.toString()
    // console.log(`DEBUG | ceBigAsString: ${ceBigAsString}`)
    t.ok(V.isString(ceBigAsString))
    const ceBigPayloadDumped = T.dumpObject(ceBig.payload, 'payload')
    // console.log(`DEBUG | ceBigPayloadDumped: ${ceBigPayloadDumped}`)
    t.ok(V.isString(ceBigPayloadDumped))
    t.ok(ceBigPayloadDumped.length >= 1024)
    // use default serialization options, expected success
    const ceSerialized = CloudEvent.serializeEvent(ceBig)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceSerialized, 'ceSerialized')}`)
    t.ok(ceSerialized)
    t.ok(V.isString(ceSerialized))
    // force some options (big objects are already enabled anyway), expected success
    const ceBigSerializedWithGoodOptions = CloudEvent.serializeEvent(ceBig, { ...valOnlyValidInstance, onlyIfLessThan64KB: false })
    t.ok(ceBigSerializedWithGoodOptions)
    t.ok(V.isString(ceBigSerializedWithGoodOptions))
    t.strictSame(ceSerialized, ceBigSerializedWithGoodOptions)
    // force some options (disable big objects), expect error
    t.throws(function () {
      const ceBigSerializedNoBigObjects = CloudEvent.serializeEvent(ceBig, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(ceBigSerializedNoBigObjects === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')

    // use default deserialization options, expected success
    const ceDeserialized = CloudEvent.deserializeEvent(ceSerialized)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG | cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG | cloudEvent validation (strict): ${ceDeserialized.validate(valOptionsStrict)}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate(valOptionsNoStrict).length === 0)
    t.ok(ceDeserialized.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))
    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.data_base64)
    t.ok(V.isString(ceDeserialized.data_base64))
    t.ok(ceDeserialized.payload)
    t.ok(V.isString(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictNotSame(ceDeserialized.payload, ceDeserialized.data)
    t.strictSame(ceDeserialized.payload, T.stringFromBase64(ceDeserialized.data_base64))
    // and that they are the same of initial value ...
    t.strictSame(ceDeserialized.data, ceBig.data)
    t.strictNotSame(ceDeserialized.data, ceDataEncoded)
    t.strictSame(ceDeserialized.payload, ceBig.payload)
    // then ensure they are different object (references) ...
    // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...
    // force some options (big objects are already enabled anyway), expected success
    const ceBigDeserializedWithGoodOptions = CloudEvent.deserializeEvent(ceSerialized, { ...valOnlyValidInstance, onlyIfLessThan64KB: false })
    t.ok(ceBigDeserializedWithGoodOptions)
    t.ok(V.isClass(ceBigDeserializedWithGoodOptions, CloudEvent))
    t.ok(ceBigDeserializedWithGoodOptions.isValid())
    t.ok(ceBigDeserializedWithGoodOptions.validate().length === 0)
    t.ok(ceBigDeserializedWithGoodOptions.validate(valOptionsNoStrict).length === 0)
    t.ok(ceBigDeserializedWithGoodOptions.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceBigDeserializedWithGoodOptions))
    t.ok(CloudEvent.validateEvent(ceBigDeserializedWithGoodOptions).length === 0)
    t.ok(CloudEvent.validateEvent(ceBigDeserializedWithGoodOptions, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceBigDeserializedWithGoodOptions, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceBigDeserializedWithGoodOptions))
    t.strictSame(ceBigDeserializedWithGoodOptions.payload, ceBig.payload)
    // force some options (disable big objects), expect error
    t.throws(function () {
      const ceBigDeserializedNoBigObjects = CloudEvent.deserializeEvent(ceSerialized, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(ceBigDeserializedNoBigObjects === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    // the same but with strict mode enabled ...
    const ceBigStrict = ceFactory.createFullBigBinaryData(ceDataEncoded, { ...ceOptionsStrict, ...fixedEventTime })
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceBigStrict, 'ceBigStrict')}`)
    t.ok(ceBigStrict)
    t.ok(ceBigStrict.isStrict)
    t.ok(CloudEvent.isValidEvent(ceBigStrict, valOptionsNoStrict))
    t.ok(CloudEvent.isValidEvent(ceBigStrict, valOptionsStrict))
    t.strictSame(CloudEvent.validateEvent(ceBigStrict, valOptionsNoStrict).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceBigStrict, valOptionsStrict).length, 0)
    t.strictSame(T.stringFromBase64(ceDataEncoded), ceDataAsString)
    t.strictSame(T.stringToBase64(T.stringFromBase64(ceDataEncoded)), ceDataEncoded)
    t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
    const ceBigStrictAsString = ceBigStrict.toString()
    // console.log(`DEBUG | ceBigStrictAsString: ${ceBigStrictAsString}`)
    t.ok(V.isString(ceBigStrictAsString))
    const ceBigStrictPayloadDumped = T.dumpObject(ceBigStrict.payload, 'payload')
    // console.log(`DEBUG | ceBigStrictPayloadDumped: ${ceBigStrictPayloadDumped}`)
    t.ok(V.isString(ceBigStrictPayloadDumped))
    t.ok(ceBigStrictPayloadDumped.length >= 1024)

    // use default serialization options, expected success
    const ceSerialized = CloudEvent.serializeEvent(ceBigStrict)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceSerialized, 'ceSerialized')}`)
    t.ok(ceSerialized)
    t.ok(V.isString(ceSerialized))
    // force some options (big objects are already enabled anyway), expected success
    const ceBigSerializedWithGoodOptions = CloudEvent.serializeEvent(ceBigStrict, { ...valOnlyValidInstance, onlyIfLessThan64KB: false })
    t.ok(ceBigSerializedWithGoodOptions)
    t.ok(V.isString(ceBigSerializedWithGoodOptions))
    t.strictSame(ceSerialized, ceBigSerializedWithGoodOptions)
    // force some options (disable big objects), expect error
    t.throws(function () {
      const ceBigSerializedNoBigObjects = CloudEvent.serializeEvent(ceBigStrict, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(ceBigSerializedNoBigObjects === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')

    // use default deserialization options, expected success
    const ceDeserialized = CloudEvent.deserializeEvent(ceSerialized)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG | cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG | cloudEvent validation (strict): ${ceDeserialized.validate(valOptionsStrict)}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate(valOptionsNoStrict).length === 0)
    t.ok(ceDeserialized.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))
    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.data_base64)
    t.ok(V.isString(ceDeserialized.data_base64))
    t.ok(ceDeserialized.payload)
    t.ok(V.isString(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictNotSame(ceDeserialized.payload, ceDeserialized.data)
    t.strictSame(ceDeserialized.payload, T.stringFromBase64(ceDeserialized.data_base64))
    // and that they are the same of initial value ...
    t.strictSame(ceDeserialized.data, ceBigStrict.data)
    t.strictNotSame(ceDeserialized.data, ceDataEncoded)
    t.strictSame(ceDeserialized.payload, ceBigStrict.payload)
    // then ensure they are different object (references) ...
    // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...
    // force some options (big objects are already enabled anyway), expected success
    const ceBigDeserializedWithGoodOptions = CloudEvent.deserializeEvent(ceSerialized, { ...valOnlyValidInstance, onlyIfLessThan64KB: false })
    t.ok(ceBigDeserializedWithGoodOptions)
    t.ok(V.isClass(ceBigDeserializedWithGoodOptions, CloudEvent))
    t.ok(ceBigDeserializedWithGoodOptions.isValid())
    t.ok(ceBigDeserializedWithGoodOptions.validate().length === 0)
    t.ok(ceBigDeserializedWithGoodOptions.validate(valOptionsNoStrict).length === 0)
    t.ok(ceBigDeserializedWithGoodOptions.validate(valOptionsStrict).length === 0)
    t.ok(CloudEvent.isValidEvent(ceBigDeserializedWithGoodOptions))
    t.ok(CloudEvent.validateEvent(ceBigDeserializedWithGoodOptions).length === 0)
    t.ok(CloudEvent.validateEvent(ceBigDeserializedWithGoodOptions, valOptionsNoStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceBigDeserializedWithGoodOptions, valOptionsStrict).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceBigDeserializedWithGoodOptions))
    t.strictSame(ceBigDeserializedWithGoodOptions.payload, ceBigStrict.payload)
    // force some options (disable big objects), expect error
    t.throws(function () {
      const ceBigDeserializedNoBigObjects = CloudEvent.deserializeEvent(ceSerialized, { ...valOnlyValidAllInstance, onlyIfLessThan64KB: true })
      assert(ceBigDeserializedNoBigObjects === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  t.end()
})

// define some events valid in the spec version 0.3
const ceFullSerializedJson03 = `{"id":"1/full/sample-data/no-strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2020},"specversion":"0.3","datacontenttype":"application/json","time":"${T.timestampToString(commonEventTime)}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","exampleExtension":"value"}`
const ceFullStrictSerializedJson03 = `{"id":"1/full/sample-data/strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2020},"specversion":"0.3","datacontenttype":"application/json","time":"${T.timestampToString(commonEventTime)}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","com_github_smartiniOnGitHub_cloudevent":{"strict":true},"exampleExtension":"value"}`

/** @test {CloudEvent} */
test('deserialize some CloudEvent instances (but a previous specversion) from JSON, and ensure errors are raised', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')

  {
    const serialized = ceFullSerializedJson03
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    t.throws(function () {
      const ceDeserialized = CloudEvent.deserializeEvent(serialized)
      assert(ceDeserialized === undefined) // never executed
    }, Error, 'Expected exception when creating a CloudEvent from a different specversion')
  }

  {
    // the same but with strict mode enabled ...
    const serialized = ceFullStrictSerializedJson03
    // console.log(`DEBUG | serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    t.throws(function () {
      const ceDeserialized = CloudEvent.deserializeEvent(serialized)
      assert(ceDeserialized === undefined) // never executed
    }, Error, 'Expected exception when creating a CloudEvent from a different specversion')
  }

  t.end()
})

/** @test {CloudEvent} */
test('serialize and deserialize some CloudEvent instances with some optional attributes null, and ensure errors are raised', (t) => {
  const { CloudEvent } = require('../src/')
  // t.ok(CloudEvent)

  {
    // use directly the event with strict mode enabled ...
    const ceStrict = ceFactory.createFullStrict(ceCommonOptionsWithSomeOptionalsNullStrict)
    ceStrict.data = null // reset data, good the same
    assert(ceStrict !== null)
    t.ok(ceStrict)
    // console.log(`DEBUG | ${CloudEvent.dumpValidationResults(ceStrict, null, 'ceStrict')}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceStrict, 'ceStrict')}`)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.ok(ceStrict.isValid())
    t.strictSame(ceStrict.payload, ceStrict.data)
    t.strictSame(ceStrict.dataType, 'Unknown')
    const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, valOnlyValidInstance)
    t.ok(ceSerializedOnlyValidTrue)
    // console.log(`DEBUG | ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
    const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue)
    t.ok(ceDeserializedOnlyValidTrue)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserializedOnlyValidTrue, 'ceDeserializedOnlyValidTrue')}`)
  }

  {
    // use directly the event with strict mode enabled ...
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
    // console.log(`DEBUG | ${CloudEvent.dumpValidationResults(ceStrict, null, 'ceStrict')}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceStrict, 'ceStrict')}`)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.ok(ceStrict.isValid())
    t.strictSame(ceStrict.payload, ceStrict.data)
    t.strictSame(ceStrict.dataType, 'Unknown')
    const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, valOnlyValidInstance)
    t.ok(ceSerializedOnlyValidTrue)
    // console.log(`DEBUG | ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
    const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue)
    t.ok(ceDeserializedOnlyValidTrue)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserializedOnlyValidTrue, 'ceDeserializedOnlyValidTrue')}`)
  }

  t.end()
})

/** @test {CloudEvent} */
test('serialize and deserialize some CloudEvent instances with data as array, and ensure all is good', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  // t.ok(CloudEvent)

  {
    // use directly the event with strict mode enabled ...
    const ceStrict = new CloudEvent('1/full/array-data/strict',
      ceNamespace,
      ceServerUrl,
      ceArrayData, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceStrict !== null)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.strictSame(ceStrict.payload, ceStrict.data)
    t.strictSame(ceStrict.dataType, 'Text')
    const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, valOnlyValidInstance)
    t.ok(ceSerializedOnlyValidTrue)
    // console.log(`DEBUG | ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
    const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue)
    t.ok(ceDeserializedOnlyValidTrue)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserializedOnlyValidTrue, 'ceDeserializedOnlyValidTrue')}`)
    const ceStrictAsString = ceStrict.toString()
    // console.log(`DEBUG | ceStrictAsString: ${ceStrictAsString}`)
    t.ok(V.isString(ceStrictAsString))
    const ceStrictPayloadDumped = T.dumpObject(ceStrict.payload, 'payload')
    // console.log(`DEBUG | ceStrictPayloadDumped: ${ceStrictPayloadDumped}`)
    t.ok(V.isString(ceStrictPayloadDumped))
    t.ok(ceStrictPayloadDumped.length < 1024)
  }

  {
    // use directly the event with strict mode enabled ...
    const ceStrict = new CloudEvent('1/full/array-data-text-mime-type/strict',
      ceNamespace,
      ceServerUrl,
      ceArrayData, // data
      ceCommonOptionsForTextDataStrict,
      ceCommonExtensions
    )
    assert(ceStrict !== null)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.strictSame(ceStrict.payload, ceStrict.data)
    t.strictSame(ceStrict.dataType, 'Text')
    const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, {
      encodedData: JSON.stringify(ceArrayData), // with a non default data content type, I need to specify encoder or encodedData
      ...valOnlyValidInstance
    })
    t.ok(ceSerializedOnlyValidTrue)
    // console.log(`DEBUG | ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
    // const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue) // ok but shouldn't work in this case
    const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue, { // sample, to show the right way
      decodedData: ceArrayData, // with a non default data content type, I need to specify encoder or encodedData
      ...valOnlyValidInstance
    })
    t.ok(ceDeserializedOnlyValidTrue)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserializedOnlyValidTrue, 'ceDeserializedOnlyValidTrue')}`)
    const ceStrictAsString = ceStrict.toString()
    // console.log(`DEBUG | ceStrictAsString: ${ceStrictAsString}`)
    t.ok(V.isString(ceStrictAsString))
    const ceStrictPayloadDumped = T.dumpObject(ceStrict.payload, 'payload')
    // console.log(`DEBUG | ceStrictPayloadDumped: ${ceStrictPayloadDumped}`)
    t.ok(V.isString(ceStrictPayloadDumped))
    t.ok(ceStrictPayloadDumped.length < 1024)
  }

  t.end()
})

/** @test {CloudEvent} */
test('serialize and deserialize some CloudEvent instances with data as value (string or boolean or number), and ensure errors are raised', (t) => {
  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  // t.ok(CloudEvent)

  {
    // use directly the event with strict mode enabled ...
    const ceStrict = ceFactory.createFullTextData({ ...ceOptionsStrict })
    assert(ceStrict !== null)
    t.ok(ceStrict)
    t.ok(ceStrict.isStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.strictSame(ceStrict.payload, ceStrict.data)
    t.strictSame(ceStrict.dataType, 'Text')
    const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, valOnlyValidInstance)
    t.ok(ceSerializedOnlyValidTrue)
    // console.log(`DEBUG | ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
    const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue)
    t.ok(ceDeserializedOnlyValidTrue)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserializedOnlyValidTrue, 'ceDeserializedOnlyValidTrue')}`)
    const ceStrictAsString = ceStrict.toString()
    // console.log(`DEBUG | ceStrictAsString: ${ceStrictAsString}`)
    t.ok(V.isString(ceStrictAsString))
    const ceStrictPayloadDumped = T.dumpObject(ceStrict.payload, 'payload')
    // console.log(`DEBUG | ceStrictPayloadDumped: ${ceStrictPayloadDumped}`)
    t.ok(V.isString(ceStrictPayloadDumped))
    t.ok(ceStrictPayloadDumped.length < 1024)
  }

  {
    const value = true
    // use directly the event with strict mode enabled ...
    const ceStrict = new CloudEvent('1/full/boolean-data-text-mime-type/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextDataStrict,
      ceCommonExtensions
    )
    assert(ceStrict !== null)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.strictSame(ceStrict.payload, ceStrict.data)
    t.strictSame(ceStrict.dataType, 'Text')
    const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, valOnlyValidInstance)
    t.ok(ceSerializedOnlyValidTrue)
    // console.log(`DEBUG | ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
    const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue)
    t.ok(ceDeserializedOnlyValidTrue)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserializedOnlyValidTrue, 'ceDeserializedOnlyValidTrue')}`)
  }

  {
    const value = 3.14159
    // use directly the event with strict mode enabled ...
    const ceStrict = new CloudEvent('1/full/number-data-text-mime-type/strict',
      ceNamespace,
      ceServerUrl,
      value, // data
      ceCommonOptionsForTextDataStrict,
      ceCommonExtensions
    )
    assert(ceStrict !== null)
    t.ok(ceStrict)
    t.ok(CloudEvent.isValidEvent(ceStrict))
    t.strictSame(ceStrict.payload, ceStrict.data)
    t.strictSame(ceStrict.dataType, 'Text')
    const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, valOnlyValidInstance)
    t.ok(ceSerializedOnlyValidTrue)
    // console.log(`DEBUG | ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
    const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue)
    t.ok(ceDeserializedOnlyValidTrue)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceDeserializedOnlyValidTrue, 'ceDeserializedOnlyValidTrue')}`)
  }

  t.end()
})
