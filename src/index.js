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
 * Get a reference to CloudEvent class definition.
 *
 * See {@link CloudEvent}.
 */
const cloudEventDefinition = require('./cloudevent')

/**
 * Get a reference to cloudevent class Validator.
 *
 * See {@link Validator}.
 */
const cloudEventValidator = require('./validator')

/**
 * Get a reference to cloudevent class Transformer.
 *
 * See {@link Transformer}.
 */
const cloudEventTransformer = require('./transformer')

module.exports = {
  CloudEvent: cloudEventDefinition,
  CloudEventValidator: cloudEventValidator,
  CloudEventTransformer: cloudEventTransformer
}
