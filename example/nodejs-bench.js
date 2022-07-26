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

/**
 * Node.js script to perform some simple benchmarks of the CloudEvent library
 */

const assert = require('node:assert').strict
const { performance } = require('node:perf_hooks')

// import some common example data
const {
  // commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonOptionsForTextData,
  ceCommonExtensions,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded
} = require('./common-example-data')

// definition of my simple benchmark runner
// arguments: benchmark name, number of repetitions,
// the function to run (that should return a value),
// a function to dump returned object (from the last benchmark run),
// a function to validate the returned object
function benchmarkRunner (name = '', repeat = 1, functionToRun = null, dumpResult = null, validateResult = null) {
  console.log(`Benchmark: '${name}', repeat ${repeat} times; start execution ...`)
  const start = performance.now()
  // later check if wrap in a try/catch block ...
  let result
  for (let i = 0; i < repeat; i++) {
    result = functionToRun()
  }
  const end = performance.now()
  // test last returned object and dump it
  // but not part of local performance count
  if (dumpResult !== null) {
    dumpResult(name, result)
  }
  // validate last returned object
  // but not part of local performance count
  if (validateResult !== null) {
    validateResult(name, result)
  }
  console.log(`Benchmark: '${name}'; end execution (took ${end - start} msec) \n`)
}

// generic function to dump created CloudEvent object
function dumpCE (name = '', ce) {
  assert(ce !== null)
  console.log(`Generated ce object (in the last run): is strict: ${CloudEvent.isStrictEvent(ce)}, dump:\n${T.dumpObject(ce, 'ce')}`)
}

// generic function to validate the given CloudEvent object and print info/results
function validateCE (name = '', ce) {
  assert(ce !== null)
  console.log(`Validate generated ce object (in the last run): is valid: ${CloudEvent.isValidEvent(ce)}, validation details:\n${CloudEvent.validateEvent(ce)}`)
}

// definition of test functions
function createEmpty () {
  const ce = new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
  // assert(ce !== null)
  return ce
}

function createMinimalMandatoryUndefinedNoStrict () {
  const ce = new CloudEvent(undefined, undefined, undefined, undefined, { strict: false }) // expected success
  return ce
}

// number of times to repeat each test
const numRun = 1_000_000

const startTime = performance.now()

console.log('Sample script: start execution ...\n')
console.log(`Repeat each test: ${numRun} times`)
console.log(`Script file: ${__filename}`)

// get a reference only to cloudevent class definition/s
const {
  CloudEvent,
  CloudEventValidator: V,
  CloudEventTransformer: T,
  JSONBatch
} = require('../src') // from local path
assert(CloudEvent !== null && V !== null && T !== null && JSONBatch !== null)

// call benchmark functions, repeated n times each one
benchmarkRunner('ce empty (not good for validation)', numRun, createEmpty, dumpCE, validateCE)
benchmarkRunner('ce minimal (not good for validation)', numRun, createMinimalMandatoryUndefinedNoStrict, dumpCE, validateCE)
// TODO: others ... wip

console.log('\nSample script: end execution.')

const endTime = performance.now()
console.log(`Total execution time: ${(endTime - startTime) / 1_000} sec`)
console.log('----')
assert(true) // all good here
// end of script
