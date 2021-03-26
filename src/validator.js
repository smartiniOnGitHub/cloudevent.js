/*
 * Copyright 2018-2021 the original author or authors.
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

/**
 * Get a reference to Node.js url module.
 * @private
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
   * Note that instancing is not allowed for this class because all its methods are static.
   *
   * @throws {Error} instancing not allowed for this class
   * @hideconstructor
   */
  constructor () {
    throw new Error('Instancing not allowed for this class')
  }

  /**
   * Tell if the given argument is undefined.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if undefined, false otherwise
   */
  static isUndefined (arg) {
    return (arg === undefined)
  }

  /**
   * Tell if the given argument is null.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if null, false otherwise
   */
  static isNull (arg) {
    return (arg === null)
  }

  /**
   * Tell if the given argument is undefined or null.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if undefined or null, false otherwise
   */
  static isUndefinedOrNull (arg) {
    return (arg === undefined || arg === null)
  }

  /**
   * Tell if the given argument is defined and not null.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if defined and not null, false otherwise
   */
  static isDefinedAndNotNull (arg) {
    return (arg !== undefined && arg !== null)
  }

  /**
   * Tell if the given argument is a string.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a string, false otherwise
   */
  static isString (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (typeof arg === 'string'))
  }

  /**
   * Tell if the given argument is a not empty string.
   *
   * See {@link Validator.isString}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a not empty string, false otherwise
   */
  static isStringNotEmpty (arg) {
    return (Validator.isString(arg) && (arg.length > 0))
  }

  /**
   * Tell if the given argument is a date.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a date, false otherwise
   */
  static isDate (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (typeof arg === 'object' || arg instanceof Date))
  }

  /**
   * Tell if the given argument is a valid date.
   *
   * See {@link Validator.isDate}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a valid date, false otherwise
   */
  static isDateValid (arg) {
    return (Validator.isDate(arg) && !isNaN(arg))
  }

  /**
   * Tell if the given argument is a valid date and in the past or now.
   *
   * See {@link Validator.isDateValid}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a valid date in the past (or now), false otherwise
   */
  static isDatePast (arg) {
    return (Validator.isDateValid(arg) && arg.getTime() <= Date.now())
  }

  /**
   * Tell if the given argument is a valid date and in the future or now.
   *
   * See {@link Validator.isDateValid}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a valid date in the future (or now), false otherwise
   */
  static isDateFuture (arg) {
    return (Validator.isDateValid(arg) && arg.getTime() > Date.now())
  }

  /**
   * Tell if the given argument is a number.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a number, false otherwise
   */
  static isNumber (arg) {
    return (Validator.isDefinedAndNotNull(arg) && typeof arg === 'number' && !isNaN(arg))
  }

  /**
   * Tell if the given argument is an array.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's an array, false otherwise
   */
  static isArray (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (Array.isArray(arg)))
  }

  /**
   * Tell if the given argument is a normal value
   * (string or boolean or number).
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a string or boolean or number, false otherwise
   */
  static isValue (arg) {
    return (Validator.isDefinedAndNotNull(arg) &&
      (Validator.isString(arg) || Validator.isBoolean(arg) || Validator.isNumber(arg))
    )
  }

  /**
   * Tell if the given argument is a boolean.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a boolean, false otherwise
   */
  static isBoolean (arg) {
    return (typeof arg === 'boolean')
  }

  /**
   * Tell if the given argument is an instance of the given class reference.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {?object} classReference the class that should be implemented/extended
   * @return {boolean} true if it's an instance (or extends) that class, false otherwise
   */
  static isClass (arg, classReference) {
    return (arg instanceof classReference)
  }

  /**
   * Tell if the given argument is an error.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's an error, false otherwise
   */
  static isError (arg) {
    return (arg instanceof Error && typeof arg.message !== 'undefined')
  }

  /**
   * Tell if the given argument is a function.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a function, false otherwise
   */
  static isFunction (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (typeof arg === 'function'))
  }

  /**
   * Tell if the given argument is an object
   * and is defined and not null.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's an object, false otherwise
   */
  static isObject (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (typeof arg === 'object'))
  }

  /**
   * Tell if the given argument is a plain object
   * and not: undefined, null, Array, Date, Number, String,
   * Symbol, Map/WeakMap, Set/WeakSet, etc.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object, false otherwise
   */
  static isObjectPlain (arg) {
    return (Object.prototype.toString.call(arg) === '[object Object]')
  }

  /**
   * Tell if the given argument is a keyed collection.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a Map|WeakMap or a Set|WeakSet, false otherwise
   */
  static isKeyedCollection (arg) {
    return (Validator.isDefinedAndNotNull(arg) && (
      arg instanceof Map || arg instanceof WeakMap ||
      arg instanceof Set || arg instanceof WeakSet
    ))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection.
   *
   * See {@link Validator.isObject}, {@link Validator.isKeyedCollection}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection, false otherwise
   */
  static isObjectOrCollection (arg) {
    return (Validator.isObjectPlain(arg) || Validator.isKeyedCollection(arg))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection, but not an array.
   *
   * See {@link Validator.isObjectOrCollection}.
   * See {@link Validator.isArray}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection but not an array, false otherwise
   */
  static isObjectOrCollectionNotArray (arg) {
    return (Validator.isObjectOrCollection(arg) && !Validator.isArray(arg))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection or an array.
   *
   * See {@link Validator.isObjectOrCollection}.
   * See {@link Validator.isArray}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection or an array, false otherwise
   */
  static isObjectOrCollectionOrArray (arg) {
    return (Validator.isObjectOrCollection(arg) || Validator.isArray(arg))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection, but not a string.
   *
   * See {@link Validator.isObjectOrCollection}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection but not a string, false otherwise
   */
  static isObjectOrCollectionNotString (arg) {
    return (Validator.isObjectOrCollection(arg) && (typeof arg !== 'string'))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection or an array,
   * but not a value (string or boolean or number).
   *
   * See {@link Validator.isObjectOrCollection}.
   * See {@link Validator.isArray}.
   * See {@link Validator.isValue}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection or an array but not a value (string or boolean or number), false otherwise
   */
  static isObjectOrCollectionOrArrayNotValue (arg) {
    return ((Validator.isObjectOrCollection(arg) || Validator.isArray(arg)) && !Validator.isValue(arg))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection, or a string.
   *
   * See {@link Validator.isObjectOrCollection}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection or a string, false otherwise
   */
  static isObjectOrCollectionOrString (arg) {
    return (Validator.isObjectOrCollection(arg) || (typeof arg === 'string'))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection,
   * or a value (string or boolean or number).
   *
   * See {@link Validator.isObjectOrCollection}.
    * See {@link Validator.isValuey}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection or a value (string or boolean or number), false otherwise
   */
  static isObjectOrCollectionOrValue (arg) {
    return (Validator.isObjectOrCollection(arg) || Validator.isValue(arg))
  }

  /**
   * Tell if the given argument is a plain object or a keyed collection or an array,
   * or a value (string or boolean or number).
   *
   * See {@link Validator.isObjectOrCollection}.
   * See {@link Validator.isArray}.
   * See {@link Validator.isValuey}.
   *
   * @static
   * @param {?object} arg the object to check
   * @return {boolean} true if it's a plain object or a keyed collection or an array or a value (string or boolean or number), false otherwise
   */
  static isObjectOrCollectionOrArrayOrValue (arg) {
    return (Validator.isObjectOrCollection(arg) || Validator.isArray(arg) || Validator.isValue(arg))
  }

  /**
   * Tell if the given argument is a string representation of a version number.
   *
   * Note that the version string could be something like:
   * - as minimum a number is needed for an integer version
   * - at the beginning I can have an optional char 'v' or 'V'
   * - anything after the third number will be considered as a string
   * - format updated to handle version output of 'git describe'
   *
   * @static
   * @param {?string} arg the version string to check
   * @return {boolean} true if it's a version string, false otherwise
   */
  static isVersion (arg) {
    // quick check if the given string is in the format 'n.n.n'
    const versionRegex = /^(?:v|V?)((\d+)(?:\.?)){1,3}(?:\W|_?)(.*)$/gm
    return (Validator.isStringNotEmpty(arg) && versionRegex.test(arg))
  }

  /**
   * Tell if the given argument is an URI or an URL.
   *
   * @static
   * @param {?string} arg the uri/url to check
   * @param {?string} base the (optional) base to build the full URL
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
      // simple check if it's an URI (or better: a relative URL, or a full URI with scheme etc)
      const uriRegex = /^(\w+:|\/)/ // or /^(\w+:|\/)(.*)$/ for full match
      if (uriRegex.test(arg)) {
        return true
      }
      try {
        const u = new url.URL(arg)
        return (u !== null)
      } catch (e) {
        // console.error(e)
        return false
      }
    }
  }

  /**
   * Tell if the given object contains at least one property
   * that has a standard (reserved) property name.
   *
   * @static
   * @param {?object} obj the object to check
   * @param {?function} isPropStandard the function that tell the given argument (property), if it's standard
   * @return {boolean} true if at least one property with a standard name is found, otherwise false
   */
  static doesObjectContainsStandardProperty (obj, isPropStandard) {
    if (!Validator.isObject(obj)) return false
    if (!Validator.isFunction(isPropStandard)) return false
    let standardPropFound = false
    for (const prop in obj) {
      if (isPropStandard(prop) === true) {
        standardPropFound = true
        break
      }
    }
    return standardPropFound
  }

  /**
   * Tell if the given string has a standard (reserved) property name.
   *
   * @static
   * @param {?string} str the string to check
   * @param {?function} isPropStandard the function that tell the given argument (property), if it's standard
   * @return {boolean} true if the given string has a standard name, otherwise false
   */
  static doesStringIsStandardProperty (str, isPropStandard) {
    if (!Validator.isStringNotEmpty(str)) return false
    if (!Validator.isFunction(isPropStandard)) return false
    let standardPropFound = false
    if (isPropStandard(str) === true) {
      standardPropFound = true
    }
    return standardPropFound
  }

  /**
   * Ensure that the given argument is undefined.
   *
   * See {@link Validator.isUndefined}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not undefined, nothing otherwise
   */
  static ensureIsUndefined (arg, name = 'arg') {
    if (!Validator.isUndefined(arg)) {
      return new TypeError(`The argument '${name}' must be undefined, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is null.
   *
   * See {@link Validator.isNull}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not null, nothing otherwise
   */
  static ensureIsNull (arg, name = 'arg') {
    if (!Validator.isNull(arg)) {
      return new TypeError(`The argument '${name}' must be null, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is undefined or null.
   *
   * See {@link Validator.isUndefinedOrNull}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not undefined or null, nothing otherwise
   */
  static ensureIsUndefinedOrNull (arg, name = 'arg') {
    if (!Validator.isUndefinedOrNull(arg)) {
      return new TypeError(`The argument '${name}' must be undefined or null, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is defined and not null.
   *
   * See {@link Validator.isDefinedAndNotNull}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not undefined or null, nothing otherwise
   */
  static ensureIsDefinedAndNotNull (arg, name = 'arg') {
    if (!Validator.isDefinedAndNotNull(arg)) {
      return new TypeError(`The argument '${name}' must be defined and not null, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is an array.
   *
   * See {@link Validator.isArray}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not an array, nothing otherwise
   */
  static ensureIsArray (arg, name = 'arg') {
    if (!Validator.isArray(arg)) {
      return new TypeError(`The argument '${name}' must be an array, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a value (string or boolean or number).
   *
   * See {@link Validator.isValue}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a string or a boolean or a number, nothing otherwise
   */
  static ensureIsValue (arg, name = 'arg') {
    if (!Validator.isValue(arg)) {
      return new TypeError(`The argument '${name}' must be a value (string or boolean or number), instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a boolean.
   *
   * See {@link Validator.isBoolean}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a boolean, nothing otherwise
   */
  static ensureIsBoolean (arg, name = 'arg') {
    if (!Validator.isBoolean(arg)) {
      return new TypeError(`The argument '${name}' must be a boolean, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is an instance of the given class reference.
   *
   * See {@link Validator.isClass}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {?object} classReference the class that should be implemented/extended
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not an instance (or extends) that class, nothing otherwise
   */
  static ensureIsClass (arg, classReference, name = 'arg') {
    if (!Validator.isClass(arg, classReference)) {
      return new TypeError(`The argument '${name}' must be an instance of the given class reference, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a function.
   *
   * See {@link Validator.isFunction}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a function, nothing otherwise
   */
  static ensureIsFunction (arg, name = 'arg') {
    if (!Validator.isFunction(arg)) {
      return new TypeError(`The argument '${name}' must be a function, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a string.
   *
   * See {@link Validator.isString}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a string, nothing otherwise
   */
  static ensureIsString (arg, name = 'arg') {
    if (!Validator.isString(arg)) {
      return new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a not empty string.
   *
   * See {@link Validator.isStringNotEmpty}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not a string not empty, nothing otherwise
   */
  static ensureIsStringNotEmpty (arg, name = 'arg') {
    if (!Validator.isStringNotEmpty(arg)) {
      return new Error(`The string '${name}' must be not empty`)
    }
  }

  /**
   * Ensure that the given argument is an object.
   *
   * See {@link Validator.isObject}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not an object, nothing otherwise
   */
  static ensureIsObject (arg, name = 'arg') {
    if (!Validator.isObject(arg)) {
      return new TypeError(`The argument '${name}' must be an object, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object
   * and not: undefined, null, Array, Date, Number, String,
   * Symbol, Map/WeakMap, Set/WeakSet, etc.
   *
   * See {@link Validator.isObjectPlain}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object, nothing otherwise
   */
  static ensureIsObjectPlain (arg, name = 'arg') {
    if (!Validator.isObjectPlain(arg)) {
      return new TypeError(`The argument '${name}' must be a plain object, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection.
   *
   * See {@link Validator.isObjectOrCollection}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection, nothing otherwise
   */
  static ensureIsObjectOrCollection (arg, name = 'arg') {
    if (!Validator.isObjectOrCollection(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection, not an array.
   *
   * See {@link Validator.isObjectOrCollectionNotArray}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection or it's an array, nothing otherwise
   */
  static ensureIsObjectOrCollectionNotArray (arg, name = 'arg') {
    if (!Validator.isObjectOrCollectionNotArray(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection and not an array, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection or an array.
   *
   * See {@link Validator.isObjectOrCollectionOrArray}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection nor an array, nothing otherwise
   */
  static ensureIsObjectOrCollectionOrArray (arg, name = 'arg') {
    if (!Validator.isObjectOrCollectionOrArray(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection and not an array, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection, not a string.
   *
   * See {@link Validator.isObjectOrCollectionNotString}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection or it's a string, nothing otherwise
   */
  static ensureIsObjectOrCollectionNotString (arg, name = 'arg') {
    if (!Validator.isObjectOrCollectionNotString(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection and not a string, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection or an array,
   * not a value (string or boolean or number).
   *
   * See {@link Validator.isObjectOrCollectionOrArrayNotValue}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection or it's a value (string or boolean or number), nothing otherwise
   */
  static ensureIsObjectOrCollectionOrArrayNotValue (arg, name = 'arg') {
    if (!Validator.isObjectOrCollectionOrArrayNotValue(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection or an array and not a value (string or boolean or number), instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection, or a string.
   *
   * See {@link Validator.isObjectOrCollectionOrString}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection nor a string, nothing otherwise
   */
  static ensureIsObjectOrCollectionOrString (arg, name = 'arg') {
    if (!Validator.isObjectOrCollectionOrString(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection or a string, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection,
   * or a value (string or boolean or number).
   *
   * See {@link Validator.isObjectOrCollectionOrValue}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection nor a value (string or boolean or number), nothing otherwise
   */
  static ensureIsObjectOrCollectionOrValue (arg, name = 'arg') {
    if (!Validator.isObjectOrCollectionOrValue(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection or a value (string or boolean or number), instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a plain object or a collection or an array,
   * or a value (string or boolean or number).
   *
   * See {@link Validator.isObjectOrCollectionOrArrayOrValue}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {TypeError} if it's not a plain object nor a collection nor a value (string or boolean or number), nothing otherwise
   */
  static ensureIsObjectOrCollectionOrArrayOrValue (arg, name = 'arg') {
    if (!Validator.isObjectOrCollectionOrArrayOrValue(arg)) {
      return new TypeError(`The argument '${name}' must be an object or a collection or an array or a value (string or boolean or number), instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a date.
   *
   * See {@link Validator.isDate}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not a date, nothing otherwise
   */
  static ensureIsDate (arg, name = 'arg') {
    if (!Validator.isDate(arg)) {
      return new Error(`The argument '${name}' must be a Date, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a date in the past or now.
   *
   * See {@link Validator.isDatePast}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not a date in the past, nothing otherwise
   */
  static ensureIsDatePast (arg, name = 'arg') {
    if (!Validator.isDatePast(arg)) {
      return new Error(`The argument '${name}' must be a Date that belongs to the past`)
    }
  }

  /**
   * Ensure that the given argument is a date in the future or now.
   *
   * See {@link Validator.isDateFuture}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not a date in the future, nothing otherwise
   */
  static ensureIsDateFuture (arg, name = 'arg') {
    if (!Validator.isDateFuture(arg)) {
      return new Error(`The argument '${name}' must be a Date that belongs to the future`)
    }
  }

  /**
   * Ensure that the given argument is a number.
   *
   * See {@link Validator.isNumber}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not a number, nothing otherwise
   */
  static ensureIsNumber (arg, name = 'arg') {
    if (!Validator.isNumber(arg)) {
      return new Error(`The argument '${name}' must be a Number, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is an error instance or its subclass.
   *
   * See {@link Validator.isError}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not an error or its subclass, nothing otherwise
   */
  static ensureIsError (arg, name = 'arg') {
    if (!Validator.isError(arg)) {
      return new Error(`The argument '${name}' must be an Error or a subclass of it, instead got a '${typeof arg}'`)
    }
  }

  /**
   * Ensure that the given argument is a string version.
   *
   * See {@link Validator.isVersion}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not a string version, nothing otherwise
   */
  static ensureIsVersion (arg, name = 'arg') {
    if (!Validator.isVersion(arg)) {
      return new Error(`The argument '${name}' must be a string in the format 'n.n.n', and not '${arg}'`)
    }
  }

  /**
   * Ensure that the given argument is an URI/URL.
   *
   * See {@link Validator.isURI}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {?string} base the (optional) base to build the full URL
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if it's not an URI/URL, nothing otherwise
   */
  static ensureIsURI (arg, base, name = 'arg') {
    if (!Validator.isURI(arg, base)) {
      return new Error(`The argument '${name}' must be an URI or URL string and not ('${arg}', '${base}')`)
    }
  }

  /**
   * Ensure that the given object does not contain any property
   * that has a standard (reserved) property name.
   *
   * See {@link Validator.doesObjectContainsStandardProperty}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {?function} isPropStandard the function that tell the given argument (property), if it's standard
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @return {Error} if at least one property with a standard name is found, nothing otherwise
   */
  static ensureObjectDoesNotContainStandardProperty (arg, isPropStandard, name = 'arg') {
    if (Validator.doesObjectContainsStandardProperty(arg, isPropStandard)) {
      return new Error(`The object with name '${name}' contains at least one property with a standard name`)
    }
  }

  /**
   * Tell the size of the given object
   *
   * @static
   * @param {?object} arg the object to check
   * @return {number} the size if it's an array|Map|Set|object|string, nothing otherwise
   * @throws {TypeError} if it's not an array nor a collection nor object nor a string
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
    // else
    throw new TypeError(`Unable to calculate the size of the argument '${arg}'.`)
  }

  /**
   * Tell the size in bytes of the given string.
   *
   * @static
   * @param {?string} str the string to check
   * @return {number} the size if it's a string, nothing otherwise
   * @throws {TypeError} if it's not a string
   */
  static getSizeInBytes (str) {
    if ((str === undefined || str === null)) {
      return
    }
    if (typeof str === 'string') {
      return Buffer.from(str).length
    }
    // else
    throw new TypeError(`Unable to calculate the size in bytes of the argument '${str}'.`)
  }

  /**
   * Return the value of the variable given as argument.
   *
   * Note that this could have been written (in a shorter way)
   * as an arrow function.
   *
   * @static
   * @param {?object} arg the argument
   * @return {string} the value of the variable (if defined and not null), nothing otherwise
   */
  static getArgumentValue (arg) {
    if ((arg === undefined || arg === null)) {
      return arg
    }
    // else
    return arguments[0]
  }

  /**
   * Return the name of the variable given as argument.
   *
   * To use it, must be called using the trick to wrap argument
   * inside an object literal, so for example use it inside a template string with:
   * `${getArgumentName({x})}`
   * with nested objects (like with options with a property x inside)
   * you need to use with:
   * `${getArgumentName({options})}.${getArgumentName({x})}`.
   * Note that this could have been written (in a shorter way)
   * as an arrow function.
   *
   * @static
   * @param {?object} arg the argument
   * @return {string} the name of the variable (if defined and not null), nothing otherwise
   */
  static getArgumentName (arg) {
    if ((arg === undefined || arg === null)) {
      return
    }
    // else
    return Object.keys(arg)[0]
  }

  /**
   * Return the argument if it's defined and not null,
   * otherwise the given default value is returned.
   *
   * @static
   * @param {?object} arg the argument to return
   * @param {?object} def the default value to return
   * @return {object} the argument (if defined and not null), otherwise the default value
   */
  static getOrElse (arg, def) {
    if (typeof arg !== 'undefined' && arg !== null) {
      return arg
    }
    // else
    return def
  }

  /**
   * Return a copy of the given ibject,
   * with all properties filtered by the given function (predicate).
   *
   * @static
   * @param {?object} obj the base object
   * @param {?function} propFilter the function (predicate) for filtering properties
   * @return {object} a new object containing only filtered properties
   * @throws {TypeError} if obj is not a plain object, or propFilter is not a function
   */
  static getObjectFilteredProperties (obj, propFilter) {
    if (!Validator.isObjectPlain(obj)) throw new TypeError(`The argument 'obj' must be a plain object, instead got a '${typeof obj}'`)
    if (!Validator.isFunction(propFilter)) throw new TypeError(`The argument 'propFilter' must be a function, instead got a '${typeof propFilter}'`)
    const objFiltered = {}
    for (const [key, value] of Object.entries(obj)) {
      if (propFilter(key) === true) {
        objFiltered[key] = value
      }
    }
    return objFiltered
  }

  /**
   * Throw if the given argument is an error instance or its subclass.
   *
   * See {@link Validator.isError}.
   *
   * @static
   * @param {?object} arg the object to check
   * @throws {Error} the given error
   */
  static throwOnError (arg) {
    if (Validator.isError(arg)) {
      throw arg
    }
  }

  /**
   * Throw if the given argument is false.
   * Note that this is similar to assertions.
   *
   * See {@link Validator.isError}.
   *
   * @static
   * @param {?object} arg the object to check
   * @param {string} [name='arg'] the name to use in generated error (or the value of first argument if not given)
   * @throws {Error} if the given argument is not a boolean, or if it's false
   */
  static throwOnFalse (arg, name = 'arg') {
    if (!Validator.isBoolean(arg) || arg === false) {
      return new Error(`The argument '${name}' is false`)
    }
  }
}

module.exports = Validator
