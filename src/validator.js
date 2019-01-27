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
 * Validators:
 * this module exports some useful generic functions for the validation of objects.
 */

const url = require('url')

/**
 * Generic Validator implementation.
 *
 * Note that all methods here are static, so no need to instance this class;
 * see it as an Utility/Companion class.
 */
class Validator {
  /**
   * Create a new instance of a Validator object.
   *
   * Note that instancing is not allowed for this class because all its methods are static.
   *
   * @throws {Error} because instancing not allowed for this class
   */
  constructor () {
    throw new Error(`Instancing not allowed for this class`)
  }

  /**
   * Gives a string valued property that is used in the creation of the default string description of an object.
   *
   * See {@link Symbol.toStringTag}.
   *
   * @return {string} a string representation of the object type
   */
  get [Symbol.toStringTag] () {
    return 'Validator'
  }

  /**
   * Tell if the given ergument is undefined.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if undefined, false otherwise
   */
  static isUndefined (arg) {
    return (arg === undefined)
  }

  /**
   * Tell if the given ergument is null.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if null, false otherwise
   */
  static isNull (arg) {
    return (arg === null)
  }

  /**
   * Tell if the given ergument is undefined or null.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if undefined or null, false otherwise
   */
  static isUndefinedOrNull (arg) {
    return (arg === undefined || arg === null)
  }

  /**
   * Tell if the given ergument is defined and not null.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if defined and not null, false otherwise
   */
  static isDefinedAndNotNull (arg) {
    return (arg !== undefined && arg !== null)
  }

  /**
   * Tell if the given ergument is a string.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a string, false otherwise
   */
  static isString (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (typeof arg === 'string'))
  }

  /**
   * Tell if the given ergument is a not empty string.
   *
   * See {@link Validator.isString}.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a not empty string, false otherwise
   */
  static isStringNotEmpty (arg) {
    return (Validator.isString(arg) && (arg.length > 0))
  }

  /**
   * Tell if the given ergument is a date.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a date, false otherwise
   */
  static isDate (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (typeof arg === 'object' || arg instanceof Date))
  }

  /**
   * Tell if the given ergument is a valid date.
   *
   * See {@link Validator.isDate}.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a valid date, false otherwise
   */
  static isDateValid (arg) {
    return (Validator.isDate(arg) && !isNaN(arg))
  }

  /**
   * Tell if the given ergument is a valid date and in the past.
   *
   * See {@link Validator.isDateValid}.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a valid date in the past, false otherwise
   */
  static isDatePast (arg) {
    return (Validator.isDateValid(arg) && arg < Date.now())
  }

  /**
   * Tell if the given ergument is a number.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a number, false otherwise
   */
  static isNumber (arg) {
    return (Validator.isDefinedAndNotNull(arg) && typeof arg === 'number' && !isNaN(arg))
  }

  /**
   * Tell if the given ergument is an array.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's an array, false otherwise
   */
  static isArray (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (Array.isArray(arg)))
  }

  /**
   * Tell if the given ergument is a boolean.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a boolean, false otherwise
   */
  static isBoolean (arg) {
    return (typeof arg === 'boolean')
  }

  /**
   * Tell if the given ergument is an instance of the given class reference.
   *
   * @static
   * @param {object} arg the object to check
   * @param {object} classReference the class that should be implemented/extended
   * @return {boolean} true if it's an instance (or extends) that class, false otherwise
   */
  static isClass (arg, classReference) {
    return (arg instanceof classReference)
  }

  /**
   * Tell if the given ergument is a function.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a function, false otherwise
   */
  static isFunction (arg) {
    return (typeof arg === 'function')
  }

  /**
   * Tell if the given ergument is an object.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's an object, false otherwise
   */
  static isObject (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (typeof arg === 'object'))
  }

  /**
   * Tell if the given ergument is a keyed collection.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's a Map|WeakMap or a Set|WeakSet, false otherwise
   */
  static isKeyedCollection (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (
      arg instanceof Map || arg instanceof WeakMap ||
      arg instanceof Set || arg instanceof WeakSet
    ))
  }

  /**
   * Tell if the given ergument is an object or a keyed collection.
   *
   * See {@link Validator.isObject}, {@link Validator.isKeyedCollection}.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's an object or a keyed collection, false otherwise
   */
  static isObjectOrCollection (arg) {
    return (Validator.isObject(arg) || Validator.isKeyedCollection(arg))
  }

  /**
   * Tell if the given ergument is an object or a keyed collection, but not a string.
   *
   * See {@link Validator.isObjectOrCollection}.
   *
   * @static
   * @param {object} arg the object to check
   * @return {boolean} true if it's an object or a keyed collection but not a string, false otherwise
   */
  static isObjectOrCollectionNotString (arg) {
    return (Validator.isObjectOrCollection(arg) && (typeof arg !== 'string'))
  }

  /**
   * Tell if the given ergument is a string representation of a version number.
   *
   * Note that the version string could be something like:
   * - as minimum a number is needed for an integer version
   * - at the beginning I can have an optional char 'v' or 'V'
   * - anything after the third number will be considered as a string
   * - format updated to handle version output of 'git describe'
   *
   * @static
   * @param {string} arg the version string to check
   * @return {boolean} true if it's a version string, false otherwise
   */
  static isVersion (arg) {
    // quick check if the given string is in the format 'n.n.n'
    const versionRegex = /^(?:v|V?)((\d+)(?:\.?)){1,3}(?:\W|_?)(.*)$/gm
    return (Validator.isStringNotEmpty(arg) && versionRegex.test(arg))
  }

  /**
   * Tell if the given ergument is an URI or an URL.
   *
   * @static
   * @param {string} arg the uri/url to check
   * @param {string} base the (optional) base to build the full URL
   * @return {boolean} true if it's an URI/URL, false otherwise
   */
  static isURI (arg, base) {
    // quick check if the given string is an URI or an URL
    if (!Validator.isStringNotEmpty(arg)) {
      return false
    }
    // simple check if it's an URL, trying to instancing it
    // note that this requires to import related module here (but not in Browsers) ...
    if (Validator.isStringNotEmpty(base)) {
      try {
        const u = new url.URL(arg, base)
        return (u !== null)
      } catch (e) {
        // console.error(e)
        return false
      }
    } else {
      // simple check if it's an URI (or better, a relative URL)
      if (arg.startsWith('/')) {
        return true
      }
      try {
        // return (new URL(arg) !== null)
        const u = new url.URL(arg)
        return (u !== null)
      } catch (e) {
        // console.error(e)
        return false
      }
    }
  }

  /**
   * Ensure that the given ergument is an instance of the given class reference.
   *
   * @static
   * @param {object} arg the object to check
   * @param {object} classReference the class that should be implemented/extended
   * @param {string} name the name to use in generated error (if any)
   * @return {TypeError} if it's not an instance (or extends) that class, nothing otherwise
   */
  static ensureIsClass (arg, classReference, name) {
    if (!Validator.isClass(arg, classReference)) {
      return new TypeError(`The argument '${name}' must be an instance of the given class reference, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given ergument is a function.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {TypeError} if it's not an instance (or extends) that class, nothing otherwise
   */
  static ensureIsFunction (arg, name) {
    if (!Validator.isFunction(arg)) {
      return new TypeError(`The argument '${name}' must be a function, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument ia a string.
   *
   * See {@link Validator.isString}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {TypeError} if it's not a string, nothing otherwise
   */
  static ensureIsString (arg, name) {
    if (!Validator.isString(arg)) {
      return new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument ia a not empty string.
   *
   * See {@link Validator.isStringNotEmpty}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {Error} if it's not a not empty string, nothing otherwise
   */
  static ensureIsStringNotEmpty (arg, name) {
    if (!Validator.isStringNotEmpty(arg)) {
      return new Error(`The string '${name}' must be not empty`)
    }
  }

  /**
   * Ensure that the given argument ia an object or a collection.
   *
   * See {@link Validator.isObjectOrCollection}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {TypeError} if it's not an object nor a collection, nothing otherwise
   */
  static ensureIsObjectOrCollection (arg, name) {
    if (!Validator.isObjectOrCollection(arg)) {
      return new TypeError(`The object '${name}' must be an object or a collection`)
    }
  }

  /**
   * Ensure that the given argument ia an object or a collection, not a string.
   *
   * See {@link Validator.isObjectOrCollectionNotString}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {TypeError} if it's not an object nor a collection, nothing otherwise
   */
  static ensureIsObjectOrCollectionNotString (arg, name) {
    if (!Validator.isObjectOrCollectionNotString(arg)) {
      return new TypeError(`The object '${name}' must be an object or a collection, and not a string`)
    }
  }

  /**
   * Ensure that the given argument ia a date.
   *
   * See {@link Validator.isDate}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {Error} if it's not a date, nothing otherwise
   */
  static ensureIsDate (arg, name) {
    if (!Validator.isDate(arg)) {
      return new Error(`The object '${name}' must be a Date`)
    }
  }

  /**
   * Ensure that the given argument ia a date in the past.
   *
   * See {@link Validator.isDatePast}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {Error} if it's not a date in the past, nothing otherwise
   */
  static ensureIsDatePast (arg, name) {
    if (!Validator.isDatePast(arg)) {
      return new Error(`The object '${name}' must be a Date that belongs to the past`)
    }
  }

  /**
   * Ensure that the given argument ia a string version.
   *
   * See {@link Validator.isVersion}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {Error} if it's not a string version, nothing otherwise
   */
  static ensureIsVersion (arg, name) {
    if (!Validator.isVersion(arg)) {
      return new Error(`The object '${name}' must be a string in the format 'n.n.n', and not '${arg}'`)
    }
  }

  /**
   * Ensure that the given argument ia an URI/URL.
   *
   * See {@link Validator.isURI}.
   *
   * @static
   * @param {object} arg the object to check
   * @param {string} name the name to use in generated error (if any)
   * @return {Error} if it's not an URI/URL, nothing otherwise
   */
  static ensureIsURI (arg, name) {
    if (!Validator.isURI(arg)) {
      return new Error(`The object '${name}' must be an URI or URL string, and not '${arg}'`)
    }
  }

  /**
   * Tell the size of the given aobject
   *
   * @static
   * @param {object} arg the object to check
   * @return {number} the size if it's an array|Map|Set|object|string, nothing otherwise
   */
  static getSize (arg) {
    if ((arg === undefined || arg === null)) {
      return
    }
    if (Array.isArray(arg)) {
      return arg.length
    } else if (arg instanceof Map || arg instanceof Set) {
      return arg.size
    } else if (typeof arg === 'object') {
      return Object.keys(arg).length
    } else if (typeof arg === 'string') {
      return arg.length
    }
  }
}

module.exports = Validator
