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

const assert = require('node:assert').strict
const test = require('tap').test

/** @test {CloudEvent} */
test('ensure objects exported by index script, exists and are of the right type', (t) => {
  // t.plan(27)

  {
    const CloudEventExports = require('../src/') // reference the library
    assert(CloudEventExports !== null)
    assert.strictEqual(typeof CloudEventExports, 'object')
    t.ok(CloudEventExports)
    t.equal(typeof CloudEventExports, 'object')
    const CloudEventClass = CloudEventExports.CloudEvent // reference the implementation class
    t.ok(CloudEventClass)
    t.equal(typeof CloudEventClass, 'function')
    const CloudEventValidator = CloudEventExports.CloudEventValidator // reference the validator class
    t.ok(CloudEventValidator)
    t.equal(typeof CloudEventValidator, 'function')
    const CloudEventTransformer = CloudEventExports.CloudEventTransformer // reference the transformer class
    t.ok(CloudEventTransformer)
    t.equal(typeof CloudEventTransformer, 'function')
    const CloudEventUtilities = CloudEventExports.CloudEventUtilities // reference the utilities
    t.ok(CloudEventUtilities)
    t.equal(typeof CloudEventUtilities, 'object')
    const JSONBatchClass = CloudEventExports.JSONBatch // reference the implementation class
    t.ok(JSONBatchClass)
    t.equal(typeof JSONBatchClass, 'function')
  }

  {
    const { CloudEvent: CEClass, JSONBatch: JSONBClass, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
    // const { CloudEvent, JSONBatch, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/')
    t.equal(typeof CEClass, 'function')
    t.equal(typeof V.isClass, 'function')
    t.equal(typeof T.dumpObject, 'function')
    t.equal(typeof JSONBClass, 'function')
    t.ok(V.isFunction(CEClass))
    t.ok(V.isFunction(V.isClass))
    t.ok(V.isFunction(T.dumpObject))
    t.ok(V.isFunction(JSONBClass))

    const { CloudEvent, JSONBatch } = require('../src/')
    t.ok(CloudEvent)
    t.equal(typeof CloudEvent, 'function')
    t.ok(JSONBatch)
    t.equal(typeof JSONBatch, 'function')

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = new CEClass('1', // id
      'com.github.smartiniOnGitHub.cloudeventjs.testevent', // type
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal)
    // console.log(`DEBUG | cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

    // check that created instances belongs to the right base class
    t.ok(V.isClass(ceMinimal, CloudEvent))
    t.ok(V.isClass(ceMinimal, CEClass))
  }

  t.end()
})
