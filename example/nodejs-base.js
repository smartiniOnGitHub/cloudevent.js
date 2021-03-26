/*
 * Copyright 2018-2021 the original author or authors.
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

// create some sample instances but without mandatory fields (so not good for validation) ...
// note that errors will be thrown at instance creation only when strict mode is true
console.log('\nCreation of some CloudEvent (ce) instances, and related diagnostics:')
const ceEmpty = new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
assert(ceEmpty !== null)
console.log(`ce dump (but not good for validation): ${T.dumpObject(ceEmpty, 'ceEmpty')}`)
const ceMinimalMandatoryUndefinedNoStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: false }) // expected success
assert(ceMinimalMandatoryUndefinedNoStrict !== null)
console.log(`ce dump (but not good for validation): ${T.dumpObject(ceMinimalMandatoryUndefinedNoStrict, 'ceMinimalMandatoryUndefinedNoStrict')}`)
// const ceMinimalMandatoryUndefinedStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true }) // expected failure
// assert(ceMinimalMandatoryUndefinedStrict == null) // no, ReferenceError: ceMinimalMandatoryUndefinedStrict is not defined

// define some common attributes
const ceCommonOptions = {
  time: new Date(), // same as default
  datacontenttype: 'application/json',
  dataschema: 'http://my-schema.localhost.localdomain/v1/',
  subject: 'subject',
  strict: false // same as default
}
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
const ceCommonOptionsForTextData = { ...ceCommonOptions, datacontenttype: 'text/plain' }
const ceCommonExtensions = { exampleextension: 'value' }
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0'
const ceServerUrl = '/test'
const ceCommonData = { hello: 'world', year: 2020, enabled: true }
const ceDataAsJSONString = '{ "hello": "world", "year": 2020, "enabled": true }'
const ceDataAsString = 'Hello World, 2020'
const ceDataEncoded = 'SGVsbG8gV29ybGQsIDIwMjA='

// create a sample minimal instance good for normal validation but not for strict validation ...
const ceMinimalBadSource = new CloudEvent('1', ceNamespace, 'source (bad)', null)
assert(ceMinimalBadSource !== null)
console.log(`ce dump (good but not for strict validation): ${T.dumpObject(ceMinimalBadSource, 'ceMinimalBadSource')}`)

// create a sample minimal instance ...
const ceMinimal = new CloudEvent('1', // id
  ceNamespace, // type
  '/', // source
  {} // data (empty) // optional, but useful the same in this sample usage
)
assert(ceMinimal !== null)
console.log(`ce dump: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

// When creating some instances with an undefined mandatory argument (handled by defaults),
// but with strict flag disabled success is expected, otherwise with strict flag enabled a failure is expected ...
// In JavaScript, null values are not handled as default values, only undefined values ...

// create a sample instance with most common attributes defined ...
const ceFull = new CloudEvent('1/full',
  ceNamespace,
  ceServerUrl,
  ceCommonData, // data
  ceCommonOptions,
  ceCommonExtensions
)
assert(ceFull !== null)
assert(!ceFull.isStrict)
console.log(`ce dump: ${T.dumpObject(ceFull, 'ceFull')}`)
const ceFullStrict = new CloudEvent('1/full-strict',
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
console.log(`ce dump: ${T.dumpObject(ceFullStrict, 'ceFullStrict')}`)
// create an instance with a JSON string as data
const ceFullStrictJSONTextData = new CloudEvent('2/full-strict-json-string-data',
  ceNamespace,
  ceServerUrl,
  ceDataAsJSONString, // data
  ceCommonOptionsStrict, // use strict options
  ceCommonExtensions
)
assert(ceFullStrictJSONTextData !== null)
assert(ceFullStrictJSONTextData.isStrict)
console.log(`ce dump: ${T.dumpObject(ceFullStrictJSONTextData, 'ceFullStrictJSONTextData')}`)
console.log(`ce validation results on ceFullStrictJSONTextData = ${CloudEvent.validateEvent(ceFullStrictJSONTextData)}`)
// create an instance that wrap an Error
const error = new Error('sample error')
error.code = 1000 // add a sample error code, as number
const errorToData = T.errorToData(error, {
  includeStackTrace: true,
  // addStatus: false,
  addTimestamp: true
})
const ceErrorStrict = new CloudEvent('3/error-strict',
  ceNamespace,
  ceServerUrl,
  errorToData, // data
  ceCommonOptionsStrict, // use common options, but set strict mode to true
  ceCommonExtensions
)
assert(ceErrorStrict !== null)
assert(ceErrorStrict.isStrict)
console.log(`ce dump: ${T.dumpObject(ceErrorStrict, 'ceErrorStrict')}`)
// create an instance with a different content type
const ceFullStrictOtherContentType = new CloudEvent('4/full-strict-other-content-type',
  ceNamespace,
  ceServerUrl,
  // ceDataAsString, // data
  ceCommonData, // data
  { ...ceCommonOptionsStrict, datacontenttype: 'application/xml' }, // use common strict options
  ceCommonExtensions
)
assert(ceFullStrictOtherContentType !== null)
assert(ceFullStrictOtherContentType.isStrict)
assert(!ceFull.ceFullStrictOtherContentType) // ensure common options object has not been changed when reusing some of its values for the second instance
assert(!CloudEvent.isStrictEvent(ceFull)) // the same, but using static method
console.log(`ce dump: ${T.dumpObject(ceFullStrictOtherContentType, 'ceFullStrictOtherContentType')}`)
// create an instance with data as a string, but not strict (to validate it even in strict mode)
const ceFullTextData = new CloudEvent('5/no-strict-text-data',
  ceNamespace,
  ceServerUrl,
  ceDataAsString, // data
  // ceCommonOptions, // ok but not in strict validation
  ceCommonOptionsForTextData, // ok even in strict validation
  ceCommonExtensions
)
assert(ceFullTextData !== null)
assert(!ceFullTextData.isStrict)
assert(ceFullTextData.payload === ceDataAsString) // returned data is transformed
console.log(`ce payload: '${ceFullTextData.payload}', length: ${ceFullTextData.payload.length}`)
console.log(`ce dump: ${T.dumpObject(ceFullTextData, 'ceFullTextData')}`)
console.log(`ce validation results on ceFullTextData (no strict validation) = ${CloudEvent.validateEvent(ceFullTextData)}`)
console.log(`ce validation results on ceFullTextData (with strict validation) = ${CloudEvent.validateEvent(ceFullTextData, { strict: true })}`)
// create an instance with data encoded in base64
const ceFullStrictBinaryData = new CloudEvent('6/full-strict-binary-data',
  ceNamespace,
  ceServerUrl,
  null, // data
  { ...ceCommonOptionsStrict, datainbase64: ceDataEncoded }, // use common strict options, and set binary data in base64
  ceCommonExtensions
)
assert(ceFullStrictBinaryData !== null)
assert(ceFullStrictBinaryData.isStrict)
assert(ceFullStrictBinaryData.payload === ceDataAsString) // returned data is transformed
console.log(`ce payload: '${ceFullStrictBinaryData.payload}', length: ${ceFullStrictBinaryData.payload.length}`)
console.log(`ce dump: ${T.dumpObject(ceFullStrictBinaryData, 'ceFullStrictBinaryData')}`)

// validate/check if valid instances (optional)
// then, to validate objects, use class static methods like 'isValidEvent' and 'ValidateEvent', or instance methods like 'isValid', 'validate', etc ...
assert(!ceEmpty.isValid())
assert(!ceMinimalMandatoryUndefinedNoStrict.isValid())
// console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ceMinimalBadSource, null, 'ceMinimalBadSource')}`)
assert(ceMinimalBadSource.isValid())
// console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ceMinimalBadSource, { strict: true }, 'ceMinimalBadSource')}`)
assert(!ceMinimalBadSource.isValid({ strict: true }))
assert(ceMinimal.isValid())
assert(ceMinimal.isValid({ strict: true }))
assert(ceFull.isValid())
assert(ceFullStrict.isValid())
assert(ceFullStrictJSONTextData.isValid())
assert(ceErrorStrict.isValid())
assert(ceFullStrictOtherContentType.isValid())
assert(ceFullTextData.isValid())
assert(ceFullTextData.isValid({ strict: true }))
assert(ceFullStrictBinaryData.isValid())
// the same, but using static method
assert(!CloudEvent.isValidEvent(ceEmpty))
assert(!CloudEvent.isValidEvent(ceMinimalMandatoryUndefinedNoStrict))
assert(CloudEvent.isValidEvent(ceMinimal))
assert(CloudEvent.isValidEvent(ceFull))
assert(CloudEvent.isValidEvent(ceFullStrict))
assert(CloudEvent.isValidEvent(ceFullStrictJSONTextData))
assert(CloudEvent.isValidEvent(ceErrorStrict))
assert(CloudEvent.isValidEvent(ceFullStrictOtherContentType))
assert(CloudEvent.isValidEvent(ceFullTextData))
assert(CloudEvent.isValidEvent(ceFullTextData, { strict: true }))
assert(CloudEvent.isValidEvent(ceFullStrictBinaryData))
// console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ceEmpty, null, 'ceEmpty')}`)
assert(CloudEvent.validateEvent(ceEmpty).length === 3)
// console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ceEmpty, { strict: true }, 'ceEmpty')}`)
assert(CloudEvent.validateEvent(ceEmpty, { strict: true }).length === 4)
assert(CloudEvent.validateEvent(ceMinimalMandatoryUndefinedNoStrict).length > 0)
assert(CloudEvent.validateEvent(ceMinimal).length === 0)
assert(CloudEvent.validateEvent(ceFull).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictJSONTextData).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictJSONTextData, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictJSONTextData, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictOtherContentType).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictOtherContentType, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictOtherContentType, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullTextData).length === 0)
assert(CloudEvent.validateEvent(ceFullTextData, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullTextData, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictBinaryData).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictBinaryData, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrictBinaryData, { strict: true }).length === 0)
// some diagnostic info
console.log('\nSome expected validation errors:')
console.log(`Validation output for ceEmpty (default strict mode) is: size: ${CloudEvent.validateEvent(ceEmpty).length}, details:\n` + CloudEvent.validateEvent(ceEmpty))
console.log(`Validation output for ceEmpty (force strict mode to true) is: size: ${CloudEvent.validateEvent(ceEmpty, { strict: true }).length}, details:\n` + CloudEvent.validateEvent(ceEmpty, { strict: true }))
console.log(`Validation output for ceEmpty, alternative way: ${CloudEvent.dumpValidationResults(ceEmpty, { strict: true }, 'ceEmpty')}`)

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
const ceFullTextDataSerialized = CloudEvent.serializeEvent(ceFullTextData, { onlyValid: true })
assert(ceFullTextDataSerialized !== null)
console.log('Serialization output for ceFullTextData, details:\n' + ceFullTextDataSerialized)
const ceFullStrictBinaryDataSerialized = CloudEvent.serializeEvent(ceFullStrictBinaryData, { onlyValid: true })
assert(ceFullStrictBinaryDataSerialized !== null)
console.log('Serialization output for ceFullStrictBinaryData, details:\n' + ceFullStrictBinaryDataSerialized)

// then use (send/store/etc) serialized instances ...

// deserialization examples
// default contenttype
console.log('\nSome deserialization/parse examples:')
const ceFullDeserialized = CloudEvent.deserializeEvent(ceFullSerialized)
assert(ceFullDeserialized !== null)
assert(ceFullDeserialized.isValid())
assert(!ceFullDeserialized.isStrict)
assert(CloudEvent.isCloudEvent(ceFullDeserialized))
console.log(`ce dump: ${T.dumpObject(ceFullDeserialized, 'ceFullDeserialized')}`)
const ceFullStrictDeserializedOnlyValid = CloudEvent.deserializeEvent(ceFullStrictSerialized, { onlyValid: true })
assert(ceFullStrictDeserializedOnlyValid !== null)
console.log(`ce dump: ${T.dumpObject(ceFullStrictDeserializedOnlyValid, 'ceFullStrictDeserializedOnlyValid')}`)
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
console.log(`ce dump: ${T.dumpObject(ceFullStrictOtherContentTypeDeserialized, 'ceFullStrictOtherContentTypeDeserialized')}`)
const ceFullTextDataDeserialized = CloudEvent.deserializeEvent(ceFullTextDataSerialized, { onlyValid: true })
assert(ceFullTextDataDeserialized !== null)
assert(ceFullTextDataDeserialized.isValid())
assert(!ceFullTextDataDeserialized.isStrict)
assert(CloudEvent.isCloudEvent(ceFullTextDataDeserialized))
console.log(`ce dump: ${T.dumpObject(ceFullTextDataDeserialized, 'ceFullTextDataDeserialized')}`)
const ceFullStrictBinaryDataDeserialized = CloudEvent.deserializeEvent(ceFullStrictBinaryDataSerialized, { onlyValid: true })
assert(ceFullStrictBinaryDataDeserialized !== null)
assert(ceFullStrictBinaryDataDeserialized.isValid())
assert(ceFullStrictBinaryDataDeserialized.isStrict)
assert(CloudEvent.isCloudEvent(ceFullStrictBinaryDataDeserialized))
console.log(`ce dump: ${T.dumpObject(ceFullStrictBinaryDataDeserialized, 'ceFullStrictBinaryDataDeserialized')}`)

// then use (validate/send/store/etc) deserialized instances ...

// example usage of some CloudEvent instances as a JSONBatch
// note that I put even wrong data types inside the array to show some features
console.log('\nJSONBatch examples:')
const batch = [
  undefined,
  null,
  'string', // bad
  1234567890, // bad
  3.14159, // bad
  false, // bad
  true, // bad
  ceMinimalBadSource, // good but not for strict validation
  ceMinimal,
  ceFull,
  new Date(), // bad
  {}, // bad
  [], // bad
  ceFullStrict,
  ceErrorStrict,
  ceFullStrictOtherContentType, // good, but to serialize/deserialize related options must be used
  ceFullTextData,
  ceFullStrictBinaryData,
  null,
  undefined
]
assert(JSONBatch.isJSONBatch(batch))
assert(!JSONBatch.isValidBatch(batch)) // it has some validation error (on its content)
console.log(`JSONBatch contains ${batch.length} items, but only some are valid CloudEvent instances, see related sample code:`)
console.log(`CloudEvent instances valid: ${JSONBatch.getEvents(batch, { onlyValid: true, strict: false }).length}`)
console.log(`CloudEvent instances valid in strict mode: ${JSONBatch.getEvents(batch, { onlyValid: true, strict: true }).length}`)
// sample validation, in normal and in strict mode
console.log(`JSONBatch validation errors, num: ${JSONBatch.validateBatch(batch, { strict: false }).length}`)
console.log(`JSONBatch validation errors in strict mode, num: ${JSONBatch.validateBatch(batch, { strict: true }).length}`)
console.log(`JSONBatch validation errors in strict mode, details:\n${JSONBatch.validateBatch(batch, { strict: true })}\n`)
assert(JSONBatch.validateBatch(batch, { strict: false }).length === 8) // expected validation errors
assert(JSONBatch.validateBatch(batch, { strict: true }).length === 13) // expected validation errors
// sample filtering of events
// console.log(`DEBUG - JSONBatch.getEvents, num: ${JSONBatch.getEvents(batch, { onlyValid: true, strict: true }).length}`)
assert(JSONBatch.getEvents(batch, { onlyValid: false, strict: false }).length === 8) // no filtering
assert(JSONBatch.getEvents(batch, { onlyValid: false, strict: true }).length === 8) // no filtering (neither in strict mode)
assert(JSONBatch.getEvents(batch, { onlyValid: true, strict: false }).length === 8) // only valid
assert(JSONBatch.getEvents(batch, { onlyValid: true, strict: true }).length === 7) // only valid in strict mode
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
console.log(`JSONBatch events serialized = \n${ser}\n`)
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
