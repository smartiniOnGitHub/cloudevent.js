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
 * Utility:
 * this module exports some utility functions.
 */

/**
 * Get a reference to CloudEvent class definition.
 * See {@link CloudEvent}.
 * @private
 */
const CloudEvent = require('./cloudevent')

/**
 * Get a reference to cloudevent class Validator.
 * See {@link Validator}.
 * @private
 */
const CloudEventValidator = require('./validator')

// get a short reference to the Validator
const V = CloudEventValidator

/**
 * Create and return a CloudEvent from the given object and options.
 *
 * @param {!object} obj the plain object instance to use (its properties will be used)
 * @param {object} [options={}] optional serialization attributes:
 *        - strict (boolean, default null so no override) to validate it in a more strict way (if null it will be used strict mode in the given event),
 *        - onlyValid (boolean, default false) to return it only if it's a valid instance,
 *        - printDebugInfo (boolean, default false) to print some debug info to the console,
 *        - skipExtensions (boolean, default false) to skip all extensions properties,
 * @return {object} the created CloudEvent instance
 * @throws {Error} if object is undefined or null, or an option is undefined/null/wrong, or is not possible to create a CloudEvent instance
 */
function createFromObject (obj = {}, {
  strict = null,
  onlyValid = false,
  printDebugInfo = false,
  skipExtensions = false
} = {}) {
  if (!V.isObjectPlain(obj)) {
    throw new TypeError('The given argument is not an object instance')
  }

  // extensions properties
  let extensions = null
  if (skipExtensions === false) { // get and use extension properties from the given object
    extensions = CloudEvent.getExtensionsOfEvent(obj)
    // note that using that method, extensions always contains at least the strict property,
    // even when not set (so set as false), but do not remove from here
    // to avoid problems when using this factory function
    if (printDebugInfo === true) { // print some debug info
      console.log(`DEBUG - extensions found: ${JSON.stringify(extensions)}`)
    }
  } else {
    if (printDebugInfo === true) {
      console.log('DEBUG - skip extensions')
    }
  }

  // fill a new CludEvent instance with object data
  const ce = new CloudEvent(obj.id,
    obj.type,
    obj.source,
    obj.data,
    { // options
      time: obj.time,
      datainbase64: obj.data_base64,
      datacontenttype: obj.datacontenttype,
      dataschema: obj.dataschema,
      subject: obj.subject,
      strict: obj.strict
    },
    extensions
  )

  if (printDebugInfo === true) {
    console.log(`DEBUG - cloudEvent details: ${JSON.stringify(ce)}`)
    console.log(`DEBUG - ${CloudEvent.dumpValidationResults(ce, { strict }, 'ce')}`)
  }

  // return ce, depending on its validation option
  if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(ce, { strict }) === true)) {
    return ce
  } else throw new Error('Unable to return a not valid CloudEvent.')
}

module.exports = {
  createFromObject
}
