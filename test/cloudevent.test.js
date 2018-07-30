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
  t.plan(11)
  const CEClass = require('../src/') // reference the library
  t.ok(CEClass)

  // create an instance without mandatory arguments (but no strict mode): expected success ...
  const ceEmpty = new CEClass()
  t.ok(ceEmpty)
  t.ok(!CEClass.isValidEvent(ceEmpty))
  // t.strictSame(CEClass.validateEvent(ceEmpty), []) // temp, to see the error during development ...
  t.strictSame(CEClass.validateEvent(ceEmpty).length, 2) // simplify comparison of results, check only the  number of expected errors ...
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(!ceEmpty.isValid())
  t.strictSame(ceEmpty.validate(ceEmpty).length, 2) // simplify comparison of results, check only the  number of expected errors ...

  // create an instance without mandatory arguments (but with strict mode): expected failure ...
  let ceEmpty2 = null
  try {
    ceEmpty2 = new CEClass(undefined, undefined, undefined, { strict: true })
    assert(ceEmpty2 === null) // never executed
  } catch (e) {
    t.ok(e) // expected error here
    t.ok(!CEClass.isValidEvent(ceEmpty2))
    t.strictSame(CEClass.validateEvent(ceEmpty2), [new Error('CloudEvent undefined or null')])
    // the same but using normal instance methods, to ensure they works good ... no because here instance is null
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
  t.plan(40)
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
  // console.log(`DEBUG - cloudEvent details: ${CEClass.dumpObject(ceMinimal, 'ceMinimal')}`)
  console.log(`DEBUG - cloudEvent details: ${ceMinimal}`) // implicit call of ots toString method ...
  t.ok(CEClass.isValidEvent(ceMinimal))
  t.strictSame(CEClass.validateEvent(ceMinimal), [])
  // t.strictSame(CEClass.validateEvent(ceEmpty), []) // temp, to see the error during development ...
  t.strictSame(CEClass.validateEvent(ceMinimal).length, 0) // simplify comparison of results, check only the  number of expected errors ...
  // create another instance, similar
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceMinimal.isValid())
  t.strictSame(ceMinimal.validate(), [])
  t.strictSame(ceMinimal.validate().length, 0) // simplify comparison of results, check only the  number of expected errors ...
  const ceMinimal2 = new CEClass('2', // eventID
    'org.fastify.plugins.cloudevents.testevent', // eventType
    {} // data (empty) // optional, but useful the same in this sample usage
  )
  t.ok(ceMinimal2)
  t.ok(CEClass.isValidEvent(ceMinimal2)) // using default strict mode in the event
  t.ok(CEClass.isValidEvent(ceMinimal2, { strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(CEClass.validateEvent(ceMinimal2), [])
  t.strictSame(CEClass.validateEvent(ceMinimal2).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceMinimal2.isValid()) // using default strict mode in the event
  t.ok(ceMinimal2.isValid({ strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(ceMinimal2.validate(), [])
  t.strictSame(ceMinimal2.validate().length, 0)
  // then ensure they are different (have different values inside) ...
  assert(ceMinimal !== ceMinimal2) // they must be different object references
  t.notSame(ceMinimal, ceMinimal2)
  t.strictNotSame(ceMinimal, ceMinimal2)

  // create an instance with a mandatory argument undefined (but no strict mode): expected success ...
  // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
  const ceMinimalMandatoryUndefinedNoStrict = new CEClass(undefined, undefined, undefined, { strict: false })
  assert(ceMinimalMandatoryUndefinedNoStrict !== null)
  t.ok(ceMinimalMandatoryUndefinedNoStrict)
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryUndefinedNoStrict)) // using default strict mode in the event
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(CEClass.validateEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: false }).length, 2)
  t.ok(!CEClass.isValidEvent(ceMinimalMandatoryUndefinedNoStrict, { strict: true })) // the same but validate with strict mode enabled ...
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(!ceMinimalMandatoryUndefinedNoStrict.isValid()) // using default strict mode in the event
  t.ok(!ceMinimalMandatoryUndefinedNoStrict.isValid({ strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(ceMinimalMandatoryUndefinedNoStrict.validate({ strict: false }).length, 2)
  t.ok(!ceMinimalMandatoryUndefinedNoStrict.isValid({ strict: true })) // the same but validate with strict mode enabled ...

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
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(!ceMinimalMandatoryNullNoStrict.isValid()) // using default strict mode in the event
  t.ok(!ceMinimalMandatoryNullNoStrict.isValid({ strict: false })) // same of previous but using strict mode in validation options
  t.strictSame(ceMinimalMandatoryNullNoStrict.validate({ strict: false }).length, 2)
  t.ok(!ceMinimalMandatoryNullNoStrict.isValid({ strict: true })) // the same but validate with strict mode enabled ...

  // the same but with strict mode: expected exception ...
  t.throws(function () {
    const ceMinimalMandatoryNullStrict = new CEClass(null, null, null, { strict: true })
    assert(ceMinimalMandatoryNullStrict === null) // never executed
  }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
})

/** create some common options, for better reuse in tests */
const ceCommonOptions = {
  cloudEventsVersion: '0.0.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: new Date(),
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = {
  cloudEventsVersion: '0.0.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: new Date(),
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: true
}
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { 'hello': 'world' }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

/** @test {CloudEvent} */
test('create two CloudEvent instances with all arguments (mandatory and optional arguments) and ensure they are different objects', (t) => {
  t.plan(21)
  const CEClass = require('../src/') // reference the library
  t.ok(CEClass)

  // create an instance with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
  // note that null values are not handled by default values, only undefined values ...
  const ceFull1 = new CEClass('1/full',
    'org.fastify.plugins.cloudevents.testevent',
    ceCommonData,
    ceCommonOptions
  )
  t.ok(ceFull1)
  t.ok(CEClass.isValidEvent(ceFull1))
  t.ok(CEClass.isValidEvent(ceFull1, { strict: false }))
  t.strictSame(CEClass.validateEvent(ceFull1), [])
  t.strictSame(CEClass.validateEvent(ceFull1).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFull1.isValid())
  t.ok(ceFull1.isValid({ strict: false }))
  t.strictSame(ceFull1.validate(), [])
  t.strictSame(ceFull1.validate().length, 0)

  // create another instance with all fields equals: expected success ...
  const ceFull1Clone = new CEClass('1/full', // should be '2/full/no-strict' ...
    'org.fastify.plugins.cloudevents.testevent',
    ceCommonData,
    ceCommonOptions
  )
  t.ok(ceFull1Clone)
  t.ok(CEClass.isValidEvent(ceFull1Clone))
  t.ok(CEClass.isValidEvent(ceFull1Clone, { strict: false }))
  t.strictSame(CEClass.validateEvent(ceFull1Clone), [])
  t.strictSame(CEClass.validateEvent(ceFull1Clone).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFull1Clone.isValid())
  t.ok(ceFull1Clone.isValid({ strict: false }))
  t.strictSame(ceFull1Clone.validate(), [])
  t.strictSame(ceFull1Clone.validate().length, 0)

  // then ensure they are different objects ...
  assert(ceFull1 !== ceFull1Clone) // they must be different object references
  t.same(ceFull1, ceFull1Clone)
  t.strictSame(ceFull1, ceFull1Clone)
})

/** @test {CloudEvent} */
test('create CloudEvent instances with different kind of data attribute, and ensure the validation is right', (t) => {
  t.plan(73)
  const CEClass = require('../src/') // reference the library
  t.ok(CEClass)

  // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
  // note that null values are not handled by default values, only undefined values ...
  const ceFullDataUndefined = new CEClass('1/full/undefined-data/no-strict',
    'org.fastify.plugins.cloudevents.testevent',
    undefined, // data
    ceCommonOptions
  )
  assert(ceFullDataUndefined !== null)
  t.ok(ceFullDataUndefined)
  t.ok(CEClass.isValidEvent(ceFullDataUndefined))
  t.ok(CEClass.isValidEvent(ceFullDataUndefined, { strict: false }))
  t.strictSame(CEClass.validateEvent(ceFullDataUndefined), [])
  t.strictSame(CEClass.validateEvent(ceFullDataUndefined, { strict: false }).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFullDataUndefined.isValid())
  t.ok(ceFullDataUndefined.isValid({ strict: false }))
  t.strictSame(ceFullDataUndefined.validate(), [])
  t.strictSame(ceFullDataUndefined.validate({ strict: false }).length, 0)
  // the same with with strict mode enabled ...
  const ceFullDataUndefinedStrict = new CEClass('1/full/undefined-data/strict',
    'org.fastify.plugins.cloudevents.testevent',
    undefined, // data
    ceCommonOptionsStrict
  )
  assert(ceFullDataUndefinedStrict !== null)
  t.ok(ceFullDataUndefinedStrict)
  t.ok(CEClass.isValidEvent(ceFullDataUndefinedStrict))
  t.ok(CEClass.isValidEvent(ceFullDataUndefinedStrict, { strict: true }))
  t.strictSame(CEClass.validateEvent(ceFullDataUndefinedStrict), [])
  t.strictSame(CEClass.validateEvent(ceFullDataUndefinedStrict, { strict: true }).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFullDataUndefinedStrict.isValid())
  t.ok(ceFullDataUndefinedStrict.isValid({ strict: true }))
  t.strictSame(ceFullDataUndefinedStrict.validate(), [])
  t.strictSame(ceFullDataUndefinedStrict.validate({ strict: true }).length, 0)

  // create an instance with null data attribute, but with strict flag disabled: expected success ...
  // note that null values are not handled by default values, only undefined values ...
  const ceFullDataNull = new CEClass('1/full/null-data/no-strict',
    'org.fastify.plugins.cloudevents.testevent',
    null, // data
    ceCommonOptions
  )
  assert(ceFullDataNull !== null)
  t.ok(ceFullDataNull)
  t.ok(CEClass.isValidEvent(ceFullDataNull))
  t.ok(CEClass.isValidEvent(ceFullDataNull, { strict: false }))
  t.strictSame(CEClass.validateEvent(ceFullDataNull), [])
  t.strictSame(CEClass.validateEvent(ceFullDataNull, { strict: false }).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFullDataNull.isValid())
  t.ok(ceFullDataNull.isValid({ strict: false }))
  t.strictSame(ceFullDataNull.validate(), [])
  t.strictSame(ceFullDataNull.validate({ strict: false }).length, 0)
  // the same with with strict mode enabled ...
  const ceFullDataNullStrict = new CEClass('1/full/null-data/strict',
    'org.fastify.plugins.cloudevents.testevent',
    null, // data
    ceCommonOptionsStrict
  )
  assert(ceFullDataNullStrict !== null)
  t.ok(ceFullDataNullStrict)
  t.ok(CEClass.isValidEvent(ceFullDataNullStrict))
  t.ok(CEClass.isValidEvent(ceFullDataNullStrict, { strict: true }))
  t.strictSame(CEClass.validateEvent(ceFullDataNullStrict), [])
  t.strictSame(CEClass.validateEvent(ceFullDataNullStrict, { strict: true }).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFullDataNullStrict.isValid())
  t.ok(ceFullDataNullStrict.isValid({ strict: true }))
  t.strictSame(ceFullDataNullStrict.validate(), [])
  t.strictSame(ceFullDataNullStrict.validate({ strict: true }).length, 0)

  // create an instance with null data attribute, but with strict flag disabled: expected success ...
  // note that null values are not handled by default values, only undefined values ...
  const ceFullDataString = new CEClass('1/full/string-data/no-strict',
    'org.fastify.plugins.cloudevents.testevent',
    'data as a string, bad here', // data
    ceCommonOptions
  )
  assert(ceFullDataString !== null)
  t.ok(ceFullDataString)
  // data type errors handled only in strict mode currently ...
  t.ok(CEClass.isValidEvent(ceFullDataString))
  t.ok(CEClass.isValidEvent(ceFullDataString, { strict: false }))
  t.strictSame(CEClass.validateEvent(ceFullDataString), [])
  t.strictSame(CEClass.validateEvent(ceFullDataString, { strict: false }).length, 0)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFullDataString.isValid())
  t.ok(ceFullDataString.isValid({ strict: false }))
  t.strictSame(ceFullDataString.validate(), [])
  t.strictSame(ceFullDataString.validate({ strict: false }).length, 0)
  // the same with with strict mode enabled ...
  const ceFullDataStringStrict = new CEClass('1/full/string-data/strict',
    'org.fastify.plugins.cloudevents.testevent',
    'data as a string, bad here', // data
    ceCommonOptionsStrict
  )
  assert(ceFullDataStringStrict !== null)
  t.ok(ceFullDataStringStrict)
  // data type errors handled only in strict mode currently ...
  t.ok(!CEClass.isValidEvent(ceFullDataStringStrict))
  t.ok(!CEClass.isValidEvent(ceFullDataStringStrict, { strict: true }))
  t.strictSame(CEClass.validateEvent(ceFullDataStringStrict).length, 1)
  t.strictSame(CEClass.validateEvent(ceFullDataStringStrict, { strict: true }).length, 1)
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(!ceFullDataStringStrict.isValid())
  t.ok(!ceFullDataStringStrict.isValid({ strict: true }))
  t.strictSame(ceFullDataStringStrict.validate().length, 1)
  t.strictSame(ceFullDataStringStrict.validate({ strict: true }).length, 1)

  // create an instance with a sample Map data attribute, but with strict flag disabled: expected success ...
  // note that null values are not handled by default values, only undefined values ...
  const ceFullDataMap = new CEClass('1/full/map-data/no-strict',
    'org.fastify.plugins.cloudevents.testevent',
    ceMapData, // data
    ceCommonOptions
  )
  assert(ceFullDataMap !== null)
  t.ok(ceFullDataMap)
  t.ok(CEClass.isValidEvent(ceFullDataMap))
  t.ok(CEClass.isValidEvent(ceFullDataMap, { strict: false }))
  t.strictSame(CEClass.validateEvent(ceFullDataMap), []) // data type errors handled only in strict mode currently ...
  t.strictSame(CEClass.validateEvent(ceFullDataMap, { strict: false }).length, 0) // data type errors handled only in strict mode currently ...
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFullDataMap.isValid())
  t.ok(ceFullDataMap.isValid({ strict: false }))
  t.strictSame(ceFullDataMap.validate(), []) // data type errors handled only in strict mode currently ...
  t.strictSame(ceFullDataMap.validate({ strict: false }).length, 0) // data type errors handled only in strict mode currently ...
  // the same with with strict mode enabled ...
  const ceFullDataMapStrict = new CEClass('1/full/map-data/strict',
    'org.fastify.plugins.cloudevents.testevent',
    ceMapData, // data
    ceCommonOptionsStrict
  )
  assert(ceFullDataMapStrict !== null)
  t.ok(ceFullDataMapStrict)
  t.ok(CEClass.isValidEvent(ceFullDataMapStrict))
  t.ok(CEClass.isValidEvent(ceFullDataMapStrict, { strict: true }))
  t.strictSame(CEClass.validateEvent(ceFullDataMapStrict).length, 0) // data type errors handled only in strict mode currently ...
  t.strictSame(CEClass.validateEvent(ceFullDataMapStrict, { strict: true }).length, 0) // data type errors handled only in strict mode currently ...
  // the same but using normal instance methods, to ensure they works good ...
  t.ok(ceFullDataMapStrict.isValid())
  t.ok(ceFullDataMapStrict.isValid({ strict: true }))
  t.strictSame(ceFullDataMapStrict.validate().length, 0) // data type errors handled only in strict mode currently ...
  t.strictSame(ceFullDataMapStrict.validate({ strict: true }).length, 0) // data type errors handled only in strict mode currently ...
})
