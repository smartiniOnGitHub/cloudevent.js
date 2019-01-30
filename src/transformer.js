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
   * Gives a string valued property that is used in the creation of the default string description of an object.
   *
   * See {@link Symbol.toStringTag}.
   *
   * @return {string} a string representation of the object type
   */
  get [Symbol.toStringTag] () {
    return 'Transformer'
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
}

module.exports = Transformer
