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

/** create a sample namespace for events here, for better reuse in tests */
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent'

/** @test {CloudEvent} */
test('ensure CloudEvent class (and related Validator and Transformer classes) are exported by the library', (t) => {
  t.plan(25)

  const { CloudEvent, JSONBatch, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)
  t.ok(JSONBatch)
  // optional, using some standard Node.js assert statements, as a sample
  assert(CloudEvent !== null)
  assert.strictEqual(typeof CloudEvent, 'function')
  assert(new CloudEvent() instanceof CloudEvent)
  assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
  assert(JSONBatch !== null)
  assert.strictEqual(typeof JSONBatch, 'function')
  assert.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')
  t.ok(V)
  t.strictEqual(typeof CloudEvent, 'function')
  t.strictEqual(typeof JSONBatch, 'function')
  t.strictEqual(typeof V, 'function')
  t.strictEqual(typeof T, 'function')
  t.ok(V.isFunction(CloudEvent))
  t.ok(V.isFunction(JSONBatch))
  t.ok(V.isFunction(V))
  t.ok(V.isFunction(T))
  t.strictEqual(typeof CloudEvent, 'function')
  t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
  t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
  t.strictEqual(typeof JSONBatch, 'function')
  t.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

  {
    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = new CloudEvent('1', // id
      ceNamespace, // type
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal)
    // console.log(`DEBUG - cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

    // check that created instances belongs to the right base class
    t.strictEqual(typeof ceMinimal, 'object')
    t.ok(V.isClass(ceMinimal, CloudEvent))
  }

  {
    // create an instance with only mandatory arguments but null data (and strict mode): expected success ...
    const ceMinimalStrict = new CloudEvent('1-strict', // id
      ceNamespace, // type
      '/', // source
      null // data // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimalStrict)

    // check that created instances belongs to the right base class
    t.strictEqual(typeof ceMinimalStrict, 'object')
    t.ok(V.isClass(ceMinimalStrict, CloudEvent))

    t.strictEqual(typeof ceMinimalStrict.data, 'object') // data is wrapped in an object, so even when null it's an object
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))

    // set ceMinimalStrict.data to null, to ensure validation is good the same
    ceMinimalStrict.data = null
    t.ok(CloudEvent.isValidEvent(ceMinimalStrict))
  }
})

// TODO: implement ... wip
