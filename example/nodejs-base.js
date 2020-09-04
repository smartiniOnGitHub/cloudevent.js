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

/**
 * Sample Node.js script to show usage of CloudEvent library
 */

const assert = require('assert').strict

console.log('Sample script: start execution ...\n')

// reference the library, not needed if using destructuring assignment, see below
const CloudEventExports = require('../src/') // from local path
assert(CloudEventExports !== null)

// get a reference only to cloudevent class definition/s
// const { CloudEvent } = require('cloudevent') // from published module
// const { CloudEvent } = require('../src/') // from local path
const {
  CloudEvent,
  CloudEventValidator: V,
  CloudEventTransformer: T,
  JSONBatch
} = require('../src/') // from local path
assert(CloudEvent !== null && V !== null && T !== null && JSONBatch !== null)

// create some sample instances but without mandatory fields (for validation) ...
console.log('\nCreation of some CloudEvent instances, and related diagnostics:')
const ceEmpty = new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
assert(ceEmpty !== null)
console.log(`cloudEvent dump: ${T.dumpObject(ceEmpty, 'ceEmpty')}`)
const ceMinimalMandatoryUndefinedNoStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: false }) // expected success
assert(ceMinimalMandatoryUndefinedNoStrict !== null)
console.log(`cloudEvent dump: ${T.dumpObject(ceMinimalMandatoryUndefinedNoStrict, 'ceMinimalMandatoryUndefinedNoStrict')}`)
// const ceMinimalMandatoryUndefinedStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true }) // expected failure
// assert(ceMinimalMandatoryUndefinedStrict == null) // no, ReferenceError: ceMinimalMandatoryUndefinedStrict is not defined

// define some common attributes
const ceCommonOptions = {
  time: new Date(),
  datacontenttype: 'application/json',
  dataschema: 'http://my-schema.localhost.localdomain/v1/',
  subject: 'subject',
  strict: false // same as default
}
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
const ceCommonExtensions = { exampleExtension: 'value' }
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0'
const ceServerUrl = '/test'
const ceCommonData = { hello: 'world', year: 2020 }
// const ceDataAsString = 'Hello World, 2020'

// create some sample minimal instances, good even for validation ...
const ceMinimal = new CloudEvent('1', // id
  ceNamespace, // type
  '/', // source
  {} // data (empty) // optional, but useful the same in this sample usage
)
assert(ceMinimal !== null)
console.log(`cloudEvent dump: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

// create some instances with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
// note that null values are not handled by default values, only undefined values ...
const ceFull = new CloudEvent('1/full',
  ceNamespace,
  ceServerUrl,
  ceCommonData, // data
  ceCommonOptions,
  ceCommonExtensions
)
assert(ceFull !== null)
assert(!ceFull.isStrict)
console.log(`cloudEvent dump: ${T.dumpObject(ceFull, 'ceFull')}`)
const ceFullStrict = new CloudEvent('2/full-strict',
  ceNamespace,
  ceServerUrl,
  ceCommonData, // data
  ceCommonOptionsStrict, // use common options, but set strict mode to true
  ceCommonExtensions
)
assert(ceFullStrict !== null)
assert(ceFullStrict.isStrict)
assert(!ceFull.isStrict) // ensure common options object has not been changed when reusing some of its values for the second instance
assert(!CloudEvent.isStrictEvent(ceFull)) // the same, but using static method
console.log(`cloudEvent dump: ${T.dumpObject(ceFullStrict, 'ceFullStrict')}`)
// create an instance that wrap an Error
const error = new Error('sample error')
error.code = 1000 // add a sample error code, as number
const errorToData = T.errorToData(error, {
  includeStackTrace: true,
  // addStatus: false,
  addTimestamp: true
})
const ceErrorStrict = new CloudEvent('2/error-strict',
  ceNamespace,
  ceServerUrl,
  errorToData, // data
  ceCommonOptionsStrict, // use common options, but set strict mode to true
  ceCommonExtensions
)
assert(ceErrorStrict !== null)
assert(ceErrorStrict.isStrict)
console.log(`cloudEvent dump: ${T.dumpObject(ceErrorStrict, 'ceErrorStrict')}`)
// create an instance with a different content type
const ceFullStrictOtherContentType = new CloudEvent('3/full-strict-other-content-type',
  ceNamespace,
  ceServerUrl,
  // ceDataAsString, // data
  ceCommonData, // data
  { ...ceCommonOptionsStrict, datacontenttype: 'application/xml' }, // use common strict options, but set strict mode to true
  ceCommonExtensions
)
assert(ceFullStrictOtherContentType !== null)
assert(ceFullStrictOtherContentType.isStrict)
assert(!ceFull.ceFullStrictOtherContentType) // ensure common options object has not been changed when reusing some of its values for the second instance
assert(!CloudEvent.isStrictEvent(ceFull)) // the same, but using static method
console.log(`cloudEvent dump: ${T.dumpObject(ceFullStrictOtherContentType, 'ceFullStrictOtherContentType')}`)

// validate/check if valid instances (optional)
// then, to validate objects, use class static methods like 'isValidEvent' and 'ValidateEvent', or instance methods like 'isValid', 'validate', etc ...
assert(!ceEmpty.isValid())
assert(!ceMinimalMandatoryUndefinedNoStrict.isValid())
assert(ceMinimal.isValid())
assert(ceFull.isValid())
assert(ceFullStrict.isValid())
assert(ceErrorStrict.isValid())
assert(ceFullStrictOtherContentType.isValid())
// the same, but using static method
assert(!CloudEvent.isValidEvent(ceEmpty))
assert(!CloudEvent.isValidEvent(ceMinimalMandatoryUndefinedNoStrict))
assert(CloudEvent.isValidEvent(ceMinimal))
assert(CloudEvent.isValidEvent(ceFull))
assert(CloudEvent.isValidEvent(ceFullStrict))
assert(CloudEvent.isValidEvent(ceErrorStrict))
assert(CloudEvent.isValidEvent(ceFullStrictOtherContentType))
assert(CloudEvent.validateEvent(ceEmpty).length === 3)
assert(CloudEvent.validateEvent(ceEmpty, { strict: true }).length === 5)
assert(CloudEvent.validateEvent(ceMinimalMandatoryUndefinedNoStrict).length > 0)
assert(CloudEvent.validateEvent(ceMinimal).length === 0)
assert(CloudEvent.validateEvent(ceFull).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictOtherContentType).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictOtherContentType, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictOtherContentType, { strict: true }).length === 0)
// some diagnostic info
console.log('\nSome expected validation errors:')
console.log(`Validation output for ceEmpty (default strict mode) is: size: ${CloudEvent.validateEvent(ceEmpty).length}, details:\n` + CloudEvent.validateEvent(ceEmpty))
console.log(`Validation output for ceEmpty (force strict mode to true) is: size: ${CloudEvent.validateEvent(ceEmpty, { strict: true }).length}, details:\n` + CloudEvent.validateEvent(ceEmpty, { strict: true }))

// serialization examples
// default contenttype
console.log('\nSome serialization examples:')
const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
assert(ceFullSerializedStatic !== null)
const ceFullSerialized = ceFull.serialize()
assert(ceFullSerialized !== null)
assert(ceFullSerializedStatic === ceFullSerialized)
console.log('Serialization output for ceFull, details:\n' + ceFullSerialized)
const ceFullStrictSerialized = ceFullStrict.serialize()
assert(ceFullStrictSerialized !== null)
console.log('Serialization output for ceFullStrict, details:\n' + ceFullStrictSerialized)
const ceFullStrictSerializedOnlyValid = CloudEvent.serializeEvent(ceFullStrict, { onlyValid: true })
assert(ceFullStrictSerializedOnlyValid !== null)
// non default contenttype
const ceFullStrictOtherContentTypeSerializedStatic = CloudEvent.serializeEvent(ceFullStrictOtherContentType, {
  // encoder: (data) => '<data "encoder"="sample" />',
  encodedData: '<data "hello"="world" "year"="2020" />',
  onlyValid: true
})
assert(ceFullStrictOtherContentTypeSerializedStatic !== null)
const ceFullStrictOtherContentTypeSerialized = ceFullStrictOtherContentType.serialize({
  // encoder: (data) => '<data "encoder"="sample" />',
  encodedData: '<data "hello"="world" "year"="2020" />',
  onlyValid: true
})
assert(ceFullStrictOtherContentTypeSerialized !== null)
assert(ceFullStrictOtherContentTypeSerializedStatic === ceFullStrictOtherContentTypeSerialized)
console.log('Serialization output for ceFullStrictOtherContentType, details:\n' + ceFullStrictOtherContentTypeSerialized)

// then use (send/store/etc) serialized instances ...

// deserialization examples
// default contenttype
console.log('\nSome deserialization/parse examples:')
const ceFullDeserialized = CloudEvent.deserializeEvent(ceFullSerialized)
assert(ceFullDeserialized !== null)
assert(ceFullDeserialized.isValid())
assert(!ceFullDeserialized.isStrict)
assert(CloudEvent.isCloudEvent(ceFullDeserialized))
console.log(`cloudEvent dump: ${T.dumpObject(ceFullDeserialized, 'ceFullDeserialized')}`)
const ceFullStrictDeserializedOnlyValid = CloudEvent.deserializeEvent(ceFullStrictSerialized, { onlyValid: true })
assert(ceFullStrictDeserializedOnlyValid !== null)
console.log(`cloudEvent dump: ${T.dumpObject(ceFullStrictDeserializedOnlyValid, 'ceFullStrictDeserializedOnlyValid')}`)
// non default contenttype
const ceFullStrictOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullStrictOtherContentTypeSerialized, {
  // decoder: (data) => { decoder: 'Sample' },
  decodedData: { hello: 'world', year: 2020 },
  onlyValid: true
})
assert(ceFullStrictOtherContentTypeDeserialized !== null)
assert(ceFullStrictOtherContentTypeDeserialized.isValid())
assert(ceFullStrictOtherContentTypeDeserialized.isStrict)
assert(CloudEvent.isCloudEvent(ceFullStrictOtherContentTypeDeserialized))
console.log(`cloudEvent dump: ${T.dumpObject(ceFullStrictOtherContentTypeDeserialized, 'ceFullStrictOtherContentTypeDeserialized')}`)

// then use (validate/send/store/etc) deserialized instances ...

// example usage of some CloudEvent instances as a JSONBatch
// note that I put even wrong data types inside the array to show some features
console.log('\nJSONBatch examples:')
const batch = [
  undefined,
  null,
  'string', // bad
  1234567890, // bad
  false, // bad
  true, // bad
  ceMinimal,
  ceFull,
  new Date(), // bad
  {}, // bad
  [], // bad
  ceFullStrict,
  ceErrorStrict,
  ceFullStrictOtherContentType,
  null,
  undefined
]
assert(JSONBatch.isJSONBatch(batch))
assert(!JSONBatch.isValidBatch(batch)) // it has some validation error (on its content)
console.log(`JSONBatch contains ${batch.length} items, but only some are valid CloudEvent instances, see related sample code:`)
console.log(`${JSONBatch.getEvents(batch, { onlyValid: false, strict: false }).length} CloudEvent instances`)
console.log(`${JSONBatch.getEvents(batch, { onlyValid: true, strict: true }).length} CloudEvent instances valid in strict mode`)
// sample validation, in normal and in strict mode
assert(JSONBatch.validateBatch(batch, { strict: false }).length === 7)
assert(JSONBatch.validateBatch(batch, { strict: true }).length === 8)
// sample filtering of events
assert(JSONBatch.getEvents(batch, { onlyValid: false, strict: false }).length === 5) // no filtering
assert(JSONBatch.getEvents(batch, { onlyValid: true, strict: false }).length === 5) // only valid
assert(JSONBatch.getEvents(batch, { onlyValid: true, strict: true }).length === 4) // only valid in strict mode
console.log('JSONBatch events: get only valid instances, as a sample')
const events = JSONBatch.getEvents(batch, {
  onlyValid: true,
  strict: false
})
console.log(`JSONBatch events: length = ${events.length}, summary: ${events}`)
console.log(`JSONBatch events: length = ${events.length}, details: ${JSON.stringify(events)}`)
assert(events !== null)
// sample serialization/deserialization on it (batch) or a subset (events)
// note that additional serialization options could be used, for example to handle non default data content types ...
const ser = JSONBatch.serializeEvents(events, { prettyPrint: true, logError: true })
console.log(`JSONBatch events: serialized = \n${ser}\n`)
const deser = JSONBatch.deserializeEvents(ser, {
  logError: true,
  throwError: true,
  onlyValid: true // sample, to filter out not valid serialized instances ...
  // onlyIfLessThan64KB: true
})
console.log(`JSONBatch events: deserialized length = ${deser.length}, summary: ${deser}`)
console.log(`JSONBatch events: deserialized JSONBatch length = ${deser.length}, details: ${JSON.stringify(deser)}`)
assert(deser !== null)

// other ...

console.log('\nSample script: end execution.')
assert(true) // all good here
// end of script
