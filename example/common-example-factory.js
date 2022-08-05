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

/**
 * Common-Example-Factory:
 * Utility module to provide some factory functions to create instances to use in examples.
 */

const assert = require('node:assert').strict

// get a reference only to cloudevent class definition/s
const {
  CloudEvent,
  CloudEventValidator: V,
  CloudEventTransformer: T,
  JSONBatch
} = require('../src') // from local path
assert(CloudEvent !== null && V !== null && T !== null && JSONBatch !== null)

// import some common example data
const {
  // commonEventTime,
  ceCommonData,
  ceCommonExtensions,
  ceCommonOptions,
  ceCommonOptionsForTextData,
  ceCommonOptionsStrict,
  ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded,
  ceDataNested,
  ceNamespace,
  ceOptionsNoStrict,
  ceOptionsStrict,
  ceReservedExtensions,
  ceServerUrl,
  getRandomString
} = require('./common-example-data')

// define factory functions
function createEmpty () {
  return new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
}

function createMinimalMandatoryUndefinedNoStrict () {
  return new CloudEvent(undefined, undefined, undefined, undefined, ceOptionsNoStrict) // expected success
}

function createMinimalBadSource () {
  return new CloudEvent('1/minimal-bad-source', ceNamespace, 'source (bad in strict mode)', null)
}

function createMinimal () {
  return new CloudEvent('1/minimal', // id
    ceNamespace, // type
    '/', // source
    {} // data (empty object) // optional, but useful the same in this sample usage
  )
}

function createMinimalStrict () {
  return new CloudEvent('1/minimal-strict', // id
    ceNamespace, // type
    '/', // source
    null, // data // optional, but useful the same in this sample usage
    ceOptionsStrict
  )
}

function createFull () {
  return new CloudEvent('2/full',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptions,
    ceCommonExtensions
  )
}

function createFullStrict () {
  return new CloudEvent('2/full-strict',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptionsStrict,
    ceCommonExtensions
  )
}

function createFullStrictBadExtension () {
  let ce
  try {
    ce = new CloudEvent('2/full-strict/bad-use-reserved-extension',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceCommonOptionsStrict,
      ceReservedExtensions
    )
  } catch (e) {
    ce = null
  }
  return ce
}

function createFullNestedDataStrict () {
  return new CloudEvent('3/full-strict-nested-data',
    ceNamespace,
    ceServerUrl,
    ceDataNested,
    ceCommonOptionsStrict,
    ceCommonExtensions
  )
}

function createFullTextDataBadContentType () {
  return new CloudEvent('5/no-strict-text-data-bad-content-type',
    ceNamespace,
    ceServerUrl,
    ceDataAsString, // data
    ceCommonOptions, // ok but not in strict validation
    ceCommonExtensions
  )
}

function createFullTextData () {
  return new CloudEvent('5/no-strict-text-data',
    ceNamespace,
    ceServerUrl,
    ceDataAsString, // data
    ceCommonOptionsForTextData, // ok even in strict validation
    ceCommonExtensions
  )
}

function createFullBinaryData () {
  return new CloudEvent('6/full-strict-binary-data',
    ceNamespace,
    ceServerUrl,
    null, // data
    { ...ceCommonOptionsStrict, datainbase64: ceDataAsStringEncoded }, // use common strict options, and set binary data in base64
    ceCommonExtensions
  )
}

function createFullStrictJSONTextData () {
  return new CloudEvent('7/full-strict-json-string-data',
    ceNamespace,
    ceServerUrl,
    ceDataAsJSONString, // data
    ceCommonOptionsStrict, // use strict options
    ceCommonExtensions
  )
}

// create a sample string big (more than 64 KB)
const bigStringLength = 100_000
const bigString = getRandomString(bigStringLength) // a random string with n chars

function createFullBigStringData () {
  return new CloudEvent('11/full-no-strict-text-big-string-data',
    ceNamespace,
    ceServerUrl,
    { random: bigString }, // data
    ceCommonOptions,
    ceCommonExtensions
  )
}

module.exports = {
  createEmpty,
  createFull,
  createFullBigStringData,
  createFullBinaryData,
  createFullNestedDataStrict,
  createFullStrict,
  createFullStrictBadExtension,
  createFullStrictJSONTextData,
  createFullTextData,
  createFullTextDataBadContentType,
  createMinimal,
  createMinimalBadSource,
  createMinimalMandatoryUndefinedNoStrict,
  createMinimalStrict
}
