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

const assert = require('assert')
const test = require('tap').test

/** @test {CloudEvent} */
test('ensure objects exported by index script, exists and are of the right type', (t) => {
  t.plan(15)

  {
    const CloudEventExports = require('../src/') // reference the library
    assert(CloudEventExports !== null)
    assert.strictEqual(typeof CloudEventExports, 'object')
    t.ok(CloudEventExports)
    t.strictEqual(typeof CloudEventExports, 'object')
    const CloudEventClass = CloudEventExports.CloudEvent // reference the implementation class
    t.ok(CloudEventClass)
    t.strictEqual(typeof CloudEventClass, 'function')
    const CloudEventValidator = CloudEventExports.CloudEventValidator // reference the validator class
    t.ok(CloudEventValidator)
    t.strictEqual(typeof CloudEventValidator, 'function')
  }

  {
    const { CloudEvent: CEClass, CloudEventValidator: V } = require('../src/') // get references via destructuring
    // const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring
    t.strictEqual(typeof CEClass, 'function')
    t.strictEqual(typeof V.isClass, 'function')
    t.ok(V.isFunction(CEClass))
    t.ok(V.isFunction(V.isClass))

    const { CloudEvent } = require('../src/') // get references via destructuring
    t.ok(CloudEvent)
    t.strictEqual(typeof CloudEvent, 'function')

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = new CEClass('1', // eventID
      'com.github.smartiniOnGitHub.cloudeventjs.testevent', // eventType
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal)
    // console.log(`DEBUG - cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    // console.log(`DEBUG - cloudEvent details: ${CEClass.dumpObject(ceMinimal, 'ceMinimal')}`)

    // check that created instances belongs to the right base class
    t.ok(V.isClass(ceMinimal, CloudEvent))
    t.ok(V.isClass(ceMinimal, CEClass))
  }
})
