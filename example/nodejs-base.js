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

const assert = require('assert')

// get a reference to cloudevent class definition
// const CloudEvent = require('cloudevent.js') // from published module
const CloudEvent = require('../src/') // from local path
assert(CloudEvent !== null)

// create some sample instances but without mandatory fields (for validation) ...
const ceEmpty = new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
assert(ceEmpty !== null)
const ceMinimalMandatoryUndefinedNoStrict = new CloudEvent(undefined, undefined, undefined, { strict: false }) // expected success
assert(ceMinimalMandatoryUndefinedNoStrict !== null)
// const ceMinimalMandatoryUndefinedStrict = new CloudEvent(undefined, undefined, undefined, { strict: true }) // expected failure
// assert(ceMinimalMandatoryUndefinedStrict == null) // no, ReferenceError: ceMinimalMandatoryUndefinedStrict is not defined

// create some sample minimal instances, good even for validation ...
const ceMinimal = new CloudEvent('1', // eventID
  'com.github.smartiniOnGitHub.cloudeventjs.testevent', // eventType
  {} // data (empty) // optional, but useful the same in this sample usage
)
assert(ceMinimal !== null)

// create some instance with all attributes ...
// define some common attributes
const ceCommonOptions = {
  cloudEventsVersion: '0.0.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: new Date(),
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false // same as default
}
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
// create some instances with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
// note that null values are not handled by default values, only undefined values ...
const ceFull = new CloudEvent('1/full',
  'com.github.smartiniOnGitHub.cloudeventjs.testevent',
  { 'hello': 'world' }, // data
  ceCommonOptions
)
assert(ceFull !== null)
assert(!ceFull.isStrict)
const ceFullStrict = new CloudEvent('2/full-strict',
  'com.github.smartiniOnGitHub.cloudeventjs.testevent',
  { 'hello': 'world' }, // data
  ceCommonOptionsStrict // use common options, but set strict mode to true
)
assert(ceFullStrict !== null)
assert(ceFullStrict.isStrict)
assert(!ceFull.isStrict) // ensure common options object has not been changed when reusing some of its values for the second instance
assert(!CloudEvent.isStrictEvent(ceFull)) // the same, but using static method

// validate/check if valid instances (optional)
// then, to validate objects, use class static methods like 'isValidEvent' and 'ValidateEvent', or instance methods like 'isValid', 'validate', etc ...
assert(!ceEmpty.isValid())
assert(!ceMinimalMandatoryUndefinedNoStrict.isValid())
assert(ceMinimal.isValid())
assert(ceFull.isValid())
assert(ceFullStrict.isValid())
// the same, but using static method
assert(!CloudEvent.isValidEvent(ceEmpty))
assert(!CloudEvent.isValidEvent(ceMinimalMandatoryUndefinedNoStrict))
assert(CloudEvent.isValidEvent(ceMinimal))
assert(CloudEvent.isValidEvent(ceFull))
assert(CloudEvent.isValidEvent(ceFullStrict))
assert(CloudEvent.validateEvent(ceEmpty).length > 0)
assert(CloudEvent.validateEvent(ceEmpty, { strict: true }).length > 0)
assert(CloudEvent.validateEvent(ceMinimalMandatoryUndefinedNoStrict).length > 0)
assert(CloudEvent.validateEvent(ceMinimal).length === 0)
assert(CloudEvent.validateEvent(ceFull).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)
// some diagnostic info
console.log(`Validation output for ceEmpty, default strict mode is: size: ${CloudEvent.validateEvent(ceEmpty).length}, details:\n` + CloudEvent.validateEvent(ceEmpty))
console.log(`Validation output for ceEmpty, force strict mode to true is size: ${CloudEvent.validateEvent(ceEmpty, { strict: true }).length}, details:\n` + CloudEvent.validateEvent(ceEmpty, { strict: true }))

// serialization examples
const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
assert(ceFullSerializedStatic !== null)
const ceFullSerialized = ceFull.serialize()
assert(ceFullSerialized !== null)
assert(ceFullSerializedStatic === ceFullSerialized)
// some diagnostic info
console.log(`Serialization output for ceFull, details:\n` + ceFullSerialized)

// then use (send/store/etc) serialized instances ...

// end of script
