/*
 * Copyright 2018-2023 the original author or authors.
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
 * JSONBatch:
 * this module exports some useful definition and utility related to
 * the JSONBatch definition for CloudEvents.
 */

/**
 * Get a reference to cloudevent CloudEvent class.
 * @see Validator
 * @private
 */
const CloudEvent = require('./cloudevent') // get cloudevent from here

/**
 * Get a reference to cloudevent Validator class.
 * @see Validator
 * @private
 */
const V = require('./validator') // get validator from here

/**
 * JSONBatch implementation.
 *
 * @see https://github.com/cloudevents/spec/blob/master/json-format.md#4-json-batch-format
 */
class JSONBatch {
  /**
   * Create a new instance of a JSONBatch object.
   * Note that instancing is not allowed for this class because all its methods are static.
   *
   * @throws {Error} instancing not allowed for this class
   * @hideconstructor
   */
  constructor () {
    throw new Error('Instancing not allowed for this class')
  }

  /**
   * Return the MIME Type for CloudEvent intances
   * batched into a single JSON document (array),
   * using the JSON Batch Format
   *
   * @static
   * @return {string} the value
   */
  static mediaType () {
    return 'application/cloudevents-batch+json'
  }

  /**
   * Validate the given JSONBatch.
   *
   * @static
   * @param {!object[]|object} batch the JSONBatch (array) to validate, or a single CloudEvent instance
   * @param {object} [options={}] containing: strict (boolean, default false) to validate it in a more strict way
   * @return {object[]} an array of (flattened, non null) validation errors, or at least an empty array
   */
  static validateBatch (batch, { strict = false } = {}) {
    if (V.isUndefinedOrNull(batch)) {
      return [new Error('JSONBatch undefined or null')]
    }

    // standard validation
    const ve = [] // validation errors
    if (V.isArray(batch)) {
      batch.forEach((i, index) => {
        if (V.isDefinedAndNotNull(i) || strict === true) {
          // additional validation (and on all items) in strict mode
          const ceValidation = CloudEvent.validateEvent(i, { strict })
          if (ceValidation.length > 0) {
            // append validation errors found
            ve.push(...ceValidation)
          }
        }
      })
    } else if (CloudEvent.isCloudEvent(batch)) {
      // validate the given (single) CloudEvent instance or subclass
      // in strict mode this is a validation error anyway, so add it
      if (strict === true) {
        ve.push(new TypeError("The argument 'batch' must be an array, instead got a CloudEvent instance (or a subclass)"))
      }
      ve.push(...CloudEvent.validateEvent(batch, { strict }))
    } else {
      return [new TypeError(`The argument 'batch' must be an array or a CloudEvent instance (or a subclass), instead got a '${typeof batch}'`)]
    }

    const veFiltered = ve.filter((i) => {
      return (V.isArray(i) || V.isError(i))
    }).reduce((acc, x) => acc.concat(x), []) // same as flat/flatMap

    return veFiltered
  }

  /**
   * Tell the given JSONBatch, if it's valid.
   *
   * See {@link CloudEvent.validateBatch}.
   *
   * @static
   * @param {!object} batch the JSONBatch to validate
   * @param {object} [options={}] containing: strict (boolean, default false) to validate it in a more strict way
   * @return {boolean} true if valid, otherwise false
   */
  static isValidBatch (batch, { strict = false } = {}) {
    const validationErrors = JSONBatch.validateBatch(batch, { strict })
    const size = V.getSize(validationErrors)
    return (size === 0)
  }

  /**
   * Tell the given object, if it's a JSONBatch (or at least an empty one).
   *
   * @static
   * @param {!object} batch the JSONBatch to check
   * @return {boolean} true if it's an array, otherwise false
   * @throws {Error} if batch is undefined or null
   */
  static isJSONBatch (batch) {
    if (V.isUndefinedOrNull(batch)) {
      throw new Error('JSONBatch undefined or null')
    }
    return V.isArray(batch)
  }

  /**
   * Generator to iterate across all CloudEvent instances in the JSONBatch.
   *
   * @static
   * @generator
   * @param {!object} batch the JSONBatch to iterate
   * @param {object} [options={}] optional processing attributes:
   *        - onlyValid (boolean, default false) to extract only valid instances
   *        - strict (boolean, default false) to validate it in a more strict way
   * @return {object} a CloudEvent (if any)
   * @throws {Error} if batch is undefined or null
   * @throws {TypeError} if batch is not a JSONBatch
   */
  static * getEvent (batch, {
    onlyValid = false,
    strict = false
  } = {}) {
    if (!JSONBatch.isJSONBatch(batch)) {
      throw new TypeError('The given batch is not a JSONBatch')
    }

    const itemsFiltered = batch.filter((i) => V.isDefinedAndNotNull(i) && CloudEvent.isCloudEvent(i))
    for (const i of itemsFiltered) {
      if (onlyValid === false) {
        yield i
      } else {
        // return only if it's a valid instance
        if (CloudEvent.isValidEvent(i, { strict })) {
          yield i
        }
      }
    }
  }

  /**
   * Return any not null CloudEvent instance from the given object.
   *
   * @static
   * @param {!object} batch the JSONBatch to extract CloudEvent instances (if any)
   * @param {object} [options={}] optional processing attributes:
   *        - onlyValid (boolean, default false) to extract only valid instances
   *        - strict (boolean, default false) to validate it in a more strict way
   * @return {object[]} processed events, as an array
   * @throws {Error} if batch is undefined or null, or an option is undefined/null/wrong
   * @throws {TypeError} if batch is not a JSONBatch
   */
  static getEvents (batch, {
    onlyValid = false,
    strict = false
  } = {}) {
    if (!JSONBatch.isJSONBatch(batch)) {
      throw new TypeError('The given batch is not a JSONBatch')
    }

    const ce = [] // CloudEvent instances
    // get values from the generator function, to simplify logic here
    for (const val of JSONBatch.getEvent(batch, { onlyValid, strict })) {
      ce.push(val)
    }

    return ce
  }

  /**
   * Serialize the given JSONBatch in JSON format.
   * Note that standard CloudEvent serialization will be called
   * for any CloudEvent instance, nothing other;
   * so options are the same used in CloudEvent related method.
   *
   * See {@link CloudEvent.serializeEvent}.
   *
   * @static
   * @param {!object[]} batch the JSONBatch (so a CloudEvent array instance) to serialize
   * @param {object} [options={}] optional serialization attributes
   *        Additional options valid here:
   *        - logError (boolean, default false) to log to console serialization errors
   *        - throwError (boolean, default false) to throw serialization errors
   * @param {object} callback a callback with usual arguments (err, data) to notify after processing each item
   * @return {string} the serialized JSONBatch, as a string
   * @throws {Error} if batch is undefined or null, or an option is undefined/null/wrong or callback is not a function
   * @throws {TypeError} if batch is not a JSONBatch
   */
  static serializeEvents (batch, options = {}, callback) {
    if (!JSONBatch.isJSONBatch(batch)) {
      throw new TypeError('The given batch is not a JSONBatch')
    }
    if (V.isDefinedAndNotNull(callback) && !V.isFunction(callback)) {
      throw new Error('The given callback is not a function')
    }

    let ser = '[' // serialized CloudEvent instances
    let num = 0 // number of serialized CloudEvent

    // get values from the generator function, to simplify logic here
    for (const val of JSONBatch.getEvent(batch, options)) {
      ser += ((num > 0) ? ', ' : '')
      ser += ((options.prettyPrint === true) ? '\n' : '')
      try {
        ser += CloudEvent.serializeEvent(val, options)
        if (V.isFunction(callback)) callback(null, { item: val, num })
        num++
      } catch (e) {
        ser += 'null' // as a fallback placeholder
        if (V.isFunction(callback)) callback(e, { item: null, num })
        if (options.logError === true) {
          console.error(e)
        }
        if (options.throwError === true) {
          const msg = `Unable to serialize CloudEvent instance number ${num}, error detail: ${e.message}`
          throw new Error(msg)
        }
      }
    }

    if (options.prettyPrint === true) {
      ser += '\n'
    }
    ser += ']'

    return ser
  }

  /**
   * Deserialize/parse the given JSONBatch from JSON format.
   * Note that standard CloudEvent deserialization will be called
   * for any CloudEvent instance, nothing other;
   * so options are the same used in CloudEvent related method.
   *
   * See {@link CloudEvent.deserializeEvent}.
   *
   * @static
   * @param {!string} ser the serialized JSONBatch to parse/deserialize
   * @param {object} [options={}] optional deserialization attributes
   *        Additional options valid here:
   *        - logError (boolean, default false) to log to console deserialization errors
   *        - throwError (boolean, default false) to throw serialization errors
   * @param {object} callback a callback with usual arguments (err, data) to notify after processing each item
   * @return {object[]} the deserialized batch as a JSONBatch (so a CloudEvent array instance)
   * @throws {Error} if ser is undefined or null, or an option is undefined/null/wrong
   * @throws {Error} in case of JSON parsing error
   * @throws {TypeError} if ser is not a JSONBatch representation
   */
  static deserializeEvents (ser, options = {}, callback) {
    if (!V.isStringNotEmpty(ser)) throw new Error(`Missing or wrong serialized data: '${ser}' must be a string and not a: '${typeof ser}'.`)
    if (V.isDefinedAndNotNull(callback) && !V.isFunction(callback)) {
      throw new Error('The given callback is not a function')
    }

    // first deserialize to normal object instances
    let deser = null
    try {
      deser = JSON.parse(ser)
    } catch (e) {
      if (options.logError === true) {
        console.error(e)
      }
      if (options.throwError === true) {
        const msg = `Unable to deserialize the given string to JSONBatch, error detail: ${e.message}`
        throw new Error(msg)
      }
    }
    if (!V.isArray(deser)) {
      throw new TypeError('The given string is not an array representation')
    }

    // then build CloudEvent instances from any not null object that seems compatible
    const itemsFiltered = deser.filter((i) => V.isDefinedAndNotNull(i) && V.isObjectPlain(i))
    const batch = []
    let num = 0 // number of created CloudEvent
    for (const i of itemsFiltered) {
      // create a CloudEvent instance from the current object (if possible)
      try {
        const extensions = V.getObjectFilteredProperties(i, CloudEvent.isExtensionProperty)
        // note that strict is handled both as strict and inside extensions, but it's good the same
        const ce = new CloudEvent(i.id, i.type, i.source, i.data, {
          time: i.time,
          data_base64: i.data_base64,
          datacontenttype: i.datacontenttype,
          dataschema: i.dataschema,
          subject: i.subject,
          strict: CloudEvent.getStrictExtensionOfEvent(i) || options.strict
        },
        extensions
        )
        if (V.isUndefinedOrNull(options.onlyValid) ||
          options.onlyValid === false ||
          (options.onlyValid === true && CloudEvent.isValidEvent(ce, { strict: options.strict }))
        ) {
          batch.push(ce)
          if (V.isFunction(callback)) callback(null, { item: ce, num })
          num++
        }
      } catch (e) {
        if (V.isFunction(callback)) callback(e, { item: null, num })
        if (options.logError === true) {
          console.error(e)
        }
        if (options.throwError === true) {
          const msg = `Unable to create CloudEvent instance number ${num}, error detail: ${e.message}`
          throw new Error(msg)
        }
      }
    }

    return batch
  }
}

module.exports = JSONBatch
