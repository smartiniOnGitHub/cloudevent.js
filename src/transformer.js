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
 * Transformers:
 * this module exports some useful generic functions for the transformation of objects.
 */

/**
 * Get a reference to cloudevent Validator class.
 * See {@link Validator}.
 * @private
 */
const V = require('./validator') // get validator from here

/**
 * Get the host name where this code is runninng.
 * @private
 */
const hostname = require('os').hostname()

/**
 * Get the process id (pid) where this code is runninng.
 * @private
 */
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
   * Note that instancing is not allowed for this class because all its methods are static.
   *
   * @throws {Error} instancing not allowed for this class
   * @hideconstructor
   */
  constructor () {
    throw new Error('Instancing not allowed for this class')
  }

  /**
   * Utility function that return a dump of the given object.
   *
   * @static
   * @param {(?object|Map|Set)} obj the object to dump
   * @param {string} [name='noname'] the name to assign in the returned string, or 'noname' as default value
   * @return {string} the dump of the object or a message when obj is undefined/null/not an object
   */
  static dumpObject (obj, name = 'noname') {
    if (V.isUndefined(obj)) {
      return `${name}:undefined`
    } else if (V.isNull(obj)) {
      return `${name}:null`
    } else if (V.isObject(obj) || V.isKeyedCollection(obj)) {
      return `${name}:${JSON.stringify(obj)}`
    } else {
      return `${name}:'${obj.toString()}'`
    }
  }

  /**
   * Utility function that parse a string representation
   * (compatible with the CloudEvent standard) of the given timestamp (Date)
   * and returns it (if possible).
   *
   * Note that the value returned could be adjusted with the current timezone offset.
   *
   * @static
   * @param {!string} obj the timestamp/date to parse (as a string)
   * @param {number} [timezoneOffset=0] a timezone offset to add (in msec, default 0)
   * @return {object} the parsed version, as a timestamp (Date) object, if possible
   * @throws {TypeError} if obj is undefined or null, or is not a string
   */
  static timestampFromString (obj, timezoneOffset = 0) {
    if (!V.isStringNotEmpty(obj)) {
      throw new TypeError(`Missing or wrong timestamp: '${obj}' must be a string and not a: '${typeof obj}'.`)
    }
    const timestampMsec = Date.parse(obj)
    return new Date(timestampMsec + timezoneOffset)
  }

  /**
   * Utility function that return a string representation
   * (compatible with the CloudEvent standard)
   * of the given timestamp (Date), or the current one will be used.
   *
   * Note that the value returned is in the UTC format.
   *
   * @static
   * @param {?object} obj the timestamp/date to convert, or the current one if not defined or null
   * @return {string} the string representation of the object
   * @throws {TypeError} if obj is undefined or null, or is not a Date instance
   */
  static timestampToString (obj) {
    let timestamp = obj
    if (V.isUndefinedOrNull(timestamp)) {
      timestamp = new Date()
    }
    if (!V.isDateValid(timestamp)) {
      throw new TypeError(`Missing or wrong timestamp: '${timestamp}' must be a date and not a: '${typeof timestamp}'.`)
    }
    return timestamp.toISOString()
  }

  /**
   * Utility function that parse a number representation
   * of the given timestamp (Date)
   * and returns it (if possible).
   *
   * Note that the value returned could be adjusted with the current timezone offset.
   *
   * @static
   * @param {!number} obj the timestamp/date to parse (as a number)
   * @param {number} [timezoneOffset=0] a timezone offset to add (in msec, default 0)
   * @return {object} the parsed version, as a timestamp (Date) object, if possible
   * @throws {TypeError} if obj is undefined or null, or is not a number
   */
  static timestampFromNumber (obj, timezoneOffset = 0) {
    if (!V.isNumber(obj)) {
      throw new TypeError(`Missing or wrong timestamp: '${obj}' must be a number and not a: '${typeof obj}'.`)
    }
    return new Date(obj + timezoneOffset)
  }

  /**
   * Utility function that return a number representation
   * of the given timestamp (Date), or the current one will be used.
   *
   * Note that the value returned is in the UTC format.
   *
   * @static
   * @param {?object} obj the timestamp/date to convert, or the current one if not defined or null
   * @return {number} the number representation of the object
   * @throws {TypeError} if obj is not a Date instance
   */
  static timestampToNumber (obj) {
    let timestamp = obj
    if (V.isUndefinedOrNull(timestamp)) {
      timestamp = new Date()
    }
    if (!V.isDateValid(timestamp)) {
      throw new TypeError(`Wrong timestamp: '${timestamp}' must be a date and not a: '${typeof timestamp}'.`)
    }
    return timestamp.getTime()
  }

  /**
   * Utility function that encodes a string
   * in base64 (compatible with the CloudEvent standard).
   *
   * @static
   * @param {?string} obj the string to encode, or '' if not defined or null
   * @return {string} the string encoded in base64
   * @throws {TypeError} if str is not a string instance
   */
  static stringToBase64 (obj) {
    let str = obj
    if (V.isUndefinedOrNull(obj)) {
      str = ''
    }
    if (!V.isString(str)) {
      throw new TypeError(`Missing or wrong argument: '${str}' must be a string and not a: '${typeof str}'.`)
    }
    return Buffer.from(str).toString('base64')
  }

  /**
   * Utility function that decodes a base64 string
   * into a normal string using 'utf8' encoding
   * (compatible with the CloudEvent standard).
   *
   * @static
   * @param {?string} obj the string to decode, or '' if not defined or null
   * @return {string} the string decoded from base64
   * @throws {TypeError} if str is not a string instance
   */
  static stringFromBase64 (obj) {
    let str = obj
    if (V.isUndefinedOrNull(obj)) {
      str = ''
    }
    if (!V.isString(str)) {
      throw new TypeError(`Missing or wrong argument: '${str}' must be a string and not a: '${typeof str}'.`)
    }
    return Buffer.from(str, 'base64').toString('utf8')
  }

  /**
   * Utility function that map an Error into an object
   * (compatible with the CloudEvent standard), to fill its 'data' attribute.
   *
   * @static
   * @param {!Error} err the Error to transform
   * @param {object} [options={}] transformation options:
   *        - includeStackTrace flag (default false) to add the StackTrace into the object to return,
   *        - addStatus flag (default true) to add a 'status' attribute into the object to return,
   *        - addTimestamp flag (default false) to add the current 'timestamp' as attribute into the object to return,
   * @return {object} the object representation of the error
   * @throws {TypeError} if err is undefined or null, or is not an Error instance
   */
  static errorToData (err, {
    includeStackTrace = false,
    addStatus = true,
    addTimestamp = false
  } = {}
  ) {
    if (!V.isError(err)) {
      throw new TypeError(`Missing or wrong argument: '${err}' must be an Error and not a: '${typeof err}'.`)
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

  /**
   * Utility function that strip all arguments (if any) from the given URI/URL string
   * and returns the string without them.
   *
   * @static
   * @param {!string} url the URI/URL (as a string)
   * @param {object} [options={}] containing: strict (boolean, default false) to check it in a more strict way
   * @return {string} the parsed version, but without arguments (if any)
   * @throws {TypeError} if url is undefined or null, or is not a string
   */
  static uriStripArguments (url, { strict = false } = {}) {
    if (!V.isString(url)) {
      throw new TypeError(`Missing or wrong URL: '${url}' must be a string and not a: '${typeof url}'.`)
    }
    if (strict === true) {
      if (!V.isURI(url)) {
        throw new TypeError(`Missing or wrong URL: '${url}'`)
      }
    }
    return url.split('?')[0]
  }

  /**
   * Utility function that merge the given objects (at least one base and another)
   * and returns the new one (but with the prototype of the first).
   *
   * @static
   * @param {!object} base the first object to merge
   * @param {object} others all other(s) object to merge (at least one)
   * @return {object} the new object
   * @throws {TypeError} if base is undefined or null, or is not an object
   */
  static mergeObjects (base, ...others) {
    if (!V.isObject(base)) {
      throw new TypeError(`Missing or wrong argument: '${base}' must be an object and not a: '${typeof base}'.`)
    }
    const baseProto = Object.getPrototypeOf(base)
    return Object.assign(Object.create(baseProto), base, ...others) // set the prototype of the first argument in the clone
  }
}

/**
 * Utility variable that returns the timezone offset value, in msec.
 *
 * @readonly
 * @type {number}
 * @static
 */
Transformer.timezoneOffsetMsec = new Date().getTimezoneOffset() * 60 * 1000

module.exports = Transformer
