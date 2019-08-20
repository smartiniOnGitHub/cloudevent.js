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

  // TODO: implement other features ... wip
}

const assert = require('assert')
assert(V !== null) // TODO: temp ...

module.exports = JSONBatch
