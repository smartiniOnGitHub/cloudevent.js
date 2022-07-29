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
 * Common-Test-Data:
 * Utility module to export some test data.
 */

// strict-related options for ce creation
const ceOptionsNoStrict = { strict: false } // same as default in ce
const ceOptionsStrict = { strict: true }

// strict-related options for ce validation
const valOptionsNoOverride = { strict: null } // same as default in validator
const valOptionsNoStrict = { strict: false }
const valOptionsStrict = { strict: true }

// other general ce validation (and others) related options
const valOnlyValidAllInstance = { onlyValid: false } // all instances, valid and not, default
const valOnlyValidInstance = { onlyValid: true } // only valid instances

/** create some common options, for better reuse in tests */
const commonEventTime = new Date()
const ceCommonOptions = {
  time: commonEventTime,
  datacontenttype: 'application/json',
  dataschema: 'http://my-schema.localhost.localdomain',
  subject: 'subject',
  ...ceOptionsNoStrict // same as default in ce
}
const ceCommonOptionsWithSomeOptionalsNull = {
  time: commonEventTime, // to simplify tests, keep it with a fixed value here
  datacontenttype: null,
  dataschema: null,
  subject: null,
  ...ceOptionsNoStrict
}
const ceCommonOptionsWithAllOptionalsNull = { ...ceCommonOptionsWithSomeOptionalsNull, time: null }
const ceCommonOptionsForTextData = { ...ceCommonOptions, datacontenttype: 'text/plain' }
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = { ...ceCommonOptions, ...ceOptionsStrict }
const ceCommonOptionsWithSomeOptionalsNullStrict = { ...ceCommonOptionsWithSomeOptionalsNull, ...ceOptionsStrict }
const ceCommonOptionsWithAllOptionalsNullStrict = { ...ceCommonOptionsWithAllOptionalsNull, ...ceOptionsStrict }
const ceCommonOptionsForTextDataStrict = { ...ceCommonOptionsForTextData, ...ceOptionsStrict }
/** create some common extensions, for better reuse in tests */
const ceCommonExtensions = { exampleextension: 'value' }
const ceCommonExtensionsWithNullValue = { exampleextension: null }
/** create a common extension only for the strict mode, for better reuse in tests */
const ceExtensionStrict = { strictvalidation: true }
/** create a sample namespace for events here, for better reuse in tests */
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent'
/** create a sample common server URL, for better reuse in tests */
const ceServerUrl = '/test'
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { hello: 'world', year: 2020 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')
/** create some common data from an array, for better reuse in tests */
const ceArrayData = [null, 'value 1', 'value 2', 'value 3'] // set even one item as null

// sample function to calculate a random string (given the length), to use in tests here
function getRandomString (length) {
  let str = Math.random().toString(36).substring(2)
  while (str.length < length) {
    str += Math.random().toString(36).substring(2)
  }
  return str.substring(0, length)
}

module.exports = {
  commonEventTime,
  ceOptionsNoStrict,
  ceOptionsStrict,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonOptionsWithSomeOptionalsNull,
  ceCommonOptionsWithSomeOptionalsNullStrict,
  ceCommonOptionsWithAllOptionalsNull,
  ceCommonOptionsWithAllOptionalsNullStrict,
  ceCommonOptionsForTextData,
  ceCommonOptionsForTextDataStrict,
  ceCommonExtensions,
  ceCommonExtensionsWithNullValue,
  ceExtensionStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceMapData,
  ceArrayData,
  getRandomString,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
}
