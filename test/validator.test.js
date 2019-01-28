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
test('ensure the Validator class (direct reference to it) works good', (t) => {
  t.plan(5)
  const V = require('../src/validator') // direct reference to the library
  t.ok(V)
  t.strictEqual(typeof V, 'function')

  // optional, using some standard Node.js assert statements, as a sample
  assert(V !== null)
  assert.strictEqual(typeof V, 'function')
  // assert(new V() instanceof V) // no more allowed

  t.ok(V.isFunction(V))
  t.ok(V.isFunction(V.isClass))
  t.throws(function () {
    const v = new V()
    assert(v === null) // never executed
  }, Error, 'Expected exception when creating a Validator instance')
})

/** @test {CloudEvent} */
test('create CloudEvent instances with different class hierarchy, and ensure the validation is right', (t) => {
  t.plan(22)

  /** create some classes, for better reuse in following tests */
  const { CloudEvent: CEClass } = require('../src/') // get references via destructuring
  class NotCESubclass {
  }
  class CESubclass extends CEClass {
  }

  {
    const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(typeof V.isClass, 'function')
    t.ok(V.isFunction(CloudEvent))
    t.ok(V.isFunction(V.isClass))

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
    t.ok(!V.isClass(ceMinimal, NotCESubclass))
    t.ok(!V.isClass(ceMinimal, CESubclass))

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimalSubclass = new CESubclass('1EX', // eventID
      'org.github.smartiniOnGitHub.cloudeventjs.testeventEx', // eventType
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimalSubclass)
    // console.log(`DEBUG - cloudEvent details: ceMinimalSubclass = ${JSON.stringify(ceMinimalSubclass)}`)
    // console.log(`DEBUG - cloudEvent details: ${CEClass.dumpObject(ceMinimalSubclass, 'ceMinimalSubclass')}`)

    // check that created instances belongs to the right base class
    t.ok(V.isClass(ceMinimalSubclass, CloudEvent))
    t.ok(V.isClass(ceMinimalSubclass, CEClass))
    t.ok(!V.isClass(ceMinimalSubclass, NotCESubclass))
    t.ok(V.isClass(ceMinimalSubclass, CESubclass))
  }

  {
    const { CloudEventValidator: V } = require('../src/') // get references via destructuring
    t.strictEqual(typeof V, 'function')
    t.strictEqual(typeof V.isClass, 'function')
    t.ok(V.isFunction(V))
    t.ok(V.isFunction(V.isClass))

    const { CloudEvent, CloudEventValidator } = require('../src/') // get references via destructuring
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(typeof CloudEventValidator, 'function')
    t.ok(V.isFunction(CloudEvent))
    t.ok(V.isFunction(CloudEventValidator))
  }
})
