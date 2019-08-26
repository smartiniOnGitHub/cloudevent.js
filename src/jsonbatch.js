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
    }).reduce((acc, x) => acc.concat(x), []) // same as flatMap (available only in newer releases)

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
   * @param {!object} event the CloudEvent to check
   * @return {boolean} true if it's an instance (or a subclass), otherwise false
   */
  static isJSONBatch (batch) {
    if (V.isUndefinedOrNull(batch)) {
      throw new Error('JSONBatch undefined or null')
    }
    return V.isArray(batch)
  }

  // TODO: implement other features ... wip
}

module.exports = JSONBatch
