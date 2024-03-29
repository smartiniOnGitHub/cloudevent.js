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

const assert = require('node:assert').strict
const test = require('tap').test

/** @test {Validator} */
test('ensure the Validator class (direct reference to it) works good', (t) => {
  // t.plan(5)
  const V = require('../src/validator') // direct reference to the library
  t.ok(V)
  t.equal(typeof V, 'function')

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

  t.end()
})

/** @test {CloudEvent} */
test('create CloudEvent instances with different class hierarchy, and ensure the validation is right', (t) => {
  /** create some classes, for better reuse in following tests */
  const { CloudEvent: CEClass } = require('../src/')
  class NotCESubclass {
  }
  class CESubclass extends CEClass {
  }

  {
    const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('../src/') // get references via destructuring
    t.equal(typeof CloudEvent, 'function')
    t.equal(typeof CloudEvent.version, 'function')
    t.equal(typeof V.isClass, 'function')
    t.equal(typeof T.dumpObject, 'function')
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
    // console.log(`DEBUG | cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceMinimal, 'ceMinimal')}`)

    // check that created instances belongs to the right base class
    t.ok(V.isClass(ceMinimal, CloudEvent))
    t.ok(V.isClass(ceMinimal, CEClass))
    t.ok(!V.isClass(ceMinimal, NotCESubclass))
    t.ok(!V.isClass(ceMinimal, CESubclass))
    t.ok(!V.ensureIsClass(ceMinimal, CloudEvent, 'ceMinimal')) // no error returned
    t.ok(!V.ensureIsClass(ceMinimal, CEClass, 'ceMinimal')) // no error returned
    t.ok(V.isClass(V.ensureIsClass(ceMinimal, CESubclass, 'ceMinimal'), TypeError)) // expected error returned
    t.ok(V.isClass(V.ensureIsClass(ceMinimal, NotCESubclass, 'ceMinimal'), TypeError)) // expected error returned
    t.ok(!V.ensureIsClass(ceMinimal, CloudEvent)) // no error returned
    t.ok(!V.ensureIsClass(ceMinimal, CEClass)) // no error returned

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimalSubclass = new CESubclass('1EX', // id
      'org.github.smartiniOnGitHub.cloudeventjs.testeventEx', // type
      '/', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimalSubclass)
    // console.log(`DEBUG | cloudEvent details: ceMinimalSubclass = ${JSON.stringify(ceMinimalSubclass)}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceMinimalSubclass, 'ceMinimalSubclass')}`)

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
    const { CloudEventValidator: V } = require('../src/')
    t.equal(typeof V, 'function')
    t.equal(typeof V.isClass, 'function')
    t.ok(V.isFunction(V))
    t.ok(V.isFunction(V.isClass))

    const { CloudEvent, CloudEventValidator } = require('../src/')
    t.equal(typeof CloudEvent, 'function')
    t.equal(typeof CloudEventValidator, 'function')
    t.ok(V.isFunction(CloudEvent))
    t.ok(V.isFunction(CloudEventValidator))
  }

  t.end()
})

/** @test {Validator} */
test('ensure some (edge cases for) validation functions are right', (t) => {
  const { CloudEventValidator: V } = require('../src/')
  t.ok(V)

  {
    const arg = undefined
    t.ok(V.isUndefined())
    t.ok(V.isUndefined(arg))
    t.strictSame(V.ensureIsUndefined(), undefined) // no error returned
    t.strictSame(V.ensureIsUndefined(arg, undefined), undefined) // no error returned
    t.strictSame(V.ensureIsUndefined(arg, null), undefined) // no error returned
    t.strictSame(V.ensureIsUndefined(arg, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsUndefined(arg, {}), undefined) // no error returned
    // check what happens with opposite value instead
    const narg = 'sample' // sample value
    t.notOk(V.isUndefined(narg))
    t.strictSame(V.ensureIsUndefined(narg) instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsUndefined(narg, undefined) instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsUndefined(narg, null) instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsUndefined(narg, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsUndefined(narg, {}) instanceof Error, true) // expected error returned
  }
  {
    const arg = null
    t.ok(V.isNull(arg))
    t.strictSame(V.ensureIsNull(arg), undefined) // no error returned
    t.strictSame(V.ensureIsNull(arg, undefined), undefined) // no error returned
    t.strictSame(V.ensureIsNull(arg, null), undefined) // no error returned
    t.strictSame(V.ensureIsNull(arg, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsNull(arg, {}), undefined) // no error returned
    // check what happens with opposite value instead
    const narg = 'sample' // sample value
    t.notOk(V.isNull(narg))
    t.strictSame(V.ensureIsNull(narg) instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsNull(narg, undefined) instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsNull(narg, null) instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsNull(narg, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsNull(narg, {}) instanceof Error, true) // expected error returned
  }

  // similar tests for all other is / ensure methods ...

  t.end()
})

/** @test {Validator} */
test('ensure some (less used) validation functions are right', (t) => {
  const { CloudEventValidator: V } = require('../src/')
  t.ok(V)

  {
    const undefinedGood = undefined
    t.ok(V.isUndefined(undefinedGood))
    t.strictSame(V.ensureIsUndefined(undefinedGood, 'test'), undefined) // no error returned
    t.ok(V.isUndefinedOrNull(undefinedGood))
    t.strictSame(V.ensureIsUndefinedOrNull(undefinedGood, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsDefinedAndNotNull(undefinedGood, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsUndefinedOrNull(undefinedGood), undefined) // no error returned
    t.strictSame(V.ensureIsDefinedAndNotNull(undefinedGood) instanceof Error, true) // expected error returned
    t.ok(!V.isObject(undefinedGood))
    t.ok(!V.isObjectPlain(undefinedGood))
    t.ok(V.ensureIsObject(undefinedGood, 'test')) // expected error returned
    t.ok(V.ensureIsObjectPlain(undefinedGood, 'test')) // expected error returned
    t.ok(V.ensureIsObject(undefinedGood)) // expected error returned
    t.ok(V.ensureIsObjectPlain(undefinedGood)) // expected error returned
    const undefinedBad = 'defined'
    t.ok(!V.isUndefined(undefinedBad))
    t.strictSame(V.ensureIsUndefined(undefinedBad, 'test') instanceof Error, true) // expected error returned
    t.ok(!V.isUndefinedOrNull(undefinedBad))
    t.strictSame(V.ensureIsUndefinedOrNull(undefinedBad, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsDefinedAndNotNull(undefinedBad, 'test'), undefined) // no error returned
  }

  {
    const nullGood = null
    t.ok(V.isNull(nullGood))
    t.strictSame(V.ensureIsNull(nullGood, 'test'), undefined) // no error returned
    t.ok(V.isUndefinedOrNull(nullGood))
    t.strictSame(V.ensureIsUndefinedOrNull(nullGood, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsDefinedAndNotNull(nullGood, 'test') instanceof Error, true) // expected error returned
    t.ok(!V.isObject(nullGood))
    t.ok(!V.isObjectPlain(nullGood))
    t.ok(V.ensureIsObject(nullGood, 'test')) // expected error returned
    t.ok(V.ensureIsObjectPlain(nullGood, 'test')) // expected error returned
    const nullBad = 'defined'
    t.ok(!V.isNull(nullBad))
    t.strictSame(V.ensureIsNull(nullBad, 'test') instanceof Error, true) // expected error returned
    t.ok(!V.isUndefinedOrNull(nullBad))
    t.strictSame(V.ensureIsUndefinedOrNull(nullBad, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsDefinedAndNotNull(nullBad, 'test'), undefined) // no error returned
  }

  {
    const errorGood = new Error('Sample error')
    t.ok(V.isError(errorGood))
    t.strictSame(V.ensureIsError(errorGood, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsError(errorGood), undefined) // no error returned
    t.ok(V.isObject(errorGood))
    t.ok(!V.isObjectPlain(errorGood))
    t.ok(!V.ensureIsObject(errorGood, 'error')) // no error returned
    t.ok(V.ensureIsObjectPlain(errorGood, 'error')) // expected error returned
    const errorBad = 'Error string'
    t.ok(!V.isError(errorBad))
    t.strictSame(V.ensureIsError(errorBad, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsError(errorBad) instanceof Error, true) // expected error returned
  }

  {
    const dateGood = new Date()
    t.ok(V.isDate(dateGood))
    t.strictSame(V.ensureIsDate(dateGood, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsDate(dateGood), undefined) // no error returned
    t.ok(V.isObject(dateGood))
    t.ok(!V.isObjectPlain(dateGood))
    t.ok(!V.ensureIsObject(dateGood, 'date')) // no error returned
    t.ok(V.ensureIsObjectPlain(dateGood, 'date')) // expected error returned
    const dateBad = Date.now()
    t.ok(!V.isDate(dateBad))
    t.strictSame(V.ensureIsDate(dateBad, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsDate(dateBad) instanceof Error, true) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionOrString(dateGood, 'date')) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionOrString(dateGood)) // expected error returned
    t.ok(V.ensureIsNumber(dateGood, 'date')) // expected error returned
    t.ok(!V.ensureIsNumber(dateGood.getTime(), 'number')) // no error returned
    t.ok(V.ensureIsNumber(dateGood)) // expected error returned
    t.ok(!V.ensureIsNumber(dateGood.getTime())) // no error returned
    t.ok(!V.ensureIsDatePast(dateGood, 'date')) // no error returned
    t.ok(!V.ensureIsDatePast(dateGood)) // no error returned
    t.ok(V.ensureIsDateFuture(dateGood, 'date')) // expected error returned
    t.ok(V.ensureIsDateFuture(dateGood)) // expected error returned
  }

  {
    const relGood = '1.0.0'
    t.ok(V.isVersion(relGood))
    t.strictSame(V.ensureIsVersion(relGood, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsVersion(relGood), undefined) // no error returned
    const relBad = 'a.b.c-d'
    t.ok(!V.isVersion(relBad))
    t.strictSame(V.ensureIsVersion(relBad, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsVersion(relBad) instanceof Error, true) // expected error returned
  }

  {
    const objectBad = 1234567890
    t.ok(V.isNumber(objectBad))
    t.ok(!V.isObject(objectBad))
    t.ok(V.ensureIsObjectOrCollection(objectBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollection(objectBad, 'error') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsObjectOrCollection(objectBad)) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollection(objectBad) instanceof Error, true) // expected error returned
  }

  {
    const objectGood = { name: 'Name', age: 100, note: null }
    t.ok(V.isObject(objectGood))
    t.ok(!V.isString(objectGood))
    t.ok(!V.ensureIsObjectOrCollection(objectGood, 'object')) // no error returned
    t.strictSame(V.ensureIsObjectOrCollection(objectGood, 'object') instanceof Error, false) // no error returned
    t.ok(!V.ensureIsObjectOrCollectionNotString(objectGood, 'object')) // no error returned
    t.ok(!V.ensureIsObjectOrCollectionOrString(objectGood, 'object')) // no error returned
    t.ok(V.isObject(objectGood))
    t.ok(V.isObjectPlain(objectGood))
    t.ok(!V.ensureIsObject(objectGood, 'object')) // no error returned
    t.ok(!V.ensureIsObjectPlain(objectGood, 'object')) // no error returned
  }

  {
    const objectAsStringGood = '{ name: "Name", age: 100, note: null }'
    t.ok(!V.isObject(objectAsStringGood))
    t.ok(V.isString(objectAsStringGood))
    t.ok(V.ensureIsObjectOrCollection(objectAsStringGood, 'string')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollection(objectAsStringGood, 'string') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionNotString(objectAsStringGood, 'object')) // expected error returned
    t.ok(!V.ensureIsObjectOrCollectionOrString(objectAsStringGood, 'object')) // no error returned
    t.ok(!V.isObject(objectAsStringGood))
    t.ok(!V.isObjectPlain(objectAsStringGood))
    t.ok(V.ensureIsObject(objectAsStringGood, 'string')) // expected error returned
    t.ok(V.ensureIsObjectPlain(objectAsStringGood, 'string')) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionNotString(objectAsStringGood)) // expected error returned
  }

  {
    const stringBad = 1234567890
    t.ok(!V.isString(stringBad))
    t.ok(!V.isStringNotEmpty(stringBad))
    t.ok(V.ensureIsString(stringBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsString(stringBad, 'error') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsStringNotEmpty(stringBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsStringNotEmpty(stringBad, 'error') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsString(stringBad)) // expected error returned
    t.strictSame(V.ensureIsString(stringBad) instanceof Error, true) // expected error returned
    t.ok(V.ensureIsStringNotEmpty(stringBad)) // expected error returned
    t.strictSame(V.ensureIsStringNotEmpty(stringBad) instanceof Error, true) // expected error returned
  }

  {
    const functionBad = '1234567890'
    t.ok(V.isString(functionBad))
    t.ok(!V.isFunction(functionBad))
    t.ok(V.ensureIsFunction(functionBad, 'error')) // expected error returned
    t.strictSame(V.ensureIsFunction(functionBad, 'error') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsFunction(functionBad)) // expected error returned
    t.strictSame(V.ensureIsFunction(functionBad) instanceof Error, true) // expected error returned
  }

  {
    const arrayGood = []
    t.ok(V.isArray(arrayGood))
    t.strictSame(V.ensureIsArray(arrayGood, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsArray(arrayGood), undefined) // no error returned
    t.ok(V.isObject(arrayGood))
    t.ok(!V.isObjectPlain(arrayGood))
    t.ok(!V.ensureIsObject(arrayGood, 'array')) // no error returned
    t.ok(V.ensureIsObjectPlain(arrayGood, 'array')) // expected error returned
    const arrayBad = {}
    const str = 'a string'
    t.ok(!V.isArray(arrayBad))
    t.strictSame(V.ensureIsArray(arrayBad, 'test') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionNotArray(arrayGood, 'array')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionNotArray({}, 'test'), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionOrArray(str, 'array')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArray(arrayGood, 'test'), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionNotArray(arrayGood)) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionNotArray({}), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionOrArrayNotValue(str, 'test')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArrayNotValue(arrayGood, 'array'), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionOrArray(str)) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArray(arrayGood), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionOrArrayNotValue(str)) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArrayNotValue(arrayGood), undefined) // no error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrValue(str), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionOrValue(Symbol('foo'), 'symbol')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrValue(str), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionOrValue(Symbol('foo'))) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionOrArrayOrValue(Symbol('foo'), 'symbol')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArrayOrValue(arrayGood, 'array'), undefined) // no error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArrayOrValue(str, 'test'), undefined) // no error returned
    t.ok(V.ensureIsObjectOrCollectionOrArrayOrValue(Symbol('foo'))) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArrayOrValue(arrayGood), undefined) // no error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrArrayOrValue(str), undefined) // no error returned
    t.strictSame(V.ensureIsValue(arrayGood, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsValue(str, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsValue(arrayGood) instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsValue(str), undefined) // no error returned
  }

  {
    const boolGood = true
    t.ok(V.isBoolean(boolGood))
    t.strictSame(V.ensureIsBoolean(boolGood, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsBoolean(boolGood), undefined) // no error returned
    const boolBad = 'false'
    t.ok(!V.isBoolean(boolBad))
    t.strictSame(V.ensureIsBoolean(boolBad, 'test') instanceof Error, true) // expected error returned
    t.ok(V.ensureIsObjectOrCollectionOrString(boolGood, 'boolean')) // expected error returned
    t.strictSame(V.ensureIsObjectOrCollectionOrString({}, 'test'), undefined) // no error returned
  }

  {
    const uriGood = 'http://localhost:3000/path/nested?param1=value1'
    t.ok(V.isURI(uriGood))
    t.strictSame(V.ensureIsURI(uriGood, null, 'test'), undefined) // no error returned
    t.strictSame(V.ensureIsURI(uriGood, null), undefined) // no error returned
    const uriBad = 'path/nested?param1=value1' // not relative nor absolute uri, so not a real uri string
    t.ok(!V.isURI(uriBad))
    t.strictSame(V.ensureIsURI(uriBad, null, 'test') instanceof Error, true) // expected error returned
    t.strictSame(V.ensureIsURI(uriBad, null) instanceof Error, true) // expected error returned
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

  t.end()
})

/** @test {Validator} */
test('ensure some (utility) functions are right', (t) => {
  const { CloudEventValidator: V } = require('../src/')
  t.ok(V)

  {
    const u = undefined
    const n = null
    const s = 'Sample string'
    const o = {}

    t.strictSame(V.getArgumentValue(), undefined) // no error returned
    t.strictSame(V.getArgumentValue(u), undefined)
    t.strictSame(V.getArgumentValue(n), null)
    t.strictSame(V.getArgumentValue(s), s)
    t.strictSame(V.getArgumentValue(o), {})

    t.strictSame(V.getArgumentName(), undefined) // no error returned
    t.strictSame(V.getArgumentName(u), undefined)
    t.strictSame(V.getArgumentName(n), undefined)
    t.strictSame(V.getArgumentName(s), '0') // not the right way to call it
    t.strictSame(V.getArgumentName(o), undefined) // not the right way to call it
    t.strictSame(V.getArgumentName({ u }), 'u')
    t.strictSame(V.getArgumentName({ n }), 'n')
    t.strictSame(V.getArgumentName({ s }), 's')

    t.strictSame(V.getOrElse(), undefined) // no error returned
    t.strictSame(V.getOrElse(u), undefined)
    t.strictSame(V.getOrElse(u, u), undefined)
    t.strictSame(V.getOrElse(u, n), null)
    t.strictSame(V.getOrElse(n), undefined)
    t.strictSame(V.getOrElse(n, u), undefined)
    t.strictSame(V.getOrElse(n, n), null)
    t.strictSame(V.getOrElse(s), s)
    t.strictSame(V.getOrElse(s, s), s)
    t.strictSame(V.getOrElse(s, o), s)
    t.strictSame(V.getOrElse(u, s), s)
    t.strictSame(V.getOrElse(n, s), s)
    t.strictSame(V.getOrElse(u, o), o)
    t.strictSame(V.getOrElse(n, o), o)
  }

  t.ok(V.isURI('protocol://sample'))
  t.notOk(V.isURI('sample'))

  t.end()
})

/** @test {Validator} */
test('ensure validation functions on object properties are right', (t) => {
  const { CloudEventValidator: V } = require('../src/')
  t.ok(V)

  t.ok(!V.doesObjectContainsProperty())
  t.ok(!V.doesObjectContainsProperty(undefined, undefined, undefined))
  t.ok(!V.doesObjectContainsProperty(null, null, null))
  t.ok(!V.doesObjectContainsProperty('no object')) // bad object
  t.ok(!V.doesObjectContainsProperty({}, 42)) // good object, bad property name
  t.ok(!V.doesObjectContainsProperty({}, 'property', 42)) // good object, good property name, bad flag
  t.ok(!V.doesObjectContainsProperty({}, 'property', true)) // all arguments fine, but no property found

  const obj = {}
  obj.property1 = 42
  t.ok(V.doesObjectContainsProperty(obj, 'property1', false))
  t.ok(V.doesObjectContainsProperty(obj, 'property1', true))
  t.ok(!V.doesObjectContainsProperty(obj, 'toString', false))
  t.ok(V.doesObjectContainsProperty(obj, 'toString', true))

  t.strictSame(V.ensureObjectContainsProperty(obj, 'property1', false, 'test object (obj)'), undefined) // no error returned
  t.strictSame(V.ensureObjectContainsProperty(obj, 'propertyMissing', false, 'test object (obj)') instanceof Error, true) // expected error returned
  t.strictSame(V.ensureObjectContainsProperty(obj, 'toString', false, 'test object (obj)') instanceof Error, true) // expected error returned
  t.strictSame(V.ensureObjectContainsProperty(obj, 'toString', true, 'test object (obj)'), undefined) // no error returned

  t.end()
})

/** @test {Validator} */
test('ensure validation functions on standard properties are right', (t) => {
  const { CloudEventValidator: V } = require('../src/')
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

  t.strictSame(V.ensureObjectDoesNotContainsStandardProperty({ property: 'value' }, isPropStandard, 'test'), undefined) // no error returned
  t.strictSame(V.ensureObjectDoesNotContainsStandardProperty({ standard: 'value' }, isPropStandard, 'test') instanceof Error, true) // expected error returned
  t.strictSame(V.ensureObjectDoesNotContainsStandardProperty({ property: 'value' }, isPropStandard), undefined) // no error returned
  t.strictSame(V.ensureObjectDoesNotContainsStandardProperty({ standard: 'value' }, isPropStandard) instanceof Error, true) // expected error returned

  t.end()
})

/** @test {Validator} */
test('ensure validation functions to filter bad object instances raise exceptions', (t) => {
  const { CloudEventValidator: V } = require('../src/')
  t.ok(V)

  // sample function that tell if the given property name is standard
  function isPropStandard (prop) {
    return prop === 'standard'
  }

  t.throws(function () {
    const objFiltered = V.getObjectFilteredProperties([], isPropStandard)
    assert(objFiltered !== null) // never executed
  }, Error, 'Expected exception when trying to filter not a plain object')
  t.throws(function () {
    const objFiltered = V.getObjectFilteredProperties({}, 'isPropStandard')
    assert(objFiltered !== null) // never executed
  }, Error, 'Expected exception when trying to filter a plain object but with a wrong filtering function')

  t.end()
})

/** @test {Validator} */
test('ensure validation functions to throw exceptions, works good', (t) => {
  const { CloudEventValidator: V } = require('../src/')
  t.ok(V)

  t.notOk(V.throwOnError()) // no error returned
  t.notOk(V.throwOnError(undefined)) // no error returned
  t.notOk(V.throwOnError(null)) // no error returned
  t.notOk(V.throwOnError({})) // no error returned
  t.throws(function () {
    V.throwOnError(new TypeError('Sample TypeError'))
    assert(false) // never executed
  }, Error, 'Expected exception when trying to throw from an Error')

  t.throws(function () {
    V.throwOnFalse()
    assert(false) // never executed
  }, Error, 'Expected exception when trying to throw from an undefined value')
  t.throws(function () {
    V.throwOnFalse(undefined)
    assert(false) // never executed
  }, Error, 'Expected exception when trying to throw from an undefined value')
  t.throws(function () {
    V.throwOnFalse(null)
    assert(false) // never executed
  }, Error, 'Expected exception when trying to throw from a null value')
  t.throws(function () {
    V.throwOnFalse({})
    assert(false) // never executed
  }, Error, 'Expected exception when trying to throw from a not boolean value')
  t.notOk(V.throwOnFalse(true)) // no error returned
  t.throws(function () {
    V.throwOnFalse(false)
    assert(false) // never executed
  }, Error, 'Expected exception when trying to throw from a false value')

  t.end()
})
