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

// get some common example/utility data
const {
  valOptionsNoStrict,
  valOptionsStrict
} = require('./common-example-data')

// number of times to repeat each test
const numRun = 1_000
const numIntDigits = 3 // to align benchmark results: 2 or 3 is good for 1_000 iterations, 5 for 1_000_000

// definition of my simple benchmark runner
// arguments: benchmark name, number of repetitions,
// the function to run (that should return a value),
// a function to dump returned object (from the last benchmark run),
// a function to validate the returned object,
// a function to serialize the returned object,
// a function to deserialize the returned object
// in future consider to use an array (or a map) of functions to generalize its signature (at least for optional functions)
function benchmarkRunner (name = '', repeat = 1, functionToRun = null, 
  dumpResult = null, validateResult = null,
  serializeResult = null, deserializeResult = null
) {
  console.log(`Benchmark: '${name}', repeat ${repeat} times; start execution ...`)
  const startBenchmark = performance.now()

  let result

  const startMainFunction = performance.now()
  for (let i = 0; i < repeat; i++) {
    result = functionToRun()
  }
  const endMainFunction = performance.now()
  // now process only last returned object

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

  // serialize last returned object
  const startSerialization = performance.now()
  let ser // must be visible even to next phase
  if (serializeResult !== null) {
    for (let i = 0; i < repeat; i++) {
      ser = serializeResult(name, result)
    }
    console.log(`Serialization results (show only after last run): dump: <omitted>`)
  }
  const endSerialization = performance.now()

  // deserialize last returned object
  const startDeserialization = performance.now()
  if (deserializeResult !== null) {
    let deser
    for (let i = 0; i < repeat; i++) {
      deser = deserializeResult(name, ser)
    }
    console.log(`Deserialization results (show only after last run): dump: <omitted>`)
  }
  const endDeserialization = performance.now()

  const endBenchmark = performance.now()

  // test last returned object and dump it
  // but not part of current performance count
  if (dumpResult !== null) {
    dumpResult(name, result)
  }

  // print results
  console.log('Benchmark partial results:')
  if (functionToRun !== null) {
    console.log(`\tMain function execution took:            ${formatNumber(endMainFunction - startMainFunction, numIntDigits)} msec`)
  }
  if (validateResult !== null) {
    console.log(`\tValidation function execution took:      ${formatNumber(endValidation - startValidation, numIntDigits)} msec`)
  }
  if (serializeResult !== null) {
    console.log(`\tSerialization function execution took:   ${formatNumber(endSerialization - startSerialization, numIntDigits)} msec`)
  }
  if (deserializeResult !== null) {
    console.log(`\tDeserialization function execution took: ${formatNumber(endDeserialization - startDeserialization, numIntDigits)} msec`)
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

// generic function to dump the given CloudEvent object
function dumpCE (name = '', ce) {
  // assert(ce !== null)
  const msg = 'Generated ce object (in the last run):' // + ((name.length > 0) ? ` name:'${name}'`: '')
  if (ce !== null) {
    console.log(`${msg} is strict: ${CloudEvent.isStrictEvent(ce)}, dump:\n\t${T.dumpObject(ce, 'ce')}`)
  } else {
    console.log(`${msg} null`)
  }
}

// generic function to does a simplified dump of the given CloudEvent object
function dumpSummaryOfCE (name = '', ce) {
  const msg = 'Generated ce object (in the last run):' // + ((name.length > 0) ? ` name:'${name}'`: '')
  if (ce !== null) {
    console.log(`${msg} is strict: ${CloudEvent.isStrictEvent(ce)}, dump:\n\t${ce.toString()}`)
  } else {
    console.log(`${msg} null`)
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

// generic function to serialize the given CloudEvent object
function serializeCE (name = '', ce) {
  return CloudEvent.serializeEvent(ce)
}

// generic function to deserialize the given CloudEvent object
function deserializeCE (name = '', ce) {
  return CloudEvent.deserializeEvent(ce)
}

// ----
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
benchmarkRunner(`${benchNum++} - ce complete (good, validated using default mode so no strict here, serialized, deserialized)`, numRun, ceFactory.createFull, dumpCE, validateCE, serializeCE, deserializeCE)
benchmarkRunner(`${benchNum++} - ce complete (good, but validated in strict mode, serialized, deserialized)`, numRun, ceFactory.createFull, dumpCE, validateCEInStrictMode, serializeCE, deserializeCE)
benchmarkRunner(`${benchNum++} - ce complete and strict (good, validated using default mode so strict here, serialized, deserialized)`, numRun, ceFactory.createFullStrict, dumpCE, validateCE, serializeCE, deserializeCE)
benchmarkRunner(`${benchNum++} - ce complete and strict (good, but validated in no strict mode, serialized, deserialized)`, numRun, ceFactory.createFullStrict, dumpCE, validateCEInNoStrictMode, serializeCE, deserializeCE)
benchmarkRunner(`${benchNum++} - ce complete with standard property in extensions (not good and not created)`, numRun, ceFactory.createFullStrictBadExtension, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete with text data (good)`, numRun, ceFactory.createFullTextData, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete with binary data ecoded in base64 (good)`, numRun, ceFactory.createFullBinaryData, dumpCE, validateCE)
benchmarkRunner(`${benchNum++} - ce complete and strict with JSON data (good, but validated in no strict mode, serialized, deserialized)`, numRun, ceFactory.createFullStrictJSONTextData, dumpCE, validateCEInNoStrictMode, serializeCE, deserializeCE)
benchmarkRunner(`${benchNum++} - ce complete and strict with JSON data (good, validated using default mode so strict here, serialized, deserialized)`, numRun, ceFactory.createFullStrictJSONTextData, dumpCE, validateCE, serializeCE, deserializeCE)
benchmarkRunner(`${benchNum++} - ce complete with a big text as data (good, validated using default mode so no strict here, serialized, deserialized)`, numRun, ceFactory.createFullBigStringData, dumpSummaryOfCE, validateCE, serializeCE, deserializeCE) // to not clutter the log, do a summary dump here
benchmarkRunner(`${benchNum++} - ce complete with a big text as data (good, validated in strict mode, serialized, deserialized)`, numRun, ceFactory.createFullBigStringData, dumpSummaryOfCE, validateCEInStrictMode, serializeCE, deserializeCE) // to not clutter the log, do a summary dump here

console.log('\nSample script: end execution.')

const endTime = performance.now()
console.log(`Total execution time: ${formatNumber(endTime - startTime)} msec, or ${formatNumber((endTime - startTime) / 1_000)} sec`)
console.log('----')
assert(true) // all good here
// end of script
