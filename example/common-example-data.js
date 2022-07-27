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
 * Common-Example-Data:
 * Utility module to export some useful data to use in examples.
 */

// define some common attributes
const commonEventTime = new Date()
const ceCommonOptions = {
  // time: new Date(), // same as default
  // time: commonEventTime, // to simplify tests, keep it with a fixed value here
  time: null, // more useful here, like in normal situations where event timestamp has to be created each time
  datacontenttype: 'application/json',
  dataschema: 'http://my-schema.localhost.localdomain/v1/',
  subject: 'subject',
  strict: false // same as default
}
const ceOptionsNoStrict = { strict: false } // same as default
const ceOptionsStrict = { strict: true }
const ceCommonOptionsStrict = { ...ceCommonOptions, ...ceOptionsStrict }
const ceCommonOptionsForTextData = { ...ceCommonOptions, datacontenttype: 'text/plain' }
const ceCommonExtensions = { exampleextension: 'value' } // example extension
const ceReservedExtensions = { id: -1, data: 'data attribute in extension' } // example (bad) extension, use a standard property in extensions, not good for creation in strict mode
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0'
const ceServerUrl = '/test'
const ceCommonData = { hello: 'world', year: 2020, enabled: true }
const ceDataAsJSONString = '{ "hello": "world", "year": 2020, "enabled": true }'
const ceDataAsString = 'Hello World, 2020'
const ceDataAsStringEncoded = 'SGVsbG8gV29ybGQsIDIwMjA='

// ----

const ceCommonOptionsWithSomeOptionalsNull = {
  time: commonEventTime, // to simplify tests, keep it with a fixed value here
  datacontenttype: null,
  dataschema: null,
  subject: null,
  strict: false
}
const ceCommonOptionsWithAllOptionalsNull = { ...ceCommonOptionsWithSomeOptionalsNull, time: null }
const ceCommonOptionsWithSomeOptionalsNullStrict = { ...ceCommonOptionsWithSomeOptionalsNull, strict: true }
const ceCommonOptionsWithAllOptionalsNullStrict = { ...ceCommonOptionsWithAllOptionalsNull, strict: true }
const ceCommonOptionsForTextDataStrict = { ...ceCommonOptionsForTextData, strict: true }

const ceCommonExtensionsWithNullValue = { exampleextension: null }

const ceExtensionStrict = { strictvalidation: true }

const ceMapData = new Map() // empty Map
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

const ceArrayData = [null, 'value 1', 'value 2', 'value 3'] // set even one item as null

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
  ceReservedExtensions,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded,
  ceMapData,
  ceArrayData
}