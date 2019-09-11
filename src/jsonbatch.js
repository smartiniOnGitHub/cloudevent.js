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
 * JSONBatch:
 * this module exports some useful definition and utility related to
 * the JSONBatch definition for CloudEvents.
 */

/**
 * Get a reference to cloudevent CloudEvent class.
 *
 * @see Validator
 */
const CloudEvent = require('./cloudevent') // get cloudevent from here

/**
 * Get a reference to cloudevent Validator class.
 *
 * @see Validator
 */
const V = require('./validator') // get validator from here

/**
 * JSONBatch implementation.
 *
 * @see https://github.com/cloudevents/spec/blob/v0.3/json-format.md#4-json-batch-format
 */
class JSONBatch {
  /**
   * Create a new instance of a JSONBatch object.
   *
   * Note that instancing is not allowed for this class because all its methods are static.
   *
   * @throws {Error} because instancing not allowed for this class
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
   * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
   * @return {object[]} an array of (flattened, non null) validation errors, or at least an empty array
   */
  static validateBatch (batch, { strict = false } = {}) {
    if (V.isUndefinedOrNull(batch)) {
      return [new Error('JSONBatch undefined or null')]
    }

    // standard validation
    const ve = [] // validation errors
    if (V.isArray(batch)) {
      // additional validation on nested items (any not null item)
      const itemsValidation = batch.filter((i) => V.isDefinedAndNotNull(i)
      ).map((i) => {
        const ceValidation = CloudEvent.validateEvent(i, { strict })
        if (ceValidation.length > 0) {
          // return validation errors found
          return ceValidation
        }
      })
      ve.push(...itemsValidation)
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
   * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
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
   * @param {!object} batch the JSONBatch to iterate
   * @param {object} options optional processing attributes:
   *        onlyValid (boolean, default false) to extract only valid instances
   *        strict (boolean, default false) to validate it in a more strict way
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
   * @param {object} options optional processing attributes:
   *        onlyValid (boolean, default false) to extract only valid instances
   *        strict (boolean, default false) to validate it in a more strict way
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
   * @param {object} options optional serialization attributes
   *        Additional options valid here:
   *        logError (boolean, default false) to log to console serialization errors
   *        throwError (boolean, default false) to throw serialization errors
   * @return {string} the serialized JSONBatch, as a string
   * @throws {Error} if batch is undefined or null, or an option is undefined/null/wrong
   * @throws {TypeError} if batch is not a JSONBatch
   */
  static serializeEvents (batch, options = {}) {
    if (!JSONBatch.isJSONBatch(batch)) {
      throw new TypeError('The given batch is not a JSONBatch')
    }

    let ser = '[' // serialized CloudEvent instances
    let num = 0 // number of serialized CloudEvent

    // get values from the generator function, to simplify logic here
    for (const val of JSONBatch.getEvent(batch, options)) {
      num++
      ser += ((num > 1) ? ', ' : '')
      ser += ((options.prettyPrint === true) ? '\n' : '')
      try {
        ser += JSONBatch.serializeEvent(val, options)
      } catch (e) {
        if (options.logError === true) {
          console.error(e)
        } else if (options.throwError === true) {
          const msg = `Unable to serialize CloudEvent instance number ${num}, error detail: ${e.message}`
          throw new Error(msg)
        }
      }
    }

    if (options.prettyPrint === true) {
      ser += '\n'
    }
    ser += ']'
    console.log(`ser = \n${ser}`) // TODO: temp ...

    return ser
    // TODO: check if JSON is right ... wip
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
   * @param {object} options optional deserialization attributes
   * @return {object[]} the deserialized batch as a JSONBatch (so a CloudEvent array instance)
   * @throws {Error} if ser is undefined or null, or an option is undefined/null/wrong
   * @throws {Error} in case of JSON parsing error
   */
  static deserializeEvents (ser, options = {}) {
    if (!V.isStringNotEmpty(ser)) throw new Error(`Missing or wrong serialized data: '${ser}' must be a string and not a: '${typeof ser}'.`)

    // TODO: remove JSON array delimiters, get any serialized CloudEvent and parse with specific deserialization method ... wip
    /*
    // TODO: check if something like this could work: ... probably not, but good to know
    var json = `[ { "data":"Test", "null_data": null, "result":true, "count":42 } , {} ]`

    obj = JSON.parse(json, (key, value) => {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        console.log('object found: ' + (value !== null) ? JSON.stringify(value) : null) // TODO: temp …
        return value
      }
      return value
    })
    console.log('Parsed object = ' + obj)
     */

    // TODO: check if this implementation is right ... wip
  }
}

module.exports = JSONBatch
