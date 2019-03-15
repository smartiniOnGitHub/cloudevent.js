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
test('ensure serialization functions exists (heck only the static method here)', (t) => {
  t.plan(7)

  {
    const { CloudEvent } = require('../src/') // get references via destructuring
    t.ok(CloudEvent)
    // optional, using some standard Node.js assert statements, as a sample
    assert(CloudEvent !== null)
    assert.strictEqual(typeof CloudEvent, 'function')
    assert(new CloudEvent() instanceof CloudEvent)
    assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    t.ok(CloudEvent)
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
    t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')

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
  eventTypeVersion: '1.0.0',
  eventTime: commonEventTime,
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
/** create a sample namespace for events here, for better reuse in tests */
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent'
/** create a sample common server URL, for better reuse in tests */
const ceServerUrl = '/test'
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { 'hello': 'world', year: 2018 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map([['key-1', 'value 1'], ['key-2', 'value 2']])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  t.plan(52)

  const { CloudEvent, CloudEventTransformer: T } = require('../src/')
  // t.ok(CloudEvent)

  {
    // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFull = new CloudEvent('1/full/sample-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      ceCommonOptions
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

    const ceFullSerializedComparison = `{"eventID":"1/full/sample-data/no-strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2018},"cloudEventsVersion":"0.1","contentType":"application/json","eventTime":"${T.timestampToString(commonEventTime)}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value"},"schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullSerialized, ceFullSerializedComparison)
    const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
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
        ceCommonOptions
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
  }

  {
    // the same but with strict mode enabled ...
    const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      ceCommonOptionsStrict
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

    const ceFullStrictSerializedComparison = `{"eventID":"1/full/sample-data/strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2018},"cloudEventsVersion":"0.1","contentType":"application/json","eventTime":"${T.timestampToString(commonEventTime)}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value","strict":true},"schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
    const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullStrictDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
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
        ceCommonOptionsStrict
      )
      assert(ceFullStrictBad !== null)
      t.ok(ceFullStrictBad)
      ceFullStrictBad.eventID = null // remove some mandatory attribute now, to let serialization fail
      t.ok(!ceFullStrictBad.isValid())
      const ceFullStrictBadSerializedOnlyValidFalse = ceSerialize(ceFullStrictBad, { onlyValid: false })
      t.ok(ceFullStrictBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullStrictBadSerializedOnlyValidTrue = ceSerialize(ceFullStrictBad, { onlyValid: true })
        assert(ceFullStrictBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  }
})

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contentType and empty serialization options, expect error', (t) => {
  t.plan(34)

  const { CloudEvent } = require('../src/')
  t.ok(CloudEvent)

  {
    // create an instance with non default contentType (other options default): expected success ...
    // when I try to serialize it without specifying serialization options, expect to have an error raised ...
    const ceFullOtherContentType = new CloudEvent('1/non-default-contentType/sample-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptions,
        contentType: 'application/xml'
      }
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
      ce.extensions = { strict: false }
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, false)
    }
    {
      const ce = ceFullOtherContentType
      delete ce.extensions
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, false)
    }

    {
      const ceFullOtherContentTypeBad = new CloudEvent(null,
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptions,
          contentType: 'application/xml'
        }
      )
      assert(ceFullOtherContentTypeBad !== null)
      t.ok(ceFullOtherContentTypeBad)
      t.ok(!ceFullOtherContentTypeBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeBad, {
        encodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: false
      })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeBad, {
          encodedData: `<data "hello"="world" "year"="2018" />`,
          onlyValid: true
        })
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  }

  {
    // the same but with strict mode enabled ...
    const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contentType/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptionsStrict,
        contentType: 'application/xml'
      }
    )
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
      ce.extensions = { strict: true }
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, true)
    }
    {
      const ce = ceFullOtherContentTypeStrict
      delete ce.extensions
      const flag = CloudEvent.isStrictEvent(ce)
      t.strictSame(flag, false)
    }

    {
      const ceFullOtherContentTypeStrictBad = new CloudEvent('1/non-default-contentType/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptions,
          contentType: 'application/xml'
        }
      )
      assert(ceFullOtherContentTypeStrictBad !== null)
      t.ok(ceFullOtherContentTypeStrictBad)
      ceFullOtherContentTypeStrictBad.eventID = null // remove some mandatory attribute now, to let serialization fail
      t.ok(!ceFullOtherContentTypeStrictBad.isValid())
      const ceFullStrictBadSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
        encodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: false
      })
      t.ok(ceFullStrictBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullStrictBadSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
          encodedData: `<data "hello"="world" "year"="2018" />`,
          onlyValid: true
        })
        assert(ceFullStrictBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  }
})

// sample encoding function, to use in tests here
function encoderSample () {
  // return `<data "hello"="world" "year"="2018" />`
  return `<data encoder="sample" />`
}

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contentType and right serialization options, expect success', (t) => {
  t.plan(28)

  const { CloudEvent, CloudEventValidator: V } = require('../src/')
  t.ok(CloudEvent)
  t.ok(encoderSample)
  t.ok(V.isFunction(encoderSample))
  t.ok(!V.ensureIsFunction(encoderSample, 'encoderSample')) // no error returned

  {
    // create an instance with non default contentType (other options default): expected success ...
    // when I try to serialize specifying right serialization options, expect success ...
    const ceFullOtherContentType = new CloudEvent('1/non-default-contentType/sample-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptions,
        contentType: 'application/xml'
      }
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
      encodedData: `<data "hello"="world" "year"="2018" />`
    })
    t.ok(cceFullOtherContentTypeSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    const fixedEncodedData = `<data "fixed"="encoded" />`
    const cceFullOtherContentTypeSerialized3 = ceFullOtherContentType.serialize({
      encoder: encoderSample,
      // encodedData: undefined
      // encodedData: null
      // encodedData: `<data "hello"="world" "year"="2018" />`
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
    const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contentType/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      {
        ...ceCommonOptionsStrict,
        contentType: 'application/xml'
      }
    )
    assert(ceFullOtherContentTypeStrict !== null)
    t.ok(ceFullOtherContentTypeStrict)
    t.ok(ceFullOtherContentTypeStrict.isValid())
    // test different combinations of serialization options
    // note that if given, encoder function has priority over encoded data
    const ceFullOtherContentTypeStrictSerialized1 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderSample
    })
    t.ok(ceFullOtherContentTypeStrictSerialized1)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized2 = ceFullOtherContentTypeStrict.serialize({
      encodedData: `<data "hello"="world" "year"="2018" />`
    })
    t.ok(ceFullOtherContentTypeStrictSerialized2)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const fixedEncodedData = `<data "fixed"="encoded" />`
    const ceFullOtherContentTypeStrictSerialized3 = ceFullOtherContentTypeStrict.serialize({
      encoder: encoderSample,
      // encodedData: undefined
      // encodedData: null
      // encodedData: `<data "hello"="world" "year"="2018" />`
      encodedData: fixedEncodedData
    })
    t.ok(ceFullOtherContentTypeStrictSerialized3)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized4 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderSample,
      encodedData: fixedEncodedData,
      onlyValid: false
    })
    t.ok(ceFullOtherContentTypeStrictSerialized4)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    const ceFullOtherContentTypeStrictSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
      encoder: encoderSample,
      encodedData: fixedEncodedData,
      onlyValid: true
    })
    t.ok(ceFullOtherContentTypeStrictSerialized5)
    t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
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
    ceCommonOptionsStrict
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
const ceNestedFullSerializedJson = `{"eventID":"1/full/sample-data-nested/no-strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2018,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"cloudEventsVersion":"0.1","contentType":"application/json","eventTime":"${T.timestampToString(commonEventTime)}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value"},"schemaURL":"http://my-schema.localhost.localdomain"}`
const ceNestedFullStrictSerializedJson = `{"eventID":"1/full/sample-data-nested/strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":{"hello":"world","year":2018,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"cloudEventsVersion":"0.1","contentType":"application/json","eventTime":"${T.timestampToString(commonEventTime)}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value","strict":true},"schemaURL":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeSerializedJson = `{"eventID":"1/full/sample-data-nested/no-strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":"<data 'hello'='world' 'year'='2018' />","cloudEventsVersion":"0.1","contentType":"application/xml","eventTime":"${T.timestampToString(commonEventTime)}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value"},"schemaURL":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeStrictSerializedJson = `{"eventID":"1/full/sample-data-nested/strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","source":"/test","data":"<data 'hello'='world' 'year'='2018' />","cloudEventsVersion":"0.1","contentType":"application/xml","eventTime":"${T.timestampToString(commonEventTime)}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value","strict":true},"schemaURL":"http://my-schema.localhost.localdomain"}`
const ceFullOtherContentTypeSerializedBadJson = `{"data":"<data 'hello'='world' 'year'='2018' />","contentType":"application/xml","eventTime":"${T.timestampToString(commonEventTime)}","extensions":{"exampleExtension":"value"}}`
const ceFullOtherContentTypeStrictSerializedBadJson = `{"data":"<data 'hello'='world' 'year'='2018' />","contentType":"application/xml","eventTime":"${T.timestampToString(commonEventTime)}","extensions":{"exampleExtension":"value","strict":true}}`

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
      ceCommonOptions
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
    ceFullDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
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
      ceCommonOptionsStrict
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
    ceFullStrictDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
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

  const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring

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
    t.ok(ceDeserialized.eventTime)
    t.ok(V.isDate(ceDeserialized.eventTime))
    t.ok(V.isDateValid(ceDeserialized.eventTime))
    t.ok(V.isDatePast(ceDeserialized.eventTime))
    t.strictSame(ceDeserialized.eventTime.getTime() - T.timezoneOffsetMsec, commonEventTime.getTime())
    t.notStrictEqual(ceDeserialized.eventTime, commonEventTime)
    t.notEqual(ceDeserialized.eventTime, commonEventTime)
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
    t.ok(ceDeserialized.eventTime)
    t.ok(V.isDate(ceDeserialized.eventTime))
    t.ok(V.isDateValid(ceDeserialized.eventTime))
    t.ok(V.isDatePast(ceDeserialized.eventTime))
    t.strictSame(ceDeserialized.eventTime.getTime() - T.timezoneOffsetMsec, commonEventTime.getTime())
    t.notStrictEqual(ceDeserialized.eventTime, commonEventTime)
    t.notEqual(ceDeserialized.eventTime, commonEventTime)
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
test('deserialize a CloudEvent instance with a non default contentType and empty/wrong deserialization options, expect error', (t) => {
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
        decoder: 'decoderSample'
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeSerializedBadJson, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeSerializedBadJson, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
  }

  {
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
        decoder: 'decoderSample'
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(serialized, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeStrictSerializedBadJson, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: false
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
    t.throws(function () {
      const ceFullOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullOtherContentTypeStrictSerializedBadJson, {
        decodedData: `<data "hello"="world" "year"="2018" />`,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeDeserialized === null) // never executed
    }, Error, 'Expected exception when deserializing the current CloudEvent instance')
  }
})

// sample decoding function, to use in tests here
function decoderSample () {
  // return { hello: 'world', year: 2018 }
  return { decoded: 'Sample' }
}

/** @test {CloudEvent} */
test('deserialize a CloudEvent instance with a non default contentType and right deserialization options, expect success', (t) => {
  t.plan(14)

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
    const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
      decodedData: { hello: 'world', year: 2018 }
    })
    t.ok(ceFullOtherContentTypeDeserialized2)
    const fixedDecodedData = { fixed: 'encoded' }
    const ceFullOtherContentTypeDeserialized3 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      // decodedData: undefined
      // decodedData: null
      // decodedData: { hello: 'world', year: 2018 }
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized3)
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
    const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
      decodedData: { hello: 'world', year: 2018 }
    })
    t.ok(ceFullOtherContentTypeDeserialized2)
    const fixedDecodedData = { fixed: 'encoded' }
    const ceFullOtherContentTypeDeserialized3 = CloudEvent.deserializeEvent(serialized, {
      decoder: decoderSample,
      // decodedData: undefined
      // decodedData: null
      // decodedData: { hello: 'world', year: 2018 }
      decodedData: fixedDecodedData
    })
    t.ok(ceFullOtherContentTypeDeserialized3)
  }
})
