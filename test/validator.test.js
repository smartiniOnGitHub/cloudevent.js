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

/** @test {Validator} */
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
  t.plan(33)

  /** create some classes, for better reuse in following tests */
  const { CloudEvent: CEClass } = require('../src/') // get references via destructuring
  class NotCESubclass {
  }
  class CESubclass extends CEClass {
  }

  {
    const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(typeof CloudEvent.version, 'function')
    t.strictEqual(typeof V.isClass, 'function')
    t.strictEqual(typeof T.dumpObject, 'function')
    t.ok(V.isFunction(CloudEvent))
    t.ok(V.isFunction(V.isClass))
    t.ok(V.isFunction(T.dumpObject))

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = new CEClass('1', // id
      'com.github.smartiniOnGitHub.cloudeventjs.testevent', // type
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal)
    // console.log(`DEBUG - cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

    // check that created instances belongs to the right base class
    t.ok(V.isClass(ceMinimal, CloudEvent))
    t.ok(V.isClass(ceMinimal, CEClass))
    t.ok(!V.isClass(ceMinimal, NotCESubclass))
    t.ok(!V.isClass(ceMinimal, CESubclass))
    t.ok(!V.ensureIsClass(ceMinimal, CloudEvent, 'ceMinimal')) // no error returned
    t.ok(!V.ensureIsClass(ceMinimal, CEClass, 'ceMinimal')) // no error returned
    t.ok(V.isClass(V.ensureIsClass(ceMinimal, CESubclass, 'ceMinimal'), TypeError)) // expected error returned
    t.ok(V.isClass(V.ensureIsClass(ceMinimal, NotCESubclass, 'ceMinimal'), TypeError)) // expected error returned

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimalSubclass = new CESubclass('1EX', // id
      'org.github.smartiniOnGitHub.cloudeventjs.testeventEx', // type
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimalSubclass)
    // console.log(`DEBUG - cloudEvent details: ceMinimalSubclass = ${JSON.stringify(ceMinimalSubclass)}`)
    // console.log(`DEBUG - cloudEvent details: ${T.dumpObject(ceMinimalSubclass, 'ceMinimalSubclass')}`)

    // check that created instances belongs to the right base class
    t.ok(V.isClass(ceMinimalSubclass, CloudEvent))
    t.ok(V.isClass(ceMinimalSubclass, CEClass))
    t.ok(!V.isClass(ceMinimalSubclass, NotCESubclass))
    t.ok(V.isClass(ceMinimalSubclass, CESubclass))
    t.ok(!V.ensureIsClass(ceMinimalSubclass, CloudEvent, 'ceMinimal')) // no error returned
    t.ok(!V.ensureIsClass(ceMinimalSubclass, CEClass, 'ceMinimal')) // no error returned
    t.ok(!V.ensureIsClass(ceMinimalSubclass, CESubclass, 'ceMinimal')) // no error returned
    t.ok(V.isClass(V.ensureIsClass(ceMinimalSubclass, NotCESubclass, 'ceMinimal'), TypeError)) // expected error returned
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

/** @test {CloudEvent} */
test('ensure some (less used) validation functions are right', (t) => {
  t.plan(94)

  const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)
  t.ok(V)

  {
    const undefinedGood = undefined
    t.ok(V.isUndefined(undefinedGood))
    t.strictSame(V.ensureIsUndefined(undefinedGood, 'test'), undefined) // no error returned
    t.ok(V.isUndefinedOrNull(undefinedGood))
    t.strictSame(V.ensureIsUndefinedOrNull(undefinedGood, 'test'), undefined) // no error returned
    const undefinedBad = 'defined'
    t.ok(!V.isUndefined(undefinedBad))
    t.strictSame(V.ensureIsUndefined(undefinedBad, 'test') instanceof Error, true) // expected error returned
    t.ok(!V.isUndefinedOrNull(undefinedBad))
    t.strictSame(V.ensureIsUndefinedOrNull(undefinedBad, 'test') instanceof Error, true) // expected error returned
  }

  {
    const nullGood = null
    t.ok(V.isNull(nullGood))
    t.strictSame(V.ensureIsNull(nullGood, 'test'), undefined) // no error returned
    t.ok(V.isUndefinedOrNull(nullGood))
    t.strictSame(V.ensureIsUndefinedOrNull(nullGood, 'test'), undefined) // no error returned
    const nullBad = 'defined'
    t.ok(!V.isNull(nullBad))
    t.strictSame(V.ensureIsNull(nullBad, 'test') instanceof Error, true) // expected error returned
    t.ok(!V.isUndefinedOrNull(nullBad))
    t.strictSame(V.ensureIsUndefinedOrNull(nullBad, 'test') instanceof Error, true) // expected error returned
  }

  {
    const dateGood = new Date()
    t.ok(V.isDate(dateGood))
    t.strictSame(V.ensureIsDate(dateGood, 'test'), undefined) // no error returned
    const dateBad = Date.now()
    t.ok(!V.isDate(dateBad))
    t.strictSame(V.ensureIsDate(dateBad, 'test') instanceof Error, true) // expected error returned
    t.ok(!V.ensureIsObjectOrCollectionOrString(dateGood, 'date')) // no error returned
    t.ok(V.ensureIsNumber(dateGood, 'date')) // expected error returned
    t.ok(!V.ensureIsNumber(dateGood.getTime(), 'number')) // no error returned
  }

  {
    const relGood = '1.0.0'
    t.ok(V.isVersion(relGood))
    t.strictSame(V.ensureIsVersion(relGood, 'test'), undefined) // no error returned
    const relBad = 'a.b.c-d'
    t.ok(!V.isVersion(relBad))
    t.strictSame(V.ensureIsVersion(relBad, 'test') instanceof Error, true) // expected error returned
  }

  {
    const objectBad = 1234567890
    t.ok(V.isNumber(objectBad))
    t.ok(!V.isObject(objectBad))
    t.ok(V.ensureIsObjectOrCollection(objectBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollection(objectBad, 'error') instanceof Error, true) // expected error returned
  }

  {
    const objectGood = { name: 'Name', age: 20, note: null }
    t.ok(V.isObject(objectGood))
    t.ok(!V.isString(objectGood))
    t.ok(!V.ensureIsObjectOrCollection(objectGood, 'object')) // no error returned
    t.strictSame(V.ensureIsObjectOrCollection(objectGood, 'object') instanceof Error, false) // no error returned
    t.ok(!V.ensureIsObjectOrCollectionNotString(objectGood, 'object')) // no error returned
    t.ok(!V.ensureIsObjectOrCollectionOrString(objectGood, 'object')) // no error returned
  }

  {
    const objectAsStringGood = '{ name: "Name", age: 20, note: null }'
    t.ok(!V.isObject(objectAsStringGood))
    t.ok(V.isString(objectAsStringGood))
    t.ok(V.ensureIsObjectOrCollection(objectAsStringGood, 'string')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollection(objectAsStringGood, 'string') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionNotString(objectAsStringGood, 'object')) // expected error returned
    t.ok(!V.ensureIsObjectOrCollectionOrString(objectAsStringGood, 'object')) // no error returned
  }

  {
    const stringBad = 1234567890
    t.ok(!V.isString(stringBad))
    t.ok(!V.isStringNotEmpty(stringBad))
    t.ok(V.ensureIsString(stringBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsString(stringBad, 'error') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsStringNotEmpty(stringBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsStringNotEmpty(stringBad, 'error') instanceof Error, true) // expected error returned
  }

  {
    const functionBad = '1234567890'
    t.ok(V.isString(functionBad))
    t.ok(!V.isFunction(functionBad))
    t.ok(V.ensureIsFunction(functionBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsFunction(functionBad, 'error') instanceof Error, true) // expected error returned
  }

  {
    const boolGood = true
    t.ok(V.isBoolean(boolGood))
    t.strictSame(V.ensureIsBoolean(boolGood, 'test'), undefined) // no error returned
    const boolBad = 'false'
    t.ok(!V.isBoolean(boolBad))
    t.strictSame(V.ensureIsBoolean(boolBad, 'test') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionOrString(boolGood, 'boolean')) // expected error returned
  }

  {
    const uriGood = 'http://localhost:3000/path/nested?param1=value1'
    t.ok(V.isURI(uriGood))
    t.strictSame(V.ensureIsURI(uriGood, null, 'test'), undefined) // no error returned
    const uriBad = 'path/nested?param1=value1' // not relative nor absolute uri, so not a real uri string
    t.ok(!V.isURI(uriBad))
    t.strictSame(V.ensureIsURI(uriBad, null, 'test') instanceof Error, true) // expected error returned
  }

  {
    const uriGoodPath = '/path/nested?param1=value1'
    const uriGoodBase = 'http://localhost:3000'
    t.ok(V.isURI(uriGoodPath, uriGoodBase))
    t.strictSame(V.ensureIsURI(uriGoodPath, uriGoodBase, 'test'), undefined) // no error returned
    const uriBad = 'path/nested?param1=value1' // not relative nor absolute uri, so not a real uri string
    t.ok(!V.isURI(uriBad, null))
    t.strictSame(V.ensureIsURI(uriBad, null, 'test') instanceof Error, true) // expected error returned
  }

  {
    const uriGoodPath = '/path/nested?param1=value1'
    const uriBadBase = 'httpz:bad'
    t.ok(!V.isURI(uriGoodPath, uriBadBase))
    t.strictSame(V.ensureIsURI(uriGoodPath, uriBadBase, 'test') instanceof Error, true) // expected error returned
  }

  {
    // test getSize with different argument types
    t.ok(V.isUndefined(V.getSize(null)))
    t.strictSame(V.getSize(null), undefined)
    const obj = { name: 'Name', age: 20, note: null }
    t.ok(V.isNumber(V.getSize(obj)))
    t.strictSame(V.getSize(obj), 3) // include even null items in the size
    const arr = [1, 2, 3, null]
    t.ok(V.isNumber(V.getSize(arr)))
    t.strictSame(V.getSize(arr), 4) // include even null items in the size
    const map = new Map([['key-1', 'value 1'], ['key-2', 'value 2']])
    t.ok(V.isNumber(V.getSize(map)))
    t.strictSame(V.getSize(map), 2)
    const set = new Set([['key-1', 'value 1'], ['key-2', 'value 2']])
    t.ok(V.isNumber(V.getSize(set)))
    t.strictSame(V.getSize(set), 2)
    const str = '12345 67890 '
    t.ok(V.isNumber(V.getSize(str)))
    t.strictSame(V.getSize(str), 12)
    const otherBadNumber = 1234567890
    t.ok(V.isNumber(otherBadNumber))
    t.throws(function () {
      const size = V.getSize(otherBadNumber)
      assert(size !== null) // never executed
    }, Error, 'Expected exception when trying to get the size of a bad object')
    const otherBadBoolean = true
    t.ok(V.isBoolean(otherBadBoolean))
    t.throws(function () {
      const size = V.getSize(otherBadBoolean)
      assert(size !== null) // never executed
    }, Error, 'Expected exception when trying to get the size of a bad object')
  }

  {
    // test getSizeInBytes with different argument types
    t.ok(V.isUndefined(V.getSizeInBytes(null)))
    t.strictSame(V.getSizeInBytes(null), undefined)
    t.throws(function () {
      const size = V.getSizeInBytes({})
      assert(size !== null) // never executed
    }, Error, 'Expected exception when trying to get the size in bytes of not a string')
    const str = '12345 67890 '
    t.ok(V.isNumber(V.getSizeInBytes(str)))
    t.strictSame(V.getSizeInBytes(str), 12)
    t.strictSame(V.getSizeInBytes(str), V.getSize(str))
    t.ok(V.isNumber(V.getSizeInBytes('π')))
    t.strictSame(V.getSizeInBytes('π'), 2)
  }
})

/** @test {CloudEvent} */
test('ensure validation functions on standard properties are right', (t) => {
  t.plan(18)

  const { CloudEvent, CloudEventValidator: V } = require('../src/') // get references via destructuring
  t.ok(CloudEvent)
  t.ok(V)

  // sample function that tell if the given property name is standard
  function isPropStandard (prop) {
    return prop === 'standard'
  }

  t.ok(!V.doesStringIsStandardProperty())
  t.ok(!V.doesStringIsStandardProperty(undefined, undefined))
  t.ok(!V.doesStringIsStandardProperty(null, null))
  t.ok(!V.doesStringIsStandardProperty({}, isPropStandard))
  t.ok(!V.doesStringIsStandardProperty('non_standard', isPropStandard))
  t.ok(V.doesStringIsStandardProperty('standard', isPropStandard))
  t.ok(!V.doesStringIsStandardProperty('property', {}))
  t.ok(!V.doesStringIsStandardProperty('standard', {}))

  t.ok(!V.doesObjectContainsStandardProperty())
  t.ok(!V.doesObjectContainsStandardProperty(undefined, undefined))
  t.ok(!V.doesObjectContainsStandardProperty(null, null))
  t.ok(!V.doesObjectContainsStandardProperty({}, isPropStandard))
  t.ok(!V.doesObjectContainsStandardProperty({ non_standard: 'value' }, isPropStandard))
  t.ok(V.doesObjectContainsStandardProperty({ standard: 'value' }, isPropStandard))
  t.ok(!V.doesObjectContainsStandardProperty({ property: 'value' }, {}))
  t.ok(!V.doesObjectContainsStandardProperty({ standard: 'value' }, {}))
})
