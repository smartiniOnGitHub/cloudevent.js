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

// get a reference only to cloudevent class definition/s
const {
  CloudEvent,
  CloudEventValidator: V,
  CloudEventTransformer: T,
  JSONBatch
} = require('../src') // from local path
assert(CloudEvent !== null && V !== null && T !== null && JSONBatch !== null)

// get factory for instances to test, in its own source
const ceFactory = require('./common-example-factory')

// number of times to repeat each test
const numRun = 1_000
const numIntDigits = 3 // to align benchmark results: 2 or 3 is good for 1_000 iterations, 5 for 1_000_000

// definition of my simple benchmark runner
// arguments: benchmark name, number of repetitions,
// the function to run (that should return a value),
// a function to dump returned object (from the last benchmark run),
// a function to validate the returned object
function benchmarkRunner (name = '', repeat = 1, functionToRun = null, dumpResult = null, validateResult = null) {
  console.log(`Benchmark: '${name}', repeat ${repeat} times; start execution ...`)
  const startBenchmark = performance.now()
  // later check if wrap in a try/catch block ...
  let result

  const startMainFunction = performance.now()
  for (let i = 0; i < repeat; i++) {
    result = functionToRun()
  }
  const endMainFunction = performance.now()

  // validate last returned object
  const startValidation = performance.now()
  if (validateResult !== null) {
    let isValid
    for (let i = 0; i < repeat; i++) {
      isValid = validateResult(name, result)
    }
    const validationResults = CloudEvent.validateEvent(result)
    console.log(`Validation results (show only after last run): is valid: ${isValid} (${validationResults.length} errors), validation details:\n\t${validationResults}`)
  }
  const endValidation = performance.now()

  const endBenchmark = performance.now()

  // test last returned object and dump it
  // but not part of current performance count
  if (dumpResult !== null) {
    dumpResult(name, result)
  }

  // print results
  console.log('Benchmark partial results:')
  if (functionToRun !== null) {
    console.log(`\tMain function execution took:       ${formatNumber(endMainFunction - startMainFunction, numIntDigits)} msec`)
  }
  if (validateResult !== null) {
    console.log(`\tValidation function execution took: ${formatNumber(endValidation - startValidation, numIntDigits)} msec`)
  }
  console.log(`Benchmark: '${name}'; end. Execution took: ${formatNumber(endBenchmark - startBenchmark)} msec\n`)
}

// utility function to format numbers with the desired length and precision
// note that rounding could be applied
function formatNumber (num = 0, minIntDigits = 1) {
  const formatted = new Intl.NumberFormat([], {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3, // <- implicit rounding!
    minimumIntegerDigits: minIntDigits
    // style: 'unit',
    // unit: 'millisecond'
  }).format(num)
  return formatted
}

// generic function to dump created CloudEvent object
function dumpCE (name = '', ce) {
  // assert(ce !== null)
  if (ce !== null) {
    console.log(`Generated ce object (in the last run): is strict: ${CloudEvent.isStrictEvent(ce)}, dump:\n\t${T.dumpObject(ce, 'ce')}`)
  } else {
    console.log('Generated ce object (in the last run): null')
  }
}

// generic function to validate the given CloudEvent object using validation defaults
function validateCE (name = '', ce) {
  return CloudEvent.isValidEvent(ce)
}

// generic function to validate the given CloudEvent object but with no strict mode enabled
function validateCEInNoStrictMode (name = '', ce) {
  return CloudEvent.isValidEvent(ce, valOptionsNoStrict)
}

// generic function to validate the given CloudEvent object but with strict mode enabled
function validateCEInStrictMode (name = '', ce) {
  return CloudEvent.isValidEvent(ce, valOptionsStrict)
}

// start timer for the execution
const startTime = performance.now()

console.log('Sample script: start execution ...\n')
console.log(`Repeat each test: ${numRun} times`)
console.log(`Script file: ${__filename}`)

// call benchmark functions, repeated n times each one
let benchNum = 1
benchmarkRunner(`${benchNum++} - ce empty (not good for validation)`, numRun, ceFactory.createEmpty, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce empty (not good for validation, forced strict validation here)`, numRun, ceFactory.createEmpty, dumpCE, validateCEInStrictMode)
benchmarkRunner(`${benchNum++} - ce minimal (not good for validation)`, numRun, ceFactory.createMinimalMandatoryUndefinedNoStrict, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce minimal (good but not for strict validation)`, numRun, ceFactory.createMinimalBadSource, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce minimal (good but not for strict validation, used/forced here)`, numRun, ceFactory.createMinimalBadSource, dumpCE, validateCEInStrictMode)
benchmarkRunner(`${benchNum++} - ce minimal (good)`, numRun, ceFactory.createMinimal, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce minimal and strict (good)`, numRun, ceFactory.createMinimalStrict, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete (good)`, numRun, ceFactory.createFull, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete and strict (good)`, numRun, ceFactory.createFullStrict, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete with standard property in extensions (not good and not created)`, numRun, ceFactory.createFullStrictBadExtension, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete with text data (good)`, numRun, ceFactory.createFullTextData, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete with binary data ecoded in base64 (good)`, numRun, ceFactory.createFullBinaryData, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete with JSON data (good)`, numRun, ceFactory.createFullStrictJSONTextData, dumpCE, validateCE)
// TODO: check for a last test, on a ce instance with a long string as data ... wip

console.log('\nSample script: end execution.')

const endTime = performance.now()
console.log(`Total execution time: ${formatNumber(endTime - startTime)} msec, or ${formatNumber((endTime - startTime) / 1_000)} sec`)
console.log('----')
assert(true) // all good here
// end of script
