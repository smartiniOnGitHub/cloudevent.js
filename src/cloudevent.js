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
 * CloudEvent:
 * this module exports some useful definition and utility related to CloudEvents.
 */

/**
 * Get a reference to cloudevent Validator class.
 *
 * @see Validator
 */
const V = require('./validator') // get validator from here

/**
 * Get a reference to cloudevent Transformer class.
 *
 * @see Transformer
 */
const T = require('./transformer') // get transformer from here

/**
 * CloudEvent implementation.
 *
 * @see https://github.com/cloudevents/spec/blob/master/json-format.md
 */
class CloudEvent {
  /**
   * Create a new instance of a CloudEvent object.
   * @param {!string} id the ID of the event (unique), mandatory
   * @param {!string} type the type of the event (usually prefixed with a reverse-DNS name), mandatory
   * @param {!uri} source the source uri of the event (use '/' if empty), mandatory
   * @param {(object|Map|Set|string)} data the real event data
   * @param {object} options optional attributes of the event; some has default values chosen here:
   *        time (timestamp/date, default now),
   *        datacontentencoding (string) optional in most cases here,
   *        datacontenttype (string, default 'application/json') tell how the data attribute must be encoded,
   *        schemaurl (uri) optional,
   *        subject (string) optional, describes the subject of the event in the context of the event producer (identified by source),
   *        strict (boolean, default false) tell if object instance will be validated in a more strict way
   * @param {object} extensions optional, contains extension properties (recommended in nested objects) but if given any object must contain at least 1 property (key/value)
   * @throws {Error} if strict is true and id or type is undefined or null
   * @throws {Error} if datacontentencoding is defined and data is not a string or if encoding is not 'base64'
   */
  constructor (id, type, source, data, {
    time = new Date(),
    datacontentencoding,
    datacontenttype = CloudEvent.datacontenttypeDefault(),
    schemaurl,
    subject,
    strict = false } = {},
  extensions
  ) {
    if (strict === true) {
      if (!id || !type || !source) {
        throw new Error('Unable to create CloudEvent instance, mandatory field missing')
      }
    }

    /**
     * The event ID.
     * @type {string}
     * @private
     */
    this.id = id
    /**
     * The event type.
     * @type {string}
     * @private
     */
    this.type = type
    /**
     * The source URI of the event.
     * @type {uri}
     * @private
     */
    this.source = source
    /**
     * The real event data.
     * Usually it's an object, but could be even a Map or a Set, or a string.
     * Copy the original object to avoid changing objects that could be shared.
     * @type {(object|Map|Set)}
     * @private
     */
    if (V.isString(data)) {
      // handle an edge case: if the given data is a String, I need to clone in a different way ...
      this.data = data.slice()
    } else if (V.isObjectOrCollectionOrString(data)) {
      // normal case
      this.data = { ...data }
    } else {
      // anything other, assign as is (and let validator complain later if needed)
      this.data = data
    }

    /**
     * The CloudEvent specification version.
     * @type {string}
     * @private
     */
    this.specversion = this.constructor.version()
    /**
     * The content encoding for the data attribute
     * for when the data field must be encoded as a string.
     * This must be set if the data attribute contains string-encoded binary data,
     * otherwise it must not be set.
     * As (arbitrary) limitation, only 'base64' encoding is supported here.
     * @type {string}
     * @private
     */
    this.datacontentencoding = datacontentencoding
    /**
     * The MIME Type for the encoding of the data attribute, when serialized.
     * @type {string}
     * @private
     */
    this.datacontenttype = datacontenttype
    /**
     * The event timestamp.
     * Copy the original object to avoid changing objects that could be shared.
     * Note that here the object will be transformed into string when serialized.
     * @type {object}
     * @private
     */
    this.time = new Date(time.valueOf())
    /**
     * The URL of schema for the event, if any.
     * @type {uri}
     * @private
     */
    this.schemaurl = schemaurl
    /**
     * The subject of the event in the context of the event producer.
     * @type {string}
     * @private
     */
    this.subject = subject

    // add strict to extensions, but only when defined
    if (strict === true) {
      this.constructor.setStrictExtensionInEvent(this, strict)
      if (V.doesObjectContainsStandardProperty(extensions, CloudEvent.isStandardProperty)) {
        throw new Error('Unable to create CloudEvent instance, extensions contains standard properties')
      }
    }

    // set extensions
    this.constructor.setExtensionsInEvent(this, extensions)
  }

  /**
   * Return the version of the CloudEvent Specification implemented here
   *
   * @static
   * @return {string} the value
   */
  static version () {
    return '0.3'
  }

  /**
   * Return the default data content Type for a CloudEvent
   *
   * @static
   * @return {string} the value
   */
  static datacontenttypeDefault () {
    return 'application/json'
  }

  /**
   * Return the MIME Type for a CloudEvent
   *
   * @static
   * @return {string} the value
   */
  static mediaType () {
    return 'application/cloudevents+json'
  }

  /**
   * Return the MIME Type for CloudEvent intances
   * batched into a single JSON document (array),
   * using the JSON Batch Format
   *
   * @static
   * @return {string} the value
   */
  static mediaTypeBatchFormat () {
    return 'application/cloudevents-batch+json'
  }

  /**
   * Tell if the object has the strict flag enabled.
   *
   * @static
   * @param {!object} event the CloudEvent to validate
   * @return {boolean} true if strict, otherwise false
   * @throws {TypeError} if event is not a CloudEvent instance or subclass
   * @throws {Error} if event is undefined or null
   */
  static isStrictEvent (event) {
    if (!CloudEvent.isCloudEvent(event)) {
      throw new TypeError('The given event is not a CloudEvent instance')
    }
    if (V.isDefinedAndNotNull(event.com_github_smartiniOnGitHub_cloudevent)) {
      return event.com_github_smartiniOnGitHub_cloudevent.strict === true
    } else {
      return false
    }
  }

  /**
   * Set the strict flag into the given extensions object.
   * Should not be used outside CloudEvent constructor.
   *
   * @private
   * @static
   * @param {object} obj the object with extensions to fill (maybe already populated), that will be enhanced inplace
   * @param {boolean} strict, the flag to set (default false)
   * @throws {TypeError} if obj is not an object, or strict is not a flag
   * @throws {Error} if obj is undefined or null, or strict is undefined or null
   */
  static setStrictExtensionInEvent (obj = {}, strict = false) {
    if (!V.isObject(obj)) {
      throw new TypeError('The given extensions is not an object instance')
    }
    if (!V.isBoolean(strict)) {
      throw new TypeError('The given strict flag is not a boolean instance')
    }
    obj.com_github_smartiniOnGitHub_cloudevent = {}
    obj.com_github_smartiniOnGitHub_cloudevent.strict = strict
  }

  /**
   * Get the strict flag from the given extensions object.
   * Should not be used outside CloudEvent.
   *
   * @private
   * @static
   * @param {object} obj the object with extensions to check
   * @return {boolean} the strict flag value, or false if not found
   * @throws {TypeError} if obj is not an object, or strict is not a flag
   * @throws {Error} if obj is undefined or null
   */
  static getStrictExtensionOfEvent (obj = {}) {
    if (!V.isObject(obj)) {
      throw new TypeError('The given extensions is not an object instance')
    }
    const myExtensions = obj.com_github_smartiniOnGitHub_cloudevent || {}
    if (!V.isObject(myExtensions)) {
      throw new TypeError('The property com_github_smartiniOnGitHub_cloudevent is not an object instance')
    }
    const strict = myExtensions.strict || false
    if (!V.isBoolean(strict)) {
      throw new TypeError('The given strict flag is not a boolean instance')
    }
    return strict
  }

  /**
   * Set all extensions into the given object.
   * Should not be used outside CloudEvent constructor.
   *
   * @private
   * @static
   * @param {object} obj the object to fill, that will be enhanced inplace
   * @param {object} extensions the extensions to fill (maybe already populated)
   * @throws {TypeError} if obj is not an object, or strict is not a flag
   * @throws {Error} if obj is undefined or null, or strict is undefined or null
   */
  static setExtensionsInEvent (obj = {}, extensions = null) {
    if (!V.isObject(obj)) {
      throw new TypeError('The given obj is not an object instance')
    }
    if (!V.isDefinedAndNotNull(extensions)) {
      return
    }
    if (V.isObject(extensions)) {
      const exts = Object.entries(extensions).filter(i => !V.doesStringIsStandardProperty(i[0], CloudEvent.isStandardProperty))
      // add filtered extensions to the given obj
      for (const [key, value] of exts) {
        obj[key] = value
      }
    } else {
      throw new TypeError('Unsupported extensions: not an object or a string')
    }
  }

  /**
   * Get all extensions from the given object.
   * Should not be used outside CloudEvent.
   *
   * @private
   * @static
   * @param {object} obj the object to check
   * @return {object} an object containins all extensions (non standard properties) found
   * @throws {TypeError} if obj is not an object
   * @throws {Error} if obj is undefined or null
   */
  static getExtensionsOfEvent (obj = {}) {
    const extensions = {}
    if (V.isObject(obj)) {
      const exts = Object.entries(obj).filter(i => !V.doesStringIsStandardProperty(i[0], CloudEvent.isStandardProperty))
      // add filtered extensions to the given extensions
      for (const [key, value] of exts) {
        extensions[key] = value
      }
    } else {
      throw new TypeError('Unsupported extensions: not an object or a string')
    }
    return extensions
  }

  /**
   * Validate the given CloudEvent.
   *
   * @static
   * @param {!object} event the CloudEvent to validate
   * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
   * @return {object[]} an array of (non null) validation errors, or at least an empty array
   */
  static validateEvent (event, { strict = false } = {}) {
    if (V.isUndefinedOrNull(event)) {
      return [new Error('CloudEvent undefined or null')]
    }
    const ve = [] // validation errors

    // standard validation
    // note that some properties are not checked here because I assign a default value, and I check them in strict mode, like:
    // data, time, extensions, datacontenttype ...
    // ve.push(V.ensureIsStringNotEmpty(event.specversion, 'specversion')) // no more a public attribute
    ve.push(V.ensureIsStringNotEmpty(event.id, 'id'))
    ve.push(V.ensureIsStringNotEmpty(event.type, 'type'))
    ve.push(V.ensureIsStringNotEmpty(event.source, 'source'))
    if (V.isDefinedAndNotNull(event.schemaurl)) {
      ve.push(V.ensureIsStringNotEmpty(event.schemaurl, 'schemaurl'))
    }
    if (V.isDefinedAndNotNull(event.subject)) {
      ve.push(V.ensureIsStringNotEmpty(event.subject, 'subject'))
    }
    if (V.isDefinedAndNotNull(event.datacontentencoding)) {
      ve.push(V.ensureIsStringNotEmpty(event.datacontentencoding, 'datacontentencoding'))
    }

    // additional validation if strict mode enabled, or if enabled in the event ...
    if (strict === true || CloudEvent.isStrictEvent(event) === true) {
      ve.push(V.ensureIsClass(event, CloudEvent, 'CloudEvent_Subclass'))
      ve.push(V.ensureIsVersion(event.specversion, 'specversion'))
      if (V.isDefinedAndNotNull(event.data)) {
        if (V.isDefinedAndNotNull(event.datacontentencoding)) {
          // ensure data is a string in this case
          ve.push(V.ensureIsString(event.data, 'data'))
        } else if (event.datacontenttype !== CloudEvent.datacontenttypeDefault()) {
          // ensure data is object or collection, or even a string in this case
          // because in serialization/deserialization some validation can occur on the transformed object
          ve.push(V.ensureIsObjectOrCollectionOrString(event.data, 'data'))
        } else {
          // ensure data is object or collection, but not a string in this case
          ve.push(V.ensureIsObjectOrCollectionNotString(event.data, 'data'))
        }
      }
      ve.push(V.ensureIsURI(event.source, null, 'source'))
      ve.push(V.ensureIsDatePast(event.time, 'time'))
      ve.push(V.ensureIsStringNotEmpty(event.datacontenttype, 'datacontenttype'))
      ve.push(V.ensureIsURI(event.schemaurl, null, 'schemaurl'))
      if (V.isDefinedAndNotNull(event.extensions)) {
        ve.push(V.ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
        const extensionsSize = V.getSize(event.extensions)
        if (extensionsSize < 1) {
          ve.push(new Error('The object \'extensions\' must contain at least 1 property'))
        }
      }
    }

    return ve.filter((i) => i)
  }

  /**
   * Tell the given CloudEvent, if it's valid.
   *
   * See {@link CloudEvent.validateEvent}.
   *
   * @static
   * @param {!object} event the CloudEvent to validate
   * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
   * @return {boolean} true if valid, otherwise false
   */
  static isValidEvent (event, { strict = false } = {}) {
    const validationErrors = CloudEvent.validateEvent(event, { strict })
    const size = V.getSize(validationErrors)
    return (size === 0)
  }

  /**
   * Tell the given CloudEvent, if it's instance of the CloudEvent class or a subclass of it.
   *
   * @static
   * @param {!object} event the CloudEvent to check
   * @return {boolean} true if it's an instance (or a subclass), otherwise false
   */
  static isCloudEvent (event) {
    if (V.isUndefinedOrNull(event)) {
      throw new Error('CloudEvent undefined or null')
    }
    return V.isClass(event, CloudEvent)
  }

  /**
   * Serialize the given CloudEvent in JSON format.
   * Note that here standard serialization to JSON is used (no additional libraries).
   * Note that the result of encoder function is assigned to encoded data.
   *
   * @static
   * @param {!object} event the CloudEvent to serialize
   * @param {object} options optional serialization attributes:
   *        encoder (function, no default) a function that takes data and returns encoded data as a string,
   *        encodedData (string, no default) already encoded data (but consistency with the datacontenttype is not checked),
   *        onlyValid (boolean, default false) to serialize only if it's a valid instance,
   *        onlyIfLessThan64KB (boolean, default false) to return the serialized string only if it's less than 64 KB,
   * @return {string} the serialized event, as a string
   * @throws {Error} if event is undefined or null, or an option is undefined/null/wrong
   */
  static serializeEvent (event, {
    encoder, encodedData,
    onlyValid = false, onlyIfLessThan64KB = false
  } = {}) {
    if (V.isUndefinedOrNull(event)) throw new Error('CloudEvent undefined or null')
    if (event.datacontenttype === CloudEvent.datacontenttypeDefault()) {
      if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(event) === true)) {
        const ser = JSON.stringify(event, function replacer (key, value) {
          switch (key) {
            case 'data':
              // return data as is, or encoded or nothing (if not supported)
              if (V.isUndefinedOrNull(event.datacontentencoding)) return value
              if (event.datacontentencoding === 'Base64') return T.stringToBase64(this.data)
              else return undefined
            case 'extensions':
              // filtering out top level extensions (if any)
              return undefined
            default:
              return value
          }
        })
        if ((onlyIfLessThan64KB === false) || (onlyIfLessThan64KB === true && V.getSizeInBytes(ser) < 65536)) return ser
        else throw new Error('Unable to return a serialized CloudEvent bigger than 64 KB.')
      } else throw new Error('Unable to serialize a not valid CloudEvent.')
    }
    // else (non defaut datacontenttype)
    if (V.isDefinedAndNotNull(encoder)) {
      if (!V.isFunction(encoder)) throw new Error(`Missing or wrong encoder function: '${encoder}' for the given content type: '${event.datacontenttype}'.`)
      encodedData = encoder(event.payload)
    } else {
      // encoder not defined, check encodedData
      if (!V.isDefinedAndNotNull(encodedData)) throw new Error(`Missing encoder function: use encoder function or already encoded data with the given data content type: '${event.datacontenttype}'.`)
    }
    if (!V.isStringNotEmpty(encodedData)) throw new Error(`Missing or wrong encoded data: '${encodedData}' for the given data content type: '${event.datacontenttype}'.`)
    const newEvent = T.mergeObjects(event, { data: encodedData })
    if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(newEvent) === true)) {
      const ser = JSON.stringify(newEvent)
      if ((onlyIfLessThan64KB === false) || (onlyIfLessThan64KB === true && V.getSizeInBytes(ser) < 65536)) return ser
      else throw new Error('Unable to return a serialized CloudEvent bigger than 64 KB.')
    } else throw new Error('Unable to serialize a not valid CloudEvent.')
  }

  /**
   * Deserialize/parse the given CloudEvent from JSON format.
   * Note that here standard parse from JSON is used (no additional libraries).
   * Note that the result of decoder function is assigned to decoded data.
   *
   * @static
   * @param {!string} ser the serialized CloudEvent to parse/deserialize
   * @param {object} options optional deserialization attributes:
   *        decoder (function, no default) a function that takes data and returns decoder data as a string,
   *        decodedData (string, no default) already decoded data (but consistency with the datacontenttype is not checked),
   *        onlyValid (boolean, default false) to deserialize only if it's a valid instance,
   *        onlyIfLessThan64KB (boolean, default false) to return the deserialized string only if it's less than 64 KB,
   *        timezoneOffset (number, default 0) to apply a different timezone offset
   * @return {object} the deserialized event as a CloudEvent instance
   * @throws {Error} if event is undefined or null, or an option is undefined/null/wrong
   * @throws {Error} in case of JSON parsing error
   */
  static deserializeEvent (ser, {
    decoder, decodedData,
    onlyValid = false, onlyIfLessThan64KB = false,
    timezoneOffset = 0
  } = {}) {
    if (V.isUndefinedOrNull(ser)) throw new Error('Serialized CloudEvent undefined or null')
    if (!V.isStringNotEmpty(ser)) throw new Error(`Missing or wrong serialized data: '${ser}' must be a string and not a: '${typeof ser}'.`)
    // deserialize standard attributes, always in JSON format
    const parsed = JSON.parse(ser)
    // ensure it's an object (single), and not a string neither a collection or an array
    if (!V.isObject(parsed) || V.isArray(parsed)) throw new Error(`Wrong deserialized data: '${ser}' must represent an object and not an array or a string or other.`)

    const strict = CloudEvent.getStrictExtensionOfEvent(parsed)
    const extensions = CloudEvent.getExtensionsOfEvent(parsed)

    if (V.isDefinedAndNotNull(parsed.datacontentencoding)) {
      if (V.isStringNotEmpty(parsed.data)) {
        // decode the given data
        if (parsed.datacontentencoding === 'Base64') parsed.data = T.stringFromBase64(parsed.data)
      }
    }

    // fill a new CludEvent instance with parsed data
    const ce = new CloudEvent(parsed.id,
      parsed.type,
      parsed.source,
      parsed.data,
      { // options
        time: T.timestampFromString(parsed.time, timezoneOffset),
        datacontentencoding: parsed.datacontentencoding,
        datacontenttype: parsed.datacontenttype,
        schemaurl: parsed.schemaurl,
        subject: parsed.subject,
        strict: strict
      },
      extensions
    )
    // depending on the datacontenttype, decode the data attribute (the payload)
    if (parsed.datacontenttype === CloudEvent.datacontenttypeDefault()) {
      // return ce, depending on its validation option
      if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(ce) === true)) {
        if ((onlyIfLessThan64KB === false) || (onlyIfLessThan64KB === true && V.getSizeInBytes(ser) < 65536)) return ce
        else throw new Error('Unable to return a deserialized CloudEvent bigger than 64 KB.')
      } else throw new Error('Unable to deserialize a not valid CloudEvent.')
    }
    // else (non defaut datacontenttype)
    if (V.isDefinedAndNotNull(decoder)) {
      if (!V.isFunction(decoder)) throw new Error(`Missing or wrong decoder function: '${decoder}' for the given data content type: '${parsed.datacontenttype}'.`)
      decodedData = decoder(parsed.data)
    } else {
      // decoder not defined, so decodedData must be defined
      if (!V.isDefinedAndNotNull(decodedData)) throw new Error(`Missing decoder function: use decoder function or already decoded data with the given data content type: '${parsed.datacontenttype}'.`)
    }
    if (!V.isObjectOrCollectionOrString(decodedData)) throw new Error(`Missing or wrong decoded data: '${decodedData}' for the given data content type: '${parsed.datacontenttype}'.`)
    // overwrite data with decodedData before returning it
    ce.data = decodedData
    // return ce, depending on its validation option
    if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(ce) === true)) {
      if ((onlyIfLessThan64KB === false) || (onlyIfLessThan64KB === true && V.getSizeInBytes(ser) < 65536)) return ce
      else throw new Error('Unable to return a deserialized CloudEvent bigger than 64 KB.')
    } else throw new Error('Unable to deserialize a not valid CloudEvent.')
  }

  /**
   * Tell the given property, if it's a standard CloudEvent property/attribute.
   *
   * @static
   * @param {!string} property the property/attribute to check
   * @return {boolean} true if it's standard otherwise false
   */
  static isStandardProperty (property) {
    return CloudEvent.standardProps.includes(property)
  }

  /**
   * Get the JSON Schema for a CloudEvent.
   * Note that it's not used in standard serialization to JSON,
   * but only in some serialization libraries.
   * Note that schema definitions for data and extensions are right,
   * but I need to keep them commented here and to set the flag
   * additionalProperties to true,
   * or when used both data and extensions will be empty in JSON output.
   * Note that for time I had to keep its schema definition commented
   * or schema validation on object instances would fail (because in the
   * object model I store it as a timestamp/date currently and not as a string).
   *
   * See JSON Schema.
   *
   * @static
   * @return {object} the JSON Schema
   */
  static getJSONSchema () {
    // define a schema for serializing a CloudEvent object to JSON
    // note that properties not in the schema will be ignored
    // (in json output) by some json serialization libraries, if additionalProperties is false
    return {
      title: 'CloudEvent Schema with required fields',
      type: 'object',
      properties: {
        specversion: { type: 'string', minLength: 1 },
        id: { type: 'string', minLength: 1 },
        type: { type: 'string', minLength: 1 },
        source: { type: 'string', format: 'uri-reference' },
        datacontenttype: { type: 'string' },
        // data: { type: ['object', 'string'] },
        // time: { type: 'string', format: 'date-time' },
        schemaurl: { type: 'string', format: 'uri-reference' },
        subject: { type: 'string', minLength: 1 }
      },
      required: [
        'specversion', 'id', 'type', 'source'
      ],
      additionalProperties: true // to handle data, and maybe other (non-standard) properties (extensions)
    }
  }

  /**
   * Serialize the current CloudEvent.
   *
   * See {@link CloudEvent.serializeEvent}.
   *
   * @param {object} options optional serialization attributes:
   *        encoder (function, default null) a function that takes data and returns encoded data,
   *        encodedData (string, default null) already encoded data (but consistency with the datacontenttype is not checked),
   * @return {string} the serialized event, as a string
   */
  serialize ({ encoder, encodedData } = {}) {
    return this.constructor.serializeEvent(this, { encoder, encodedData })
  }

  /**
   * Validate the current CloudEvent.
   *
   * See {@link CloudEvent.validateEvent}.
   *
   * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
   * @return {object[]} an array of (non null) validation errors, or at least an empty array
   */
  validate ({ strict = false } = {}) {
    return this.constructor.validateEvent(this, { strict })
  }

  /**
   * Tell the current CloudEvent, if it's valid.
   *
   * See {@link CloudEvent.isValidEvent}.
   *
   * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
   * @return {boolean} true if valid, otherwise false
   */
  isValid ({ strict = false } = {}) {
    return this.constructor.isValidEvent(this, { strict })
  }

  /**
   * Getter method to tell if the object has the strict flag enabled.
   *
   * See {@link CloudEvent.isStrictEvent}.
   *
   * @type {boolean}
   */
  get isStrict () {
    return this.constructor.isStrictEvent(this)
  }

  /**
   * Getter method to return JSON Schema for a CloudEvent.
   *
   * See {@link CloudEvent.getJSONSchema}.
   *
   * @type {object}
   */
  get schema () {
    return this.constructor.getJSONSchema()
  }

  /**
   * Getter method to return a copy of CloudEvent data attribute,
   * or original data payload.
   *
   * See {@link CloudEvent.data}.
   *
   * @type {(object|Map|Set)}
   */
  get payload () {
    if (V.isString(this.data)) {
      // handle an edge case: if data is a String, I need to clone in a different way ...
      return this.data.slice()
    }
    // else
    return { ...this.data }
  }

  /**
   * Getter method to return a copy of CloudEvent extensions.
   *
   * See {@link CloudEvent.getExtensionsOfEvent}.
   *
   * @type {object}
   */
  get extensions () {
    return this.constructor.getExtensionsOfEvent(this)
  }

  /**
   * Override the usual toString method.
   *
   * See {@link Object.toString}.
   *
   * @return {string} a string representation for object instance
   */
  toString () {
    return `CloudEvent[specversion: ${this.specversion}, ${T.dumpObject(this.id, 'id')}, ${T.dumpObject(this.type, 'type')}, ${T.dumpObject(this.data, 'data')}, ...]`
  }

  /**
   * Gives a string valued property that is used in the creation of the default string description of an object.
   *
   * See {@link Symbol.toStringTag}.
   *
   * @return {string} a string representation of the object type
   */
  get [Symbol.toStringTag] () {
    return 'CloudEvent'
  }
}

/**
 * Utility variable that returns all standard property names, in an array.
 *
 * @static
 */
CloudEvent.standardProps = [
  'specversion',
  'id', 'type', 'source', 'data',
  'time', 'datacontentencoding', 'datacontenttype',
  'schemaurl', 'subject'
]

module.exports = CloudEvent
