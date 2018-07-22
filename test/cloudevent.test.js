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
test('ensure the CloudEvent class is exported by the library', (t) => {
  t.plan(4)
  const CEClass = require('../src/') // reference the library
  // optional, using some standard Node.js assert statements, as a sample
  assert(CEClass !== null)
  assert.strictEqual(typeof CEClass, 'function')
  assert(new CEClass() instanceof CEClass)
  assert.strictEqual(CEClass.mediaType(), 'application/cloudevents+json')
  t.ok(CEClass)
  t.strictEqual(typeof CEClass, 'function')
  t.strictEqual(new CEClass() instanceof CEClass, true)
  t.strictEqual(CEClass.mediaType(), 'application/cloudevents+json')
})

/** @test {CloudEvent} */
test('ensure isValid and validate works good on undefined and null objects', (t) => {
  t.plan(7)
  const CEClass = require('../src/') // reference the library
  t.ok(CEClass)

  // undefined
  t.notOk()
  t.notOk(CEClass.isValidEvent())
  t.strictSame(CEClass.validateEvent(), [new Error('CloudEvent undefined or null')])

  // null
  t.notOk(null)
  t.notOk(CEClass.isValidEvent(null))
  t.strictSame(CEClass.validateEvent(null), [new Error('CloudEvent undefined or null')])
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (empty, without minimal arguments set or not set) and ensure they are different objects', (t) => {
  t.plan(9)
  const CEClass = require('../src/') // reference the library
  t.ok(CEClass)

  // create an instance without mandatory arguments (but no strict mode): expected success ...
  const ceEmpty = new CEClass()
  t.ok(ceEmpty)
  t.ok(!CEClass.isValidEvent(ceEmpty))
  // t.strictSame(CEClass.validateEvent(ceEmpty), []) // temp, to see the error during development ...
  t.strictSame(CEClass.validateEvent(ceEmpty).length, 2) // simplify comparison of results, check only the  number of expected errors ...
  // TODO: the same but using normal instance methods, to ensure they works good ... wip

  // create an instance without mandatory arguments (but with strict mode): expected failure ...
  let ceEmpty2 = null
  try {
    ceEmpty2 = new CEClass(undefined, undefined, undefined, { strict: true })
    assert(ceEmpty2 === null) // never executed
  } catch (e) {
    t.ok(e) // expected error here
    t.ok(!CEClass.isValidEvent(ceEmpty2))
    t.strictSame(CEClass.validateEvent(ceEmpty2), [new Error('CloudEvent undefined or null')])
    // TODO: the same but using normal instance methods, to ensure they works good ... wip
  }
  t.equal(ceEmpty2, null)
  // the same test, but in a shorter form ...
  t.throws(function () {
    const ce = new CEClass(undefined, undefined, undefined, { strict: true })
    assert(ce === null) // never executed
  }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (with minimal fields set) and ensure they are different objects', (t) => {
  t.plan(25)
  const CEClass = require('../src/') // reference the library
  t.ok(CEClass)

  // t.notSame(CEClass.isValidEvent, CEClass.validateEvent)
  t.strictNotSame(CEClass.isValidEvent, CEClass.validateEvent)

  // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
  const ceMinimal = new CEClass('1', // eventID
    'org.fastify.plugins.cloudevents.testevent', // eventType
    {} // data (empty) // optional, but useful the same in this sample usage
  )
  t.ok(ceMinimal)
  // console.log(`DEBUG - cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
  console.log(`DEBUG - cloudEvent details: ${CEClass.dumpObject(ceMinimal, 'ceMinimal')}`)
  t.ok(CEClass.isValidEvent(ceMinimal))
  t.strictSame(CEClass.validateEvent(ceMinimal), [])
  // t.strictSame(CEClass.validateEvent(ceEmpty), []) // temp, to see the error during development ...
  t.strictSame(CEClass.validateEvent(ceMinimal).length, 0) // simplify comparison of results, check only the  number of expected errors ...
  // create another instance, similar
  // TODO: the same but using normal instance methods, to ensure they works good ... wip
  const ceMinimal2 = new CEClass('2', // eventID
    'org.fastify.plugins.cloudevents.testevent', // eventType
    {} // data (empty) // optional, but useful the same in this sample usage
  )
  t.ok(ceMinimal2)
  t.ok(CEClass.isValidEvent(ceMinimal2)) // using default strict mode in the event
  t.ok(CEClass.isValidEvent(ceMinimal2, { strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(CEClass.validateEvent(ceMinimal2), [])
  t.strictSame(CEClass.validateEvent(ceMinimal2).length, 0)
  assert(ceMinimal !== ceMinimal2) // they must be different object references
  // then ensure they are different (have different values inside) ...
  t.notSame(ceMinimal, ceMinimal2)
  t.strictNotSame(ceMinimal, ceMinimal2)
  // TODO: the same but using normal instance methods, to ensure they works good ... wip

  // create an instance with a mandatory argument undefined (but no strict mode): expected success ...
  // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
  const ceMinimalMandatoryUndefinedNoStrict = new CEClass(undefined, undefined, undefined, { strict: false })
  assert(ceMinimalMandatoryUndefinedNoStrict !== null)
  t.ok(ceMinimalMandatoryUndefinedNoStrict)
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryUndefinedNoStrict)) // using default strict mode in the event
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(CEClass.validateEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: false }).length, 2)
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: true })) // the same but validate with strict mode enabled ...
  // TODO: the same but using normal instance methods, to ensure they works good ... wip

  // the same but with strict mode: expected exception ...
  t.throws(function () {
    const ceMinimalMandatoryUndefinedStrict = new CEClass(undefined, undefined, undefined, { strict: true })
    assert(ceMinimalMandatoryUndefinedStrict === null) // never executed
  }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')

  // create an instance with a mandatory argument null (but no strict mode): expected success ...
  // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
  const ceMinimalMandatoryNullNoStrict = new CEClass(null, null, null, { strict: false })
  assert(ceMinimalMandatoryNullNoStrict !== null)
  t.ok(ceMinimalMandatoryNullNoStrict)
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryNullNoStrict)) // using default strict mode in the event
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryNullNoStrict, { strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(CEClass.validateEvent(ceMinimalMandatoryNullNoStrict, { strict: false }).length, 2)
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryNullNoStrict, { strict: true })) // the same but validate with strict mode enabled ...
  // TODO: the same but using normal instance methods, to ensure they works good ... wip

  // the same but with strict mode: expected exception ...
  t.throws(function () {
    const ceMinimalMandatoryNullStrict = new CEClass(null, null, null, { strict: true })
    assert(ceMinimalMandatoryNullStrict === null) // never executed
  }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
})

// TODO: add more tests ...
