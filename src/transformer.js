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

/**
 * Transformers:
 * this module exports some useful generic functions for the transformation of objects.
 */

/**
 * Get a reference to cloudevent Validator class.
 *
 * See {@link Validator}.
 */
const V = require('./validator') // get validator from here

/** Get the host name where this code is runninng */
const hostname = require('os').hostname()

/** Get the process id (pid) where this code is runninng */
const pid = require('process').pid

/**
 * Useful Transformations for CloudEvent objects.
 *
 * Note that all methods here are static, so no need to instance this class;
 * see it as an Utility/Companion class.
 */
class Transformer {
  /**
   * Create a new instance of a Transformer object.
   *
   * Note that instancing is not allowed for this class because all its methods are static.
   *
   * @throws {Error} because instancing not allowed for this class
   */
  constructor () {
    throw new Error(`Instancing not allowed for this class`)
  }

  /**
   * Utility function that return a dump of the given object.
   *
   * @static
   * @param {(object|Map|Set)} obj the object to dump
   * @param {string} name the name to assign in the returned string
   * @return {string} the dump of the object or a message when obj is undefined/null/not an object
   */
  static dumpObject (obj, name) {
    const n = name || 'noname'
    if (V.isUndefined(obj)) {
      return `${n}: undefined`
    } else if (V.isNull(obj)) {
      return `${n}: null`
    } else if (!V.isObjectOrCollection(obj)) {
      return `${n}: '${obj.toString()}'`
    } else {
      return `${n}: ${JSON.stringify(obj)}`
    }
  }

  /**
   * Utility function that returns the timezone offset value, in msec.
   *
   * @static
   * @return {number} the timezone offset, in msec
   */
  static get timezoneOffsetMsec () {
    return new Date().getTimezoneOffset() * 60 * 1000
  }

  /**
   * Utility function that parse a string representation
   * (compatible with the CloudEvent standard) of the given timestamp (Date)
   * and returns it (if possible).
   *
   * Note that the value returned has already been adjusted with the current timezone offset.
   *
   * @static
   * @param {!string} obj the timestamp/date to parse (as a string)
   * @return {object} the parsed version, as a timestamp (Date) object, if possible
   * @throws {Error} if obj is undefined or null, or is not a string
   */
  static timestampFromString (obj) {
    if (!V.isStringNotEmpty(obj)) {
      throw new Error(`Missing or wrong timestamp: '${obj}' must be a string and not a: '${typeof obj}'.`)
    }
    const timestampMsec = Date.parse(obj)
    return new Date(timestampMsec + Transformer.timezoneOffsetMsec)
  }

  /**
   * Utility function that return a string representation
   * (compatible with the CloudEvent standard) of the given timestamp (Date).
   *
   * Note that the value returned is in the UTC format.
   *
   * @static
   * @param {!object} obj the timestamp/date to convert
   * @return {string} the string representation of the object
   * @throws {Error} if obj is undefined or null, or is not a Date instance
   */
  static timestampToString (obj) {
    if (!V.isDateValid(obj)) {
      throw new Error(`Missing or wrong timestamp: '${obj}' must be a date and not a: '${typeof obj}'.`)
    }
    return obj.toISOString()
  }

  /**
   * Utility function that parse a number representation
   * of the given timestamp (Date)
   * and returns it (if possible).
   *
   * Note that the value returned has already been adjusted with the current timezone offset.
   *
   * @static
   * @param {!number} obj the timestamp/date to parse (as a number)
   * @return {object} the parsed version, as a timestamp (Date) object, if possible
   * @throws {Error} if obj is undefined or null, or is not a number
   */
  static timestampFromNumber (obj) {
    if (!V.isNumber(obj)) {
      throw new Error(`Missing or wrong timestamp: '${obj}' must be a number and not a: '${typeof obj}'.`)
    }
    return new Date(obj + Transformer.timezoneOffsetMsec)
  }

  /**
   * Utility function that return a number representation
   * of the given timestamp (Date), or the current one will be used.
   *
   * Note that the value returned is in the UTC format.
   *
   * @static
   * @param {object} obj the timestamp/date to convert, or the current one
   * @return {number} the number representation of the object
   * @throws {Error} if obj is not a Date instance
   */
  static timestampToNumber (obj) {
    let timestamp = obj
    if (V.isUndefinedOrNull(timestamp)) {
      timestamp = new Date()
    }
    if (!V.isDateValid(timestamp)) {
      throw new Error(`Wrong timestamp: '${timestamp}' must be a date and not a: '${typeof timestamp}'.`)
    }
    return timestamp.getTime()
  }

  /**
   * Utility function that map an Error into an object
   * (compatible with the CloudEvent standard), to fill its 'data' attribute.
   *
   * @static
   * @param {!Error} err the Error to transform
   * @param {object} options transformation options:
   *        includeStackTrace flag (default false) to add the StackTrace into the object to return,
   *        addStatus flag (default true) to add a 'status' attribute into the object to return,
   *        addTimestamp flag (default false) to add the current 'timestamp' as attribute into the object to return,
   * @return {object} the object representation of the error
   * @throws {Error} if err is undefined or null, or is not an Error instance
   */
  static errorToData (err, {
    includeStackTrace = false,
    addStatus = true,
    addTimestamp = false
  } = {}
  ) {
    if (!V.isError(err)) {
      throw new Error(`Missing or wrong argument: '${err}' must be an Error and not a: '${typeof err}'.`)
    }
    const data = {
      name: err.name,
      message: err.message,
      stack: (includeStackTrace === true) ? err.stack : null
    }
    if (V.isDefinedAndNotNull(err.code)) {
      data.code = err.code
    }
    if (addStatus === true) {
      data.status = 'error'
    }
    if (addTimestamp === true) {
      data.timestamp = Date.now()
    }
    return data
  }

  /**
   * Utility function that get some process-related info and wrap into an object
   * (compatible with the CloudEvent standard), to fill its 'data' attribute.
   *
   * @static
   * @return {object} the object representation of process-related info data
   */
  static processInfoToData () {
    return {
      hostname: hostname,
      pid: pid
    }
  }
}

module.exports = Transformer
