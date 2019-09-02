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

const assert = require('assert').strict
const test = require('tap').test

/** @test {CloudEvent} */
test('ensure serialization functions exists (check only the static method here)', (t) => {
  t.plan(12)

  {
    const { CloudEvent, JSONBatch } = require('../src/') // get references via destructuring
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
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
    t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    t.strictEqual(typeof JSONBatch, 'function')
    t.throws(function () {
      const batch = new JSONBatch()
      assert(batch === null) // never executed
    }, Error, 'Expected exception when creating a JSONBatch instance')
    t.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

    const batchSerialize = JSONBatch.serializeEvents
    assert(batchSerialize !== null)
    assert(typeof batchSerialize === 'function')
    t.ok(batchSerialize)
    t.strictEqual(typeof batchSerialize, 'function')

    const batchDeserialize = JSONBatch.deserializeEvents
    assert(batchDeserialize !== null)
    assert(typeof batchDeserialize === 'function')
    t.ok(batchDeserialize)
    t.strictEqual(typeof batchDeserialize, 'function')
  }
})
