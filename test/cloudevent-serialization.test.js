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
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  t.plan(6)

  const CloudEvent = require('../src/') // reference the library
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
})

/** create some common options, for better reuse in tests */
const ceCommonOptions = {
  cloudEventsVersion: '0.0.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: new Date(),
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
// const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { 'hello': 'world', year: 2018 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  t.plan(12)

  const CloudEvent = require('../src/') // reference the library
  // t.ok(CloudEvent)

  // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
  // note that null values are not handled by default values, only undefined values ...
  const ceFull = new CloudEvent('1/full/sample-data/no-strict',
    'com.github.smartiniOnGitHub.cloudeventjs.testevent',
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

  const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
  t.ok(ceFullSerializedStatic)
  const ceFullSerialized = ceFull.serialize()
  t.ok(ceFullSerialized)
  assert(ceFullSerializedStatic === ceFullSerialized)
  t.strictSame(ceFullSerializedStatic, ceFullSerialized)

  /*
  // TODO: enable and update/fix ... wip
  const ceFullSerialized = ceSerialize(ceFull)
  t.ok(ceFullSerialized)
  const ceFullSerializedComparison = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/no-strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value"},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
  t.strictSame(ceFullSerialized, ceFullSerializedComparison)
  const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
  ceFullDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
  t.same(ceFull, ceFullDeserialized)
  const ceFullEnhanced = {...ceFull, ...{otherAttribute: 'sample value'}}
  const ceFullSerializedCustom1 = ceSerialize(ceFullEnhanced, { schema: { additionalProperties: false } }) // override the schema, additional properties disabled (default)
  t.ok(ceFullSerializedCustom1)
  const ceFullSerializedCustomComparison1 = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/no-strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value"},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
  t.strictSame(ceFullSerializedCustom1, ceFullSerializedCustomComparison1)
  const ceFullSerializedCustom2 = ceSerialize(ceFullEnhanced, { schema: { additionalProperties: true } }) // override the schema, additional properties enabled
  t.ok(ceFullSerializedCustom2)
  const ceFullSerializedCustomComparison2 = `{"otherAttribute":"sample value","cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/no-strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value"},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
  t.strictSame(ceFullSerializedCustom2, ceFullSerializedCustomComparison2)
  const ceFullSerializedCustom3 = ceSerialize(ceFullEnhanced, { schema: { properties: { data: { type: 'object', additionalProperties: false, properties: { hello: { type: 'string' }, year: { type: 'number' } } } }, additionalProperties: true } }) // override the schema, with a fixed set of nested attributes for data
  t.ok(ceFullSerializedCustom3)
  const ceFullSerializedCustomComparison3 = `{"eventID":"1/full/sample-data/no-strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","cloudEventsVersion":"0.1.0","contentType":"application/json","eventTime":"${commonEventTime.toISOString()}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value"},"schemaURL":"http://my-schema.localhost.localdomain","source":"/test","otherAttribute":"sample value","data":{"hello":"world","year":2018}}`
  t.strictSame(ceFullSerializedCustom3, ceFullSerializedCustomComparison3)
  // the same with with strict mode enabled ...
  const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
    'com.github.smartiniOnGitHub.cloudeventjs.testevent',
    ceCommonData, // data
    ceCommonOptionsStrict
  )
  assert(ceFullStrict !== null)
  t.ok(ceFullStrict)
  t.ok(ceIsValid(ceFullStrict))
  t.ok(ceIsValid(ceFullStrict, { strict: true }))
  t.strictSame(ceValidate(ceFullStrict), [])
  t.strictSame(ceValidate(ceFullStrict, { strict: true }).length, 0)
  const ceFullStrictSerialized = ceSerialize(ceFullStrict)
  t.ok(ceFullStrictSerialized)
  const ceFullStrictSerializedComparison = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value","strict":true},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
  t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
  const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
  ceFullStrictDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
  t.same(ceFullStrict, ceFullStrictDeserialized)
  const ceFullStrictEnhanced = { ...ceFullStrict, ...{ otherAttribute: 'sample value' } }
  const ceFullStrictSerializedCustom1 = ceSerialize(ceFullStrictEnhanced, { schema: { additionalProperties: false } }) // override the schema, additional properties disabled (default)
  t.ok(ceFullStrictSerializedCustom1)
  const ceFullStrictSerializedCustomComparison1 = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value","strict":true},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
  t.strictSame(ceFullStrictSerializedCustom1, ceFullStrictSerializedCustomComparison1)
  const ceFullStrictSerializedCustom2 = ceSerialize(ceFullStrictEnhanced, { schema: { additionalProperties: true } }) // override the schema, additional properties enabled
  t.ok(ceFullStrictSerializedCustom2)
  const ceFullStrictSerializedCustomComparison2 = `{"otherAttribute":"sample value","cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value","strict":true},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
  t.strictSame(ceFullStrictSerializedCustom2, ceFullStrictSerializedCustomComparison2)
  const ceFullStrictSerializedCustom3 = ceSerialize(ceFullStrictEnhanced, { schema: { properties: { data: { type: 'object', additionalProperties: false, properties: { hello: { type: 'string' }, year: { type: 'number' } } } }, additionalProperties: true } }) // override the schema, with a fixed set of nested attributes for data
  t.ok(ceFullStrictSerializedCustom3)
  const ceFullStrictSerializedCustomComparison3 = `{"eventID":"1/full/sample-data/strict","eventType":"com.github.smartiniOnGitHub.cloudeventjs.testevent","cloudEventsVersion":"0.1.0","contentType":"application/json","eventTime":"${commonEventTime.toISOString()}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value","strict":true},"schemaURL":"http://my-schema.localhost.localdomain","source":"/test","otherAttribute":"sample value","data":{"hello":"world","year":2018}}`
  t.strictSame(ceFullStrictSerializedCustom3, ceFullStrictSerializedCustomComparison3)
   */
})

// TODO: add a test for a CloudEvent with a non default contentType, to ensure it won't be serialized (in the current version) ... wip
