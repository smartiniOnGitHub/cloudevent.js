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
 * index:
 * this module groups all functions/classes, to export in a simpler way.
 * @module cloudevent
 */

/**
 * Get a reference to CloudEvent class definition.
 * See {@link CloudEvent}.
 * @private
 */
const cloudEventDefinition = require('./cloudevent')

/**
 * Get a reference to JSONBatch class definition.
 * See {@link JSONBatch}.
 * @private
 */
const jsonBatchDefinition = require('./jsonbatch')

/**
 * Get a reference to cloudevent class Validator.
 * See {@link Validator}.
 * @private
 */
const cloudEventValidator = require('./validator')

/**
 * Get a reference to cloudevent class Transformer.
 * See {@link Transformer}.
 * @private
 */
const cloudEventTransformer = require('./transformer')

/**
 * Get a reference to cloudevent utility functions.
 * See {@link CloudEventUtilities}.
 * @private
 */
const cloudEventUtilities = require('./utility')

module.exports = {
  /** CloudEvent class definition. */
  CloudEvent: cloudEventDefinition,

  /** JSONBatch class definition. */
  JSONBatch: jsonBatchDefinition,

  /** CloudEvent class Validator. */
  CloudEventValidator: cloudEventValidator,

  /** CloudEvent class Transformer. */
  CloudEventTransformer: cloudEventTransformer,

  /** CloudEvent utility functions. */
  CloudEventUtilities: cloudEventUtilities
}
