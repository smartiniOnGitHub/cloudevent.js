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

const assert = require('assert')
const test = require('tap').test

/** @test {CloudEvent} */
test('ensure serialization functions exists (check only the static method here)', (t) => {
  t.plan(8)

  {
    const { CloudEvent } = require('../src/') // get references via destructuring
    t.ok(CloudEvent)
    // optional, using some standard Node.js assert statements, as a sample
    assert(CloudEvent !== null)
    assert.strictEqual(typeof CloudEvent, 'function')
    assert(new CloudEvent() instanceof CloudEvent)
    assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    assert.strictEqual(CloudEvent.mediaTypeBatchFormat(), 'application/cloudevents-batch+json')
    t.ok(CloudEvent)
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
    t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    t.strictEqual(CloudEvent.mediaTypeBatchFormat(), 'application/cloudevents-batch+json')

    const ceSerialize = CloudEvent.serializeEvent
    assert(ceSerialize !== null)
    assert(typeof ceSerialize === 'function')
    t.ok(ceSerialize)
    t.strictEqual(typeof ceSerialize, 'function')
  }
})

/** create some common options, for better reuse in tests */
const commonEventTime = new Date()
const ceCommonOptions = {
  time: commonEventTime,
  datacontenttype: 'application/json',
  schemaurl: 'http://my-schema.localhost.localdomain',
  subject: 'subject',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
/** create some common extensions, for better reuse in tests */
const ceCommonExtensions = { exampleExtension: 'value' }
/** create a sample namespace for events here, for better reuse in tests */
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent'
/** create a sample common server URL, for better reuse in tests */
const ceServerUrl = '/test'
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { hello: 'world', year: 2019 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map([['key-1', 'value 1'], ['key-2', 'value 2']])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')
/** sample data as an xml string */
const ceDataAsXmlString = `<data "hello"="world" "year"="2019" />`
/** create a sample string big (more than 64 KB) */
const ceBigStringLength = 100000
const ceBigString = getRandomString(ceBigStringLength) // a random string with n chars

// sample function to calculate a random string, given the length, to use in tests here
function getRandomString (length) {
  let str = Math.random().toString(36).substr(2)
  while (str.length < length) {
    str += Math.random().toString(36).substr(2)
  }
  return str.substr(0, length)
}

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  t.plan(56)

  const { CloudEvent, CloudEventTransformer: T } = require('../src/')
  // t.ok(CloudEvent)

  {
    // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFull = new CloudEvent('1/full/sample-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFull !== null)
    t.ok(ceFull)
    t.ok(ceFull.isValid())
    t.ok(ceFull.validate().length === 0)
    t.ok(ceFull.validate({ strict: false }).length === 0)
    t.ok(ceFull.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFull))
    t.ok(CloudEvent.validateEvent(ceFull).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)

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

    const ceFullSerializedComparison = `{"id":"1/full/sample-data/no-strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2019},"specversion":"0.3","datacontenttype":"application/json","time":"${T.timestampToString(commonEventTime)}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","exampleExtension":"value"}`
    t.strictSame(ceFullSerialized, ceFullSerializedComparison)
    const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullDeserialized.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFull, ceFullDeserialized)

    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFull, { onlyValid: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFull, { onlyValid: true })
    t.ok(ceFullSerializedOnlyValidTrue)

    {
      const ceFullBad = new CloudEvent(null,
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        ceCommonOptions,
        ceCommonExtensions
      )
      assert(ceFullBad !== null)
      t.ok(ceFullBad)
      t.ok(!ceFullBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = ceSerialize(ceFullBad, { onlyValid: false })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = ceSerialize(ceFullBad, { onlyValid: true })
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }

    // test to ensure that old style extensions are not serialized
    const ceFullSerializedStaticWithoutExtensionsProperty = CloudEvent.serializeEvent({ ...ceFull, extensions: { exampleExtensionToSkip: 'valueToSkip' } })
    t.ok(ceFullSerializedStaticWithoutExtensionsProperty)
    t.strictSame(ceFullSerializedStaticWithoutExtensionsProperty.search('exampleExtensionToSkip'), -1)
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.validate().length === 0)
    t.ok(ceFullStrict.validate({ strict: true }).length === 0)
    t.ok(ceFullStrict.validate({ strict: false }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFullStrict))
    t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)

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

    const ceFullStrictSerializedComparison = `{"id":"1/full/sample-data/strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2019},"specversion":"0.3","datacontenttype":"application/json","time":"${T.timestampToString(commonEventTime)}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","com_github_smartiniOnGitHub_cloudevent":{"strict":true},"exampleExtension":"value"}`
    t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
    const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullStrictDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullStrictDeserialized.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFullStrict, ceFullStrictDeserialized)

    const ceFullStrictSerializedOnlyValidFalse = ceSerialize(ceFullStrict, { onlyValid: false })
    t.ok(ceFullStrictSerializedOnlyValidFalse)
    const ceFullStrictSerializedOnlyValidTrue = ceSerialize(ceFullStrict, { onlyValid: true })
    t.ok(ceFullStrictSerializedOnlyValidTrue)

    {
      const ceFullStrictBad = new CloudEvent('1/full/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        ceCommonOptionsStrict,
        ceCommonExtensions
      )
      assert(ceFullStrictBad !== null)
      t.ok(ceFullStrictBad)
      ceFullStrictBad.id = null // remove some mandatory attribute now, to let serialization fail
      t.ok(!ceFullStrictBad.isValid())
      const ceFullStrictBadSerializedOnlyValidFalse = ceSerialize(ceFullStrictBad, { onlyValid: false })
      t.ok(ceFullStrictBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullStrictBadSerializedOnlyValidTrue = ceSerialize(ceFullStrictBad, { onlyValid: true })
        assert(ceFullStrictBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }

    // test to ensure that old style extensions are not serialized
    const ceFullStrictSerializedStaticWithoutExtensionsProperty = CloudEvent.serializeEvent({ ...ceFullStrict, extensions: { exampleExtensionToSkip: 'valueToSkip' } })
    t.ok(ceFullStrictSerializedStaticWithoutExtensionsProperty)
    t.strictSame(ceFullStrictSerializedStaticWithoutExtensionsProperty.search('exampleExtensionToSkip'), -1)
  }
})

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contenttype and empty serialization options, expect error', (t) => {
  t.plan(34)

  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  {
    // create an instance with non default contenttype (other options default): expected success ...
    // when I try to serialize it without specifying serialization options, expect to have an error raised ...
    const ceFullOtherContentType = new CloudEvent('1/non-default-contenttype/sample-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptions,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentType !== null)
    t.ok(ceFullOtherContentType)
    t.ok(ceFullOtherContentType.isValid())
    t.ok(!ceFullOtherContentType.isStrict)
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = ceFullOtherContentType.serialize()
      assert(ceFullOtherContentTypeSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentType, {
        encoder: 'encoderSample'
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
      const ceFullOtherContentTypeBad = new CloudEvent(null,
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptions,
          datacontenttype: 'application/xml'
        },
        ceCommonExtensions
      )
      assert(ceFullOtherContentTypeBad !== null)
      t.ok(ceFullOtherContentTypeBad)
      t.ok(!ceFullOtherContentTypeBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeBad, {
        encodedData: ceDataAsXmlString,
        onlyValid: false
      })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeBad, {
          encodedData: ceDataAsXmlString,
          onlyValid: true
        })
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  }

  {
    // the same but with strict mode enabled ...
    // expect validation errors here because content type is not default and data is not a string,
    // so use encoder/decoder to let serialization/deserialization work in this case (strict) ...
    const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contenttype/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptionsStrict,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentTypeStrict !== null)
    t.ok(ceFullOtherContentTypeStrict)
    t.ok(!ceFullOtherContentTypeStrict.isValid())
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
      const ceFullOtherContentTypeStrictSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, { onlyValid: true })
      assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeStrictSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encoder: null,
        encodedData: null,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeSerialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encoder: 'encoderSample'
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
      const ceFullOtherContentTypeStrictBad = new CloudEvent('1/non-default-contenttype/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptionsStrict,
          datacontenttype: 'application/xml'
        },
        ceCommonExtensions
      )
      assert(ceFullOtherContentTypeStrictBad !== null)
      t.ok(ceFullOtherContentTypeStrictBad)
      ceFullOtherContentTypeStrictBad.id = null // remove some mandatory attribute now, to let serialization fail
      t.ok(!ceFullOtherContentTypeStrictBad.isValid())
      const ceFullStrictBadSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
        encodedData: ceDataAsXmlString,
        onlyValid: false
      })
      t.ok(ceFullStrictBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullStrictBadSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
          encodedData: ceDataAsXmlString,
          onlyValid: true
        })
        assert(ceFullStrictBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  }
})

// sample encoding function, to use in tests here
function encoderSample () {
  // return ceDataAsXmlString
  return `<data encoder="sample" />`
}

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contenttype and right serialization options, expect success', (t) => {
  t.plan(28)

  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(encoderSample)
  t.ok(V.isFunction(encoderSample))
  t.ok(!V.ensureIsFunction(encoderSample, 'encoderSample')) // no error returned

  {
    // create an instance with non default contenttype (other options default): expected success ...
    // when I try to serialize specifying right serialization options, expect success ...
    const ceFullOtherContentType = new CloudEvent('1/non-default-contenttype/sample-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptions,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentType !== null)
    t.ok(ceFullOtherContentType)
    t.ok(ceFullOtherContentType.isValid())
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const cceFullOtherContentTypeSerialized1 = ceFullOtherContentType.serialize({
      encoder: encoderSample
    })
    t.ok(cceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const cceFullOtherContentTypeSerialized2 = ceFullOtherContentType.serialize({
      encodedData: ceDataAsXmlString
    })
    t.ok(cceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const fixedEncodedData = `<data "fixed"="encoded" />`
    const cceFullOtherContentTypeSerialized3 = ceFullOtherContentType.serialize({
      encoder: encoderSample,
      // encodedData: undefined
      // encodedData: null
      // encodedData: ceDataAsXmlString
      encodedData: fixedEncodedData
    })
    t.ok(cceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const cceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderSample,
      encodedData: fixedEncodedData,
      onlyValid: false
    })
    t.ok(cceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const cceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderSample,
      encodedData: fixedEncodedData,
      onlyValid: true
    })
    t.ok(cceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
  }

  {
    // the same but with strict mode enabled ...
    // expect validation errors here because content type is not default and data is not a string,
    // so use encoder/decoder to let serialization/deserialization work in this case (strict) ...
    const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contenttype/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptionsStrict,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentTypeStrict !== null)
    t.ok(ceFullOtherContentTypeStrict)
    t.ok(!ceFullOtherContentTypeStrict.isValid())
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeStrictSerialized1 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderSample
    })
    t.ok(ceFullOtherContentTypeStrictSerialized1)
    t.ok(!CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized2 = ceFullOtherContentTypeStrict.serialize({
      encodedData: ceDataAsXmlString
    })
    t.ok(ceFullOtherContentTypeStrictSerialized2)
    t.ok(!CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const fixedEncodedData = `<data "fixed"="encoded" />`
    const ceFullOtherContentTypeStrictSerialized3 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderSample,
      // encodedData: undefined
      // encodedData: null
      // encodedData: ceDataAsXmlString
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeStrictSerialized3)
    t.ok(!CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderSample,
      encodedData: fixedEncodedData,
      onlyValid: false
    })
    t.ok(ceFullOtherContentTypeStrictSerialized4)
    t.ok(!CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderSample,
      encodedData: fixedEncodedData,
      onlyValid: true
    })
    // note that onlyValid here is a check on transformed data ...
    t.ok(ceFullOtherContentTypeStrictSerialized5)
    t.ok(V.isStringNotEmpty(ceFullOtherContentTypeStrictSerialized5))
  }
})

/** @test {CloudEvent} */
test('ensure the JSON Schema for a CloudEvent (static and for a normal instance) is available', (t) => {
  t.plan(6)

  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  // get JSON Schema from a static method
  const jsonSchemaStatic = CloudEvent.getJSONSchema()
  assert(jsonSchemaStatic !== null)
  t.ok(jsonSchemaStatic)
  t.strictEqual(typeof jsonSchemaStatic, 'object')

  // create a sample CloudEvent instance ...
  const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
    ceNamespace,
    ceServerUrl,
    ceCommonData, // data
    ceCommonOptionsStrict,
    ceCommonExtensions
  )
  assert(ceFullStrict !== null)
  t.ok(ceFullStrict)
  // get JSON Schema from that instance
  const jsonSchema = ceFullStrict.schema
  assert(jsonSchema !== null)
  t.ok(jsonSchema)
  t.strictEqual(typeof jsonSchema, 'object')
})

/** create some common data with nested attributes, for better reuse in tests */
const ceCommonNestedData = { ...ceCommonData,
  nested1: {
    level1attribute: 'level1attributeValue',
    nested2: {
      level2attribute: 'level2attributeValue',
      nested3: {
        level3attribute: 'level3attributeValue'
      }
    }
  }
}

const { CloudEventTransformer: T } = require('../src/')
const ceNestedFullSerializedJson = `{"id":"1/full/sample-data-nested/no-strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2019,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"specversion":"0.3","datacontenttype":"application/json","time":"${T.timestampToString(commonEventTime)}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","exampleExtension":"value"}`
const ceNestedFullStrictSerializedJson = `{"id":"1/full/sample-data-nested/strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2019,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"specversion":"0.3","datacontenttype":"application/json","time":"${T.timestampToString(commonEventTime)}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","com_github_smartiniOnGitHub_cloudevent":{"strict":true},"exampleExtension":"value"}`
const ceFullOtherContentTypeSerializedJson = `{"id":"1/full/sample-data-nested/no-strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":"<data 'hello'='world' 'year'='2019' />","specversion":"0.3","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleExtension":"value","schemaurl":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeStrictSerializedJson = `{"id":"1/full/sample-data-nested/strict","type":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":"<data 'hello'='world' 'year'='2019' />","specversion":"0.3","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleExtension":"value","com_github_smartiniOnGitHub_cloudevent":{"strict":true},"schemaurl":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeSerializedBadJson = `{"data":"<data 'hello'='world' 'year'='2019' />","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleExtension":"value"}`
const ceFullOtherContentTypeStrictSerializedBadJson = `{"data":"<data 'hello'='world' 'year'='2019' />","datacontenttype":"application/xml","time":"${T.timestampToString(commonEventTime)}","exampleExtension":"value","com_github_smartiniOnGitHub_cloudevent":{"strict":true}}`

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON with nested data, and ensure they are right', (t) => {
  t.plan(52)

  const { CloudEvent } = require('../src/')
  // t.ok(CloudEvent)

  {
    const ceFull = new CloudEvent('1/full/sample-data-nested/no-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonNestedData, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFull !== null)
    t.ok(ceFull)
    t.ok(ceFull.isValid())
    t.ok(ceFull.validate().length === 0)
    t.ok(ceFull.validate({ strict: false }).length === 0)
    t.ok(ceFull.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFull))
    t.ok(CloudEvent.validateEvent(ceFull).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)

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

    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFull, { onlyValid: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFull, { onlyValid: true })
    t.ok(ceFullSerializedOnlyValidTrue)

    const ceFullSerializedComparison = ceNestedFullSerializedJson
    t.strictSame(ceFullSerialized, ceFullSerializedComparison)
    const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullDeserialized.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFull, ceFullDeserialized)

    // ensure payload data is a copy of event data
    let dataShallowClone = ceFull.payload
    // then ensure they are different object (references) ...
    assert(dataShallowClone !== null)
    assert(dataShallowClone !== ceFull.data) // they must be different object references
    assert(dataShallowClone !== ceFull.payload) // they must be different object references, at any invocation
    t.notEqual(dataShallowClone, ceFull.data)
    t.notStrictEqual(dataShallowClone, ceFull.data)
    t.notEqual(dataShallowClone, ceFull.payload)
    dataShallowClone = 'changed: true' // reassign to test that data won't be affected by that change
    t.notEqual(dataShallowClone, ceFull.data)
    t.strictNotSame(dataShallowClone, ceFull.data)
    t.notEqual(dataShallowClone, ceFull.payload)
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = new CloudEvent('1/full/sample-data-nested/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonNestedData, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.validate().length === 0)
    t.ok(ceFullStrict.validate({ strict: true }).length === 0)
    t.ok(ceFullStrict.validate({ strict: false }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFullStrict))
    t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)

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

    const ceFullStrictSerializedOnlyValidFalse = ceSerialize(ceFullStrict, { onlyValid: false })
    t.ok(ceFullStrictSerializedOnlyValidFalse)
    const ceFullStrictSerializedOnlyValidTrue = ceSerialize(ceFullStrict, { onlyValid: true })
    t.ok(ceFullStrictSerializedOnlyValidTrue)

    const ceFullStrictSerializedComparison = ceNestedFullStrictSerializedJson
    t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
    const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullStrictDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
    ceFullStrictDeserialized.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
    t.same(ceFullStrict, ceFullStrictDeserialized)

    // ensure payload data is a copy of event data
    let dataShallowCloneStrict = ceFullStrict.payload
    // then ensure they are different object (references) ...
    assert(dataShallowCloneStrict !== null)
    assert(dataShallowCloneStrict !== ceFullStrict.data) // they must be different object references
    assert(dataShallowCloneStrict !== ceFullStrict.payload) // they must be different object references, at any invocation
    t.notEqual(dataShallowCloneStrict, ceFullStrict.data)
    t.notStrictEqual(dataShallowCloneStrict, ceFullStrict.data)
    t.notEqual(dataShallowCloneStrict, ceFullStrict.payload)
    dataShallowCloneStrict = 'changed: true' // reassign to test that data won't be affected by that change
    t.notEqual(dataShallowCloneStrict, ceFullStrict.data)
    t.strictNotSame(dataShallowCloneStrict, ceFullStrict.data)
    t.notEqual(dataShallowCloneStrict, ceFullStrict.payload)
  }
})

/** @test {CloudEvent} */
test('deserialize generic strings (not JSON representation for an Object) into a CloudEvent instance, expected Errors', (t) => {
  t.plan(10)

  const { CloudEvent } = require('../src/') // get references via destructuring
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
    const deserialized = CloudEvent.deserializeEvent('{ sample string, not a valid json }', { onlyValid: false })
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a string not representing an object (in JSON)')
  t.throws(function () {
    const deserialized = CloudEvent.deserializeEvent('{ sample string, not a valid json }', { onlyValid: true })
    assert(deserialized === null) // never executed
  }, Error, 'Expected exception when deserializing a string not representing an object (in JSON)')
})

/** @test {CloudEvent} */
test('deserialize some CloudEvent instances from JSON, and ensure built instances are right', (t) => {
  t.plan(54)

  const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring

  {
    const serialized = ceNestedFullSerializedJson
    // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    const ceDeserialized = CloudEvent.deserializeEvent(serialized)
    assert(ceDeserialized !== null)
    // console.log(`DEBUG - cloudEvent type: ${typeof ceDeserialized}`)
    // console.log(`DEBUG - cloudEvent details: ceDeserialized = ${JSON.stringify(ceDeserialized)}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG - cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG - cloudEvent validation (strict): ${ceDeserialized.validate({ strict: true })}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate({ strict: false }).length === 0)
    t.ok(ceDeserialized.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: true }).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isDate(ceDeserialized.time))
    t.ok(V.isDateValid(ceDeserialized.time))
    t.ok(V.isDatePast(ceDeserialized.time))
    t.strictSame(ceDeserialized.time.getTime(), commonEventTime.getTime())
    t.notStrictEqual(ceDeserialized.time, commonEventTime)
    t.notEqual(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG - cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG - cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data)
    t.ok(V.isObject(ceDeserialized.data))
    t.ok(ceDeserialized.payload)
    t.ok(V.isObject(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictSame(ceDeserialized.data, ceDeserialized.payload)
    // then ensure they are different object (references) ...
    t.notStrictEqual(ceDeserialized.data, ceDeserialized.payload)
    t.notEqual(ceDeserialized.data, ceDeserialized.payload)
  }

  {
    // the same but with strict mode enabled ...
    const serialized = ceNestedFullStrictSerializedJson
    // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    const ceDeserialized = CloudEvent.deserializeEvent(serialized)
    assert(ceDeserialized !== null)
    // console.log(`DEBUG - cloudEvent type: ${typeof ceDeserialized}`)
    // console.log(`DEBUG - cloudEvent details: ceDeserialized = ${JSON.stringify(ceDeserialized)}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG - cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG - cloudEvent validation (strict): ${ceDeserialized.validate({ strict: true })}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate({ strict: false }).length === 0)
    t.ok(ceDeserialized.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: true }).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isDate(ceDeserialized.time))
    t.ok(V.isDateValid(ceDeserialized.time))
    t.ok(V.isDatePast(ceDeserialized.time))
    t.strictSame(ceDeserialized.time.getTime(), commonEventTime.getTime())
    t.notStrictEqual(ceDeserialized.time, commonEventTime)
    t.notEqual(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG - cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG - cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data)
    t.ok(V.isObject(ceDeserialized.data))
    t.ok(ceDeserialized.payload)
    t.ok(V.isObject(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictSame(ceDeserialized.data, ceDeserialized.payload)
    // then ensure they are different object (references) ...
    t.notStrictEqual(ceDeserialized.data, ceDeserialized.payload)
    t.notEqual(ceDeserialized.data, ceDeserialized.payload)
  }
})

/** @test {CloudEvent} */
test('deserialize a CloudEvent instance with a non default contenttype and empty/wrong deserialization options, expect error', (t) => {
  t.plan(18)

  const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring

  {
    const serialized = ceFullOtherContentTypeSerializedJson
    // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized)
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: 'decoderSample' // bad decoder function
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
        decodedData: ceDataAsXmlString,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: ceDataAsXmlString,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeSerializedBadJson, {
        decodedData: ceDataAsXmlString,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeSerializedBadJson, {
        decodedData: ceDataAsXmlString,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
  }

  {
    // the same but with strict mode enabled ...
    const serialized = ceFullOtherContentTypeStrictSerializedJson
    // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: null,
        decodedData: null
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: 'decoderSample' // bad decoder function
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: true // bad decoder data
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: ceDataAsXmlString,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: ceDataAsXmlString,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // bad assertion
    }, Error, 'Expected exception due to a bad assertion')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeStrictSerializedBadJson, {
        decodedData: ceDataAsXmlString,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeStrictSerializedBadJson, {
        decodedData: ceDataAsXmlString,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
  }
})

// sample decoding function, to use in tests here
function decoderSample () {
  // return ceCommonData
  return `<data "decoded"="Sample" />`
}

/** @test {CloudEvent} */
test('deserialize a CloudEvent instance with a non default contenttype and right deserialization options, expect success', (t) => {
  t.plan(18)

  const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring
  t.ok(V)
  t.ok(decoderSample)
  t.ok(V.isFunction(decoderSample))
  t.ok(!V.ensureIsFunction(decoderSample, 'decoderSample')) // no error returned

  {
    const serialized = ceFullOtherContentTypeSerializedJson
    // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    // test different combinations of deserialization options
    // note that if given, decoder function has priority over decoded data
    const ceFullOtherContentTypeDeserialized1 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample
    })
    t.ok(ceFullOtherContentTypeDeserialized1)
    const fixedDecodedData = `<data "fixed"="decoded" />`
    const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized2)
    const ceFullOtherContentTypeDeserialized3 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      // decodedData: undefined
      // decodedData: null
      // decodedData: ceCommonData
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized3)
    const ceFullOtherContentTypeDeserialized4 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      decodedData: fixedDecodedData,
      onlyValid: false
    })
    t.ok(ceFullOtherContentTypeDeserialized4)
    const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      decodedData: fixedDecodedData,
      onlyValid: true
    })
    t.ok(ceFullOtherContentTypeDeserialized5)
  }

  {
    // the same but with strict mode enabled ...
    const serialized = ceFullOtherContentTypeStrictSerializedJson
    // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
    t.ok(serialized)
    t.ok(V.isString(serialized))

    // test different combinations of deserialization options
    // note that if given, decoder function has priority over decoded data
    const ceFullOtherContentTypeDeserialized1 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample
    })
    t.ok(ceFullOtherContentTypeDeserialized1)
    const fixedDecodedData = `<data "fixed"="decoded" />`
    const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized2)
    const ceFullOtherContentTypeDeserialized3 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      // decodedData: undefined
      // decodedData: null
      // decodedData: ceCommonData
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized3)
    const ceFullOtherContentTypeDeserialized4 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      decodedData: fixedDecodedData,
      onlyValid: false
    })
    t.ok(ceFullOtherContentTypeDeserialized4)
    const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      decodedData: fixedDecodedData,
      onlyValid: true
    })
    t.ok(ceFullOtherContentTypeDeserialized5)
  }
})

/** @test {CloudEvent} */
test('serialize and deserialize a big CloudEvent instance (more than 64 KB)', (t) => {
  t.plan(55)

  const { CloudEvent } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)

  t.ok(ceBigString)
  t.strictSame(ceBigString.length, ceBigStringLength)

  {
    const ceFull = new CloudEvent('1/full/sample-data-nested/no-strict',
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFull !== null)
    t.ok(ceFull)
    t.ok(ceFull.isValid())
    t.ok(ceFull.validate().length === 0)
    t.ok(ceFull.validate({ strict: false }).length === 0)
    t.ok(ceFull.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFull))
    t.ok(CloudEvent.validateEvent(ceFull).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)

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
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFull, { onlyValid: false, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse)
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFull, { onlyValid: true, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidTrue)
    const ceFullDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue)
    t.ok(ceFullDeserializedOnlyValidTrue)
    t.strictSame(ceFullSerializedOnlyValidFalse, ceFullSerializedOnlyValidTrue)

    // enable the flag to return the serialized string only if it's less than 64 KB, expected errors here
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFull, { onlyValid: false, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFull, { onlyValid: true, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, { onlyValid: false, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, { onlyValid: true, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    const ceFullBadBig = new CloudEvent(null,
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullBadBig !== null)
    t.ok(ceFullBadBig)
    const serialized = CloudEvent.serializeEvent(ceFullBadBig, { onlyValid: false, onlyIfLessThan64KB: false })
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, { onlyValid: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, { onlyValid: false, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = new CloudEvent('1/full/sample-data-nested/strict',
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.validate().length === 0)
    t.ok(ceFullStrict.validate({ strict: false }).length === 0)
    t.ok(ceFullStrict.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFullStrict))
    t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)

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
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullStrict, { onlyValid: false, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse)
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullStrict, { onlyValid: true, onlyIfLessThan64KB: false })
    t.ok(ceFullSerializedOnlyValidTrue)
    const ceFullDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue)
    t.ok(ceFullDeserializedOnlyValidTrue)
    t.strictSame(ceFullSerializedOnlyValidFalse, ceFullSerializedOnlyValidTrue)

    // enable the flag to return the serialized string only if it's less than 64 KB, expected errors here
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullStrict, { onlyValid: false, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullStrict, { onlyValid: true, onlyIfLessThan64KB: true })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, { onlyValid: false, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, { onlyValid: true, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    // the same but with strict mode enabled ...
    const ceFullBadBigStrict = new CloudEvent('1/full/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullBadBigStrict !== null)
    t.ok(ceFullBadBigStrict)
    const serialized = CloudEvent.serializeEvent(ceFullBadBigStrict, { onlyValid: false, onlyIfLessThan64KB: false })
    ceFullBadBigStrict.id = null // remove some mandatory attribute now, to let deserialization fail
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, { onlyValid: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, { onlyValid: false, onlyIfLessThan64KB: true })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }
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
  t.plan(53)

  const { CloudEvent } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)

  t.ok(ceBigString)
  t.strictSame(ceBigString.length, ceBigStringLength)

  {
    // create an instance with non default contenttype (other options default): expected success ...
    // when I try to serialize specifying right serialization options, expect success ...
    const ceFullOtherContentType = new CloudEvent('1/non-default-contenttype/sample-data/no-strict',
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      {
        ...ceCommonOptions,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentType !== null)
    t.ok(ceFullOtherContentType)
    t.ok(ceFullOtherContentType.isValid())
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const cceFullOtherContentTypeSerialized1 = ceFullOtherContentType.serialize({
      encoder: encoderBigSample
    })
    t.ok(cceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const cceFullOtherContentTypeSerialized2 = ceFullOtherContentType.serialize({
      encodedData: `<data "random"="${ceBigString}" />`
    })
    t.ok(cceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const fixedEncodedData = `<data "fixed"="${ceBigString}" />`
    const cceFullOtherContentTypeSerialized3 = ceFullOtherContentType.serialize({
      encoder: encoderBigSample,
      encodedData: fixedEncodedData
    })
    t.ok(cceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const cceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      onlyValid: false
    })
    t.ok(cceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const cceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      onlyValid: true
    })
    t.ok(cceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))

    // set some flags
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample, onlyValid: false, onlyIfLessThan64KB: false
    })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
      decoder: decoderBigSample
    })
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentType, {
      encoder: encoderBigSample, onlyValid: true, onlyIfLessThan64KB: false
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
        encoder: encoderBigSample, onlyValid: false, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullOtherContentType, {
        encoder: encoderBigSample, onlyValid: true, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
        decoder: decoderBigSample, onlyValid: false, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, {
        decoder: decoderBigSample, onlyValid: true, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    const ceFullBadBig = new CloudEvent(null,
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      {
        ...ceCommonOptions,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullBadBig !== null)
    t.ok(ceFullBadBig)
    const serialized = CloudEvent.serializeEvent(ceFullBadBig, {
      encoder: encoderBigSample, onlyValid: false, onlyIfLessThan64KB: false
    })
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, onlyValid: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, onlyValid: false, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }

  {
    // the same but with strict mode enabled ...
    const ceFullOtherContentTypeBadStrict = new CloudEvent('1/non-default-contenttype/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      {
        ...ceCommonOptionsStrict,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentTypeBadStrict !== null)
    t.ok(ceFullOtherContentTypeBadStrict)
    t.ok(!ceFullOtherContentTypeBadStrict.isValid())

    const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contenttype/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceBigString, // data
      {
        ...ceCommonOptionsStrict,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullOtherContentTypeStrict !== null)
    t.ok(ceFullOtherContentTypeStrict)
    t.ok(ceFullOtherContentTypeStrict.isValid())
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const cceFullOtherContentTypeSerialized1 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderBigSample
    })
    t.ok(cceFullOtherContentTypeSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const cceFullOtherContentTypeSerialized2 = ceFullOtherContentTypeStrict.serialize({
      encodedData: `<data "random"="${ceBigString}" />`
    })
    t.ok(cceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const fixedEncodedData = `<data "fixed"="${ceBigString}" />`
    const cceFullOtherContentTypeSerialized3 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderBigSample,
      encodedData: fixedEncodedData
    })
    t.ok(cceFullOtherContentTypeSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const cceFullOtherContentTypeSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      onlyValid: false
    })
    t.ok(cceFullOtherContentTypeSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const cceFullOtherContentTypeSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample,
      encodedData: fixedEncodedData,
      onlyValid: true
    })
    t.ok(cceFullOtherContentTypeSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))

    // set some flags
    const ceFullSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample, onlyValid: false, onlyIfLessThan64KB: false
    })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullDeserializedOnlyValidFalse = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
      decoder: decoderBigSample
    })
    t.ok(ceFullDeserializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderBigSample, onlyValid: true, onlyIfLessThan64KB: false
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
        encoder: encoderBigSample, onlyValid: false, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const serialized = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        encoder: encoderBigSample, onlyValid: true, onlyIfLessThan64KB: true
      })
      assert(serialized === null) // never executed
    }, Error, 'Expected exception when serializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    // deserialize instances just serialized, but now with the flag enabled, so expect errors here
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidFalse, {
        decoder: decoderBigSample, onlyValid: false, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(ceFullSerializedOnlyValidTrue, {
        decoder: decoderBigSample, onlyValid: true, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a Cloudevent bigger than 64 KB (with the flag to forbid it enabled)')
  }

  {
    const ceFullBadBigStrict = new CloudEvent('1/full/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      { random: ceBigString }, // data
      {
        ...ceCommonOptionsStrict,
        datacontenttype: 'application/xml'
      },
      ceCommonExtensions
    )
    assert(ceFullBadBigStrict !== null)
    t.ok(ceFullBadBigStrict)
    const serialized = CloudEvent.serializeEvent(ceFullBadBigStrict, {
      encoder: encoderBigSample, onlyValid: false, onlyIfLessThan64KB: false
    })
    ceFullBadBigStrict.id = null // remove some mandatory attribute now, to let deserialization fail
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, onlyValid: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
    t.throws(function () {
      const deserialized = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderBigSample, onlyValid: false, onlyIfLessThan64KB: true
      })
      assert(deserialized === null) // never executed
    }, Error, 'Expected exception when deserializing a not valid big Cloudevent, with related flag enabled')
  }
})

/** @test {CloudEvent} */
test('create and deserialize some CloudEvent instances with datacontentencoding specified, and ensure they are right', (t) => {
  t.plan(120)

  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  // t.ok(CloudEvent)

  const ceOptionsWithDataEncoding = { ...ceCommonOptions, datacontentencoding: 'Base64' }
  const ceOptionsWithDataEncodingNotSupported = { ...ceCommonOptions, datacontentencoding: 'Custom encoding' }
  const ceDataAsString = 'Hello World, 2019'
  const ceDataEncoded = 'SGVsbG8gV29ybGQsIDIwMTk='

  {
    const ceFull = new CloudEvent('1/full/sample-data-nested/no-strict',
      ceNamespace,
      ceServerUrl,
      ceDataAsString, // data
      ceOptionsWithDataEncoding,
      ceCommonExtensions
    )
    t.ok(ceFull)
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
    t.ok(CloudEvent.isValidEvent(ceFull, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 0)
    t.strictSame(ceFull.data, ceDataAsString)
    t.notStrictSame(ceFull.data, ceDataEncoded)
    t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)

    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
    t.ok(ceFullSerializedStatic)
    const ceFullSerialized = ceFull.serialize()
    t.ok(ceFullSerialized)
    t.strictSame(ceFullSerializedStatic, ceFullSerialized)
    const ceSerialize = CloudEvent.serializeEvent
    t.ok(ceSerialize)
    const ceFullSerializedFunction = ceSerialize(ceFull)
    t.ok(ceFullSerializedFunction)
    t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
    t.strictSame(ceFullSerializedFunction, ceFullSerialized)
    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFull, { onlyValid: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFull, { onlyValid: true })
    t.ok(ceFullSerializedOnlyValidTrue)

    const ceDeserialized = CloudEvent.deserializeEvent(ceFullSerializedStatic)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG - cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG - cloudEvent validation (strict): ${ceDeserialized.validate({ strict: true })}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate({ strict: false }).length === 0)
    t.ok(ceDeserialized.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: true }).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isDate(ceDeserialized.time))
    t.ok(V.isDateValid(ceDeserialized.time))
    t.ok(V.isDatePast(ceDeserialized.time))
    t.strictSame(ceDeserialized.time.getTime(), commonEventTime.getTime())
    t.notStrictEqual(ceDeserialized.time, commonEventTime)
    t.notEqual(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG - cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG - cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data)
    t.ok(V.isString(ceDeserialized.data))
    t.ok(ceDeserialized.payload)
    t.ok(V.isString(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictSame(ceDeserialized.data, ceDeserialized.payload)
    // and that they are the same of initial value ...
    t.strictSame(ceDeserialized.data, ceFull.data)
    t.notStrictSame(ceDeserialized.data, ceDataEncoded)
    // then ensure they are different object (references) ...
    // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...

    {
      const serialized = ceFullSerializedStatic
      // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
      t.ok(serialized)
      t.ok(V.isString(serialized))
      // some checks on serialized instance
      const ceFullDeserializedJSON = JSON.parse(ceFullSerializedStatic) // note that some fields (like dates) will be different when deserialized in this way ...
      ceFullDeserializedJSON.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      // ceFullDeserializedJSON.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
      // console.log(`DEBUG - deserialized cloudEvent: data = '${ceFullDeserializedJSON.data}'`)
      // next tests are so because here deserialization is done with standard JSON, and not with ce specific method ...
      t.notStrictSame(ceFullDeserializedJSON, ceFull)
      t.notStrictSame(ceFullDeserializedJSON.data, ceFull.data)
      t.strictSame(ceFullDeserializedJSON.data, ceDataEncoded)
    }
    {
      // test with not supported data (not a string representation)
      const serialized = ceFullSerializedStatic.replace(ceDataEncoded, '{}')
      // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
      // some checks on serialized instance, but using deserialization methods
      t.throws(function () {
        const ceDeserialized = CloudEvent.deserializeEvent(serialized)
        assert(ceDeserialized === undefined) // never executed
      }, Error, 'Expected exception when creating a CloudEvent with datacontentencoding set and data not a string')
    }
    {
      // test with a not supported datacontentencoding
      // update serialized with bad data
      const serialized = ceFullSerializedStatic.replace('Base64', 'Custom encoding')
      // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
      // some checks on serialized instance, but using deserialization methods
      t.throws(function () {
        const ceDeserialized = CloudEvent.deserializeEvent(serialized)
        assert(ceDeserialized === undefined) // never executed
      }, Error, 'Expected exception when creating a CloudEvent with datacontentencoding not supported')
    }
    {
      // test with a not supported datacontentencoding
      const ceFull = new CloudEvent('1/full/sample-data-nested/no-strict',
        ceNamespace,
        ceServerUrl,
        ceDataAsString, // data
        ceOptionsWithDataEncodingNotSupported,
        ceCommonExtensions
      )
      t.ok(ceFull)
      t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
      t.ok(CloudEvent.isValidEvent(ceFull, { strict: true }))
      t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 0)
      t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 0)
      t.strictSame(ceFull.data, ceDataAsString)
      t.notStrictSame(ceFull.data, ceDataEncoded)
      t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
      t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
      const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
      t.ok(ceFullSerializedStatic)
    }
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = new CloudEvent('1/full/sample-data-nested/strict',
      ceNamespace,
      ceServerUrl,
      ceDataAsString, // data
      { ...ceOptionsWithDataEncoding, strict: true },
      ceCommonExtensions
    )
    t.ok(ceFullStrict)
    t.ok(CloudEvent.isValidEvent(ceFullStrict, { strict: false }))
    t.ok(CloudEvent.isValidEvent(ceFullStrict, { strict: true }))
    t.strictSame(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length, 0)
    t.strictSame(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length, 0)
    t.strictSame(ceFullStrict.data, ceDataAsString)
    t.notStrictSame(ceFullStrict.data, ceDataEncoded)
    t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
    t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)

    const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFullStrict)
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
    const ceFullSerializedOnlyValidFalse = ceSerialize(ceFullStrict, { onlyValid: false })
    t.ok(ceFullSerializedOnlyValidFalse)
    const ceFullSerializedOnlyValidTrue = ceSerialize(ceFullStrict, { onlyValid: true })
    t.ok(ceFullSerializedOnlyValidTrue)

    const ceDeserialized = CloudEvent.deserializeEvent(ceFullSerializedStatic)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceDeserialized, 'ceDeserialized')}`)
    // console.log(`DEBUG - cloudEvent validation: ${ceDeserialized.validate()}`)
    // console.log(`DEBUG - cloudEvent validation (strict): ${ceDeserialized.validate({ strict: true })}`)
    t.ok(ceDeserialized)
    t.ok(V.isClass(ceDeserialized, CloudEvent))
    t.ok(ceDeserialized.isValid())
    t.ok(ceDeserialized.validate().length === 0)
    t.ok(ceDeserialized.validate({ strict: false }).length === 0)
    t.ok(ceDeserialized.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceDeserialized))
    t.ok(CloudEvent.validateEvent(ceDeserialized).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceDeserialized, { strict: true }).length === 0)
    t.ok(CloudEvent.isCloudEvent(ceDeserialized))

    // inspect content of deserialized CloudEvent, at least on some attributes
    t.ok(ceDeserialized.time)
    t.ok(V.isDate(ceDeserialized.time))
    t.ok(V.isDateValid(ceDeserialized.time))
    t.ok(V.isDatePast(ceDeserialized.time))
    t.strictSame(ceDeserialized.time.getTime(), commonEventTime.getTime())
    t.notStrictEqual(ceDeserialized.time, commonEventTime)
    t.notEqual(ceDeserialized.time, commonEventTime)
    // console.log(`DEBUG - cloudEvent data: ${T.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
    // console.log(`DEBUG - cloudEvent payload: ${T.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
    t.ok(ceDeserialized.data)
    t.ok(V.isString(ceDeserialized.data))
    t.ok(ceDeserialized.payload)
    t.ok(V.isString(ceDeserialized.payload))
    // then ensure the value of both are the same ...
    t.strictSame(ceDeserialized.data, ceDeserialized.payload)
    // and that they are the same of initial value ...
    t.strictSame(ceDeserialized.data, ceFullStrict.data)
    t.notStrictSame(ceDeserialized.data, ceDataEncoded)
    // then ensure they are different object (references) ...
    // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...

    {
      const serialized = ceFullSerializedStatic
      // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
      t.ok(serialized)
      t.ok(V.isString(serialized))
      // some checks on serialized instance
      const ceFullDeserializedJSON = JSON.parse(ceFullSerializedStatic) // note that some fields (like dates) will be different when deserialized in this way ...
      ceFullDeserializedJSON.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      // ceFullDeserializedJSON.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
      // console.log(`DEBUG - deserialized cloudEvent: data = '${ceFullDeserializedJSON.data}'`)
      // next tests are so because here deserialization is done with standard JSON, and not with ce specific method ...
      t.notStrictSame(ceFullDeserializedJSON, ceFullStrict)
      t.notStrictSame(ceFullDeserializedJSON.data, ceFullStrict.data)
      t.strictSame(ceFullDeserializedJSON.data, ceDataEncoded)
    }
    {
      // test with not supported data (not a string representation)
      const serialized = ceFullSerializedStatic.replace(ceDataEncoded, '')
      // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
      // some checks on serialized instance, but using deserialization methods
      t.throws(function () {
        const ceDeserialized = CloudEvent.deserializeEvent(serialized)
        assert(ceDeserialized === undefined) // never executed
      }, Error, 'Expected exception when creating a CloudEvent with datacontentencoding set and data not a string')
    }
    {
      // test with a not supported datacontentencoding
      const serialized = ceFullSerializedStatic.replace('Base64', 'Custom encoding')
      // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
      // some checks on serialized instance, but using deserialization methods
      t.throws(function () {
        const ceDeserialized = CloudEvent.deserializeEvent(serialized)
        assert(ceDeserialized === undefined) // never executed
      }, Error, 'Expected exception when creating a CloudEvent with datacontentencoding not supported')
    }
    {
      // test with a not supported datacontentencoding
      const ceFull = new CloudEvent('1/full/sample-data-nested/strict',
        ceNamespace,
        ceServerUrl,
        ceDataAsString, // data
        { ...ceOptionsWithDataEncodingNotSupported, strict: true },
        ceCommonExtensions
      )
      t.ok(ceFull)
      t.ok(CloudEvent.isValidEvent(ceFull, { strict: false }))
      t.ok(CloudEvent.isValidEvent(ceFull, { strict: true }))
      t.strictSame(CloudEvent.validateEvent(ceFull, { strict: false }).length, 0)
      t.strictSame(CloudEvent.validateEvent(ceFull, { strict: true }).length, 0)
      t.strictSame(ceFull.data, ceDataAsString)
      t.notStrictSame(ceFull.data, ceDataEncoded)
      t.strictSame(T.stringToBase64(ceDataAsString), ceDataEncoded)
      t.strictSame(T.stringFromBase64(T.stringToBase64(ceDataAsString)), ceDataAsString)
      const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
      t.ok(ceFullSerializedStatic)
    }
  }
})
