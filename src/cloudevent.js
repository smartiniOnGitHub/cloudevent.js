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
 * CloudEvent:
 * this module exports some useful definition and utility related to CloudEvents.
 */

/**
 * Get a reference to cloudevent Validator class.
 * @private
 * @see Validator
 */
const V = require('./validator') // get validator from here

/**
 * Get a reference to cloudevent Transformer class.
 * @private
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
   * @param {?(object|Map|Set|string)} data the real event data
   * @param {object} [options={}] optional attributes of the event; some has default values chosen here:
   *        - time (timestamp/date, default now),
   *        - datainbase64 (string) base64 encoded value for the data (data attribute must not be present when this is defined),
   *        - datacontenttype (string, default 'application/json') is the content type of the data attribute,
   *        - dataschema (uri) optional, reference to the schema that data adheres to,
   *        - subject (string) optional, describes the subject of the event in the context of the event producer (identified by source),
   *        - strict (boolean, default false) tell if object instance will be validated in a more strict way
   * @param {?object} extensions optional, contains extension properties (each extension as a key/value property, and no nested objects) but if given any object must contain at least 1 property
   * @throws {Error} if strict is true and id or type is undefined or null
   * @throws {Error} if data and data_base64 are defined
   */
  constructor (id, type, source, data, {
    time = new Date(),
    datainbase64,
    datacontenttype = CloudEvent.datacontenttypeDefault(),
    dataschema,
    subject,
    strict = false
  } = {},
  extensions
  ) {
    if (strict === true) {
      if (!id || !type || !source) {
        throw new Error('Unable to create CloudEvent instance, mandatory attributes missing')
      }
      if (V.isDefinedAndNotNull(data) && V.isDefinedAndNotNull(datainbase64)) {
        throw new Error('Unable to create CloudEvent instance, data and data_base64 attributes are exclusive')
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
     * The real event data, but encoded in base64 format.
     * @type {string}
     * @private
     */
    this.data_base64 = datainbase64
    /**
     * The MIME Type for the encoding of the data attribute, when serialized.
     * If null, default value will be set.
     * @type {string}
     * @private
     */
    this.datacontenttype = (!V.isNull(datacontenttype)) ? datacontenttype : CloudEvent.datacontenttypeDefault()
    /**
     * The URI of the schema for event data, if any.
     * @type {uri}
     * @private
     */
    this.dataschema = dataschema
    /**
     * The event timestamp.
     * Copy the original object to avoid changing objects that could be shared.
     * If null, current timestamp will be set.
     * Note that here the object will be transformed into string when serialized.
     * @type {object}
     * @private
     */
    this.time = (!V.isNull(time)) ? new Date(time.valueOf()) : new Date()
    /**
     * The subject of the event in the context of the event producer.
     * @type {string}
     * @private
     */
    this.subject = subject

    // add strict to extensions, but only when defined
    if (strict === true) {
      this.constructor.setStrictExtensionInEvent(this, strict)

      const extensionsSize = V.getSize(extensions)
      if (extensionsSize < 1) {
        throw new Error('Unable to create CloudEvent instance, extensions must contain at least 1 property')
      }
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
    return '1.0'
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
   * Tell the data content Type for a CloudEvent,
   * if is a JSON-derived format,
   * so data must be encoded/decoded accordingly.
   *
   * @static
   * @param {!object} event the CloudEvent to validate
   * @return {boolean} true if data content type is JSON-like, otherwise false
   * @throws {TypeError} if event is not a CloudEvent instance or subclass
   * @throws {Error} if event is undefined or null
   */
  static isDatacontenttypeJSONEvent (event) {
    if (!CloudEvent.isCloudEvent(event)) {
      throw new TypeError('The given event is not a CloudEvent instance')
    }
    return (
      (event.datacontenttype === CloudEvent.datacontenttypeDefault()) ||
      (event.datacontenttype.endsWith('/json')) ||
      (event.datacontenttype.endsWith('+json'))
    )
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
    if (V.isDefinedAndNotNull(event.strictvalidation)) {
      return event.strictvalidation === true
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
   * @param {object} [obj={}] the object with extensions to fill (maybe already populated), that will be enhanced inplace
   * @param {boolean} [strict=false] the flag to set (default false)
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
    obj.strictvalidation = strict
  }

  /**
   * Get the strict flag from the given extensions object.
   * Should not be used outside CloudEvent.
   *
   * @private
   * @static
   * @param {object} [obj={}] the object with extensions to check
   * @return {boolean} the strict flag value, or false if not found
   * @throws {TypeError} if obj is not an object, or strict is not a flag
   * @throws {Error} if obj is undefined or null
   * @throws {Error} if strictvalidation property is undefined or null
   */
  static getStrictExtensionOfEvent (obj = {}) {
    if (!V.isObject(obj)) {
      throw new TypeError('The given extensions is not an object instance')
    }
    const myExtensionStrict = obj.strictvalidation || false
    if (!V.isBoolean(myExtensionStrict)) {
      throw new TypeError("Extension property 'strictvalidation' has not a boolean value")
    }
    return myExtensionStrict
  }

  /**
   * Set all extensions into the given object.
   * Should not be used outside CloudEvent constructor.
   *
   * @private
   * @static
   * @param {object} [obj={}] the object to fill, that will be enhanced inplace
   * @param {object} [extensions=null] the extensions to fill (each extension as a key/value property, and no nested properties)
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
   * @param {object} [obj={}] the object to check
   * @return {object} an object containins all extensions (non standard properties) found
   * @throws {TypeError} if obj is not an object
   * @throws {Error} if obj is undefined or null
   */
  static getExtensionsOfEvent (obj = {}) {
    const extensions = {}
    if (V.isObject(obj)) {
      const exts = Object.entries(obj).filter(i => !V.doesStringIsStandardProperty(i[0], CloudEvent.isStandardProperty))
      if (exts.length > 0) {
        // add filtered extensions to the given extensions
        for (const [key, value] of exts) {
          extensions[key] = value
        }
      } else {
        // no extensions found, so return a null value
        // (extensions defined but empty are not valid extensions)
        return null
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
   * @param {object} [options={}] containing:
   *        - strict (boolean, default false) to validate it in a more strict way,
   *        - dataschemavalidator (function(data, dataschema) boolean, optional) a function to validate data of current CloudEvent instance with its dataschema
   * @return {object[]} an array of (non null) validation errors, or at least an empty array
   */
  static validateEvent (event, { strict = false, dataschemavalidator = null } = {}) {
    if (V.isUndefinedOrNull(event)) {
      return [new Error('CloudEvent undefined or null')]
    }
    if (!CloudEvent.isCloudEvent(event)) {
      return [new TypeError(`The argument must be a CloudEvent (or a subclass), instead got a '${typeof event}'`)]
    }
    const ve = [] // validation errors

    // standard validation
    // note that some properties are not checked here because I assign a default value, and I check them in strict mode, like:
    // data, time, extensions, datacontenttype ...
    // ve.push(V.ensureIsStringNotEmpty(event.specversion, 'specversion')) // no more a public attribute
    ve.push(V.ensureIsStringNotEmpty(event.id, 'id'))
    ve.push(V.ensureIsStringNotEmpty(event.type, 'type'))
    ve.push(V.ensureIsStringNotEmpty(event.source, 'source'))
    if (V.isDefinedAndNotNull(event.dataschema)) {
      ve.push(V.ensureIsStringNotEmpty(event.dataschema, 'dataschema'))
    }
    if (V.isDefinedAndNotNull(event.subject)) {
      ve.push(V.ensureIsStringNotEmpty(event.subject, 'subject'))
    }
    if (V.isDefinedAndNotNull(event.data_base64)) {
      ve.push(V.ensureIsStringNotEmpty(event.data_base64, 'data_base64'))
      if (V.isDefinedAndNotNull(event.data)) {
        ve.push(new Error('data and data_base64 attributes are exclusive'))
      }
    }

    // additional validation if strict mode enabled, or if enabled in the event ...
    if (strict === true || CloudEvent.isStrictEvent(event) === true) {
      ve.push(V.ensureIsVersion(event.specversion, 'specversion'))
      if (V.isDefinedAndNotNull(event.data)) {
        if (event.datacontenttype === CloudEvent.datacontenttypeDefault()) {
          // if it's a string, ensure it's a valid JSON representation,
          // otherwise ensure data is a plain object or collection, but not a string in this case
          if (V.isString(event.data)) {
            try {
              JSON.parse(event.data)
            } catch (e) {
              ve.push(new Error('data is not a valid JSON string'))
            }
          } else {
            ve.push(CloudEvent.ensureTypeOfDataIsRight(event))
          }
          // end of default datacontenttype
        } else {
          // ensure data is a plain object or collection,
          // or even a value (string or boolean or number) in this case
          // because in serialization/deserialization some validation can occur on the transformed object
          ve.push(CloudEvent.ensureTypeOfDataIsRight(event))
        }
      }
      ve.push(V.ensureIsURI(event.source, null, 'source'))
      ve.push(V.ensureIsDatePast(event.time, 'time'))
      ve.push(V.ensureIsStringNotEmpty(event.datacontenttype, 'datacontenttype'))
      if (V.isDefinedAndNotNull(event.dataschema)) {
        ve.push(V.ensureIsURI(event.dataschema, null, 'dataschema'))
      }
      if (V.isFunction(dataschemavalidator)) {
        try {
          const success = dataschemavalidator(event.data, event.dataschema)
          if (success === false) throw Error()
        } catch (e) {
          ve.push(new Error(`data does not respect the dataschema '${event.dataschema}' for the given validator`))
        }
      }
      if (V.isDefinedAndNotNull(event.extensions)) {
        // get extensions via its getter
        ve.push(V.ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
        // error for extensions defined but empty (without properties), moved in constructor
        // then check for each extension name and value
        for (const [key, value] of Object.entries(event.extensions)) {
          if (!CloudEvent.isExtensionNameValid(key)) ve.push(new Error(`extension name '${key}' not valid`))
          if (!CloudEvent.isExtensionValueValid(value)) ve.push(new Error(`extension value '${value}' not valid for extension '${key}'`))
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
   * @param {object} [options={}] containing:
   *        - strict (boolean, default false) to validate it in a more strict way,
   *        - dataschemavalidator (function(data, dataschema) boolean, optional) a function to validate data of current CloudEvent instance with its dataschema
   * @return {boolean} true if valid, otherwise false
   */
  static isValidEvent (event, { strict = false, dataschemavalidator = null } = {}) {
    const validationErrors = CloudEvent.validateEvent(event, { strict, dataschemavalidator })
    const size = V.getSize(validationErrors)
    return (size === 0)
  }

  /**
   * Tell the given CloudEvent, if it's instance of the CloudEvent class or a subclass of it.
   *
   * @static
   * @param {!object} event the CloudEvent to check
   * @return {boolean} true if it's an instance (or a subclass), otherwise false
   * @throws {Error} if event is undefined or null
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
   * @param {object} [options={}] optional serialization attributes:
   *        - encoder (function, no default) a function that takes data and returns encoded data as a string,
   *        - encodedData (string, no default) already encoded data (but consistency with the datacontenttype is not checked),
   *        - onlyValid (boolean, default false) to serialize only if it's a valid instance,
   *        - onlyIfLessThan64KB (boolean, default false) to return the serialized string only if it's less than 64 KB,
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
      // but mandatory only for non-value data
      if (!V.isValue(event.data) && !V.isDefinedAndNotNull(encodedData)) throw new Error(`Missing encoder function: use encoder function or already encoded data with the given data content type: '${event.datacontenttype}'.`)
      if (V.isValue(event.data) && !V.isDefinedAndNotNull(encodedData)) {
        encodedData = `${event.data}`
      }
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
   * @param {object} [options={}] optional deserialization attributes:
   *        - decoder (function, no default) a function that takes data and returns decoder data as a string,
   *        - decodedData (string, no default) already decoded data (but consistency with the datacontenttype is not checked),
   *        - onlyValid (boolean, default false) to deserialize only if it's a valid instance,
   *        - onlyIfLessThan64KB (boolean, default false) to return the deserialized string only if it's less than 64 KB,
   *        - timezoneOffset (number, default 0) to apply a different timezone offset
   * @return {object} the deserialized event as a CloudEvent instance
   * @throws {Error} if ser is undefined or null, or an option is undefined/null/wrong
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
    if (!V.isStringNotEmpty(parsed.specversion) || parsed.specversion !== CloudEvent.version()) throw new Error(`Unable to deserialize, not compatible specversion: got '${parsed.specversion}' expected '${CloudEvent.version()}'.`)

    const strict = CloudEvent.getStrictExtensionOfEvent(parsed)
    const extensions = CloudEvent.getExtensionsOfEvent(parsed)

    // fill a new CludEvent instance with parsed data
    const ce = new CloudEvent(parsed.id,
      parsed.type,
      parsed.source,
      parsed.data,
      { // options
        time: T.timestampFromString(parsed.time, timezoneOffset),
        datainbase64: parsed.data_base64,
        datacontenttype: parsed.datacontenttype,
        dataschema: parsed.dataschema,
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
      // but mandatory only for non-value data
      if (!V.isValue(parsed.data) && !V.isDefinedAndNotNull(decodedData)) throw new Error(`Missing decoder function: use decoder function or already decoded data with the given data content type: '${parsed.datacontenttype}'.`)
      if (V.isValue(parsed.data) && !V.isDefinedAndNotNull(decodedData)) {
        decodedData = `${parsed.data}`
      }
    }
    if (!V.isObjectOrCollectionOrArrayOrValue(decodedData)) throw new Error(`Missing or wrong decoded data: '${decodedData}' for the given data content type: '${parsed.datacontenttype}'.`)
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
   * Tell the given property, if it's an extension CloudEvent property/attribute.
   *
   * @static
   * @param {!string} property the property/attribute to check
   * @return {boolean} true if it's an extension (not standard) otherwise false
   */
  static isExtensionProperty (property) {
    return !CloudEvent.standardProps.includes(property)
  }

  /**
   * Tell if the given extension name is valid, to respect the spec.
   * Should not be used outside CloudEvent.
   *
   * @private
   * @static
   * @param {!object|!string} name the name to check
   * @return {boolean} true if it's an extension name valid, otherwise false
   * @throws {TypeError} if name is not a string
   * @throws {Error} if name is undefined or null
   */
  static isExtensionNameValid (name) {
    if (V.isUndefinedOrNull(name)) throw new Error('Extension name undefined or null')
    if (!V.isString(name)) throw new TypeError('Extension name must be a string')
    return name.match(/^[a-z0-9]{1,20}$/)
  }

  /**
   * Tell if the given extension value is valid, to respect the spec.
   * Should not be used outside CloudEvent.
   *
   * @private
   * @static
   * @param {!string|!boolean|!number} value the object to check
   * @return {boolean} true if it's an extension value valid, otherwise false
   * @throws {Error} if value is undefined
   */
  static isExtensionValueValid (value) {
    if (V.isUndefined(value)) throw new Error('Extension value undefined')
    if (!V.isString(value) && !V.isBoolean(value) && !V.isNumber(value) && !V.isNull(value)) return false
    return true
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
        datacontenttype: { type: ['string', 'null'], minLength: 1 },
        data: { type: ['object', 'string', 'number', 'array', 'boolean', 'null'] },
        data_base64: { type: ['string', 'null'], contentEncoding: 'base64' },
        dataschema: { type: ['string', 'null'], format: 'uri', minLength: 1 },
        time: { type: ['string', 'null'], format: 'date-time', minLength: 1 },
        subject: { type: ['string', 'null'], minLength: 1 }
      },
      required: ['specversion', 'id', 'type', 'source'],
      additionalProperties: true // to handle data, and maybe other (non-standard) properties (extensions)
    }
  }

  /**
   * Tell the type of data of the CloudEvent,
   * if it's right (depending even on related datacontenttype),
   * from the validator point of view.
   *
   * @static
   * @param {!object} ce the CloudEvent to validate
   * @param {object} [options={}] optional validation options
   * @param {string} [name='data'] the name to assign in the returned error string (if any), or 'data' as default value
   * @return {string|null} error message if the given data type is not right, otherwise null
   * @throws {TypeError} if event is not a CloudEvent instance or subclass
   * @throws {Error} if event is undefined or null
   */
  static ensureTypeOfDataIsRight (ce, options = {}, name = 'data') {
    if (!CloudEvent.isCloudEvent(ce)) throw new TypeError('The given event is not a CloudEvent instance')
    let ve
    if (V.isUndefinedOrNull(ce.data)) {
      ve = null // it's impossible to verify its type
    } else if (ce.datacontenttype === CloudEvent.datacontenttypeDefault()) {
      ve = V.ensureIsObjectOrCollectionOrArrayNotValue(ce.data, name) || null
    } else {
      // for example with: datacontenttype 'text/plain':
      // ensure data is a plain object or collection,
      // or even a string or boolean or number in this case
      // because in serialization/deserialization some validation can occur on the transformed object
      ve = V.ensureIsObjectOrCollectionOrArrayOrValue(ce.data, name) || null
    }
    return ve
  }

  /**
   * Utility function that return a dump of validation results
   * on the given CloudEvent.
   *
   * @static
   * @param {(?object)} ce the CloudEvent object to dump
   * @param {object} [options={}] optional validation options
   * @param {string} [name='noname'] the name to assign in the returned string, or 'noname' as default value
   * @return {string} the dump of the object or a message when obj is undefined/null/not a CloudEvent
   */
  static dumpValidationResults (ce, options = {}, name = 'noname') {
    if (V.isUndefined(ce)) {
      return `${name}: undefined`
    } else if (V.isNull(ce)) {
      return `${name}: null`
    } else if (CloudEvent.isCloudEvent(ce)) {
      const opts = (options == null) ? {} : options
      const ve = CloudEvent.validateEvent(ce, opts)
      return `${name}: ${JSON.stringify(ve.map((i) => i.message))}`
    } else {
      return `${name}: 'is not a CloudEvent, no validation possible'`
    }
  }

  /**
   * Serialize the current CloudEvent.
   *
   * See {@link CloudEvent.serializeEvent}.
   *
   * @param {object} [options={}] optional serialization attributes:
   *        - encoder (function, default null) a function that takes data and returns encoded data,
   *        - encodedData (string, default null) already encoded data (but consistency with the datacontenttype is not checked),
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
   * @param {object} [options={}] containing:
   *        - strict (boolean, default false) to validate it in a more strict way,
   *        - dataschemavalidator (function(data, dataschema) boolean, optional) a function to validate data of current CloudEvent instance with its dataschema
   * @return {object[]} an array of (non null) validation errors, or at least an empty array
   */
  validate ({ strict = false, dataschemavalidator = null } = {}) {
    return this.constructor.validateEvent(this, { strict, dataschemavalidator })
  }

  /**
   * Tell the current CloudEvent, if it's valid.
   *
   * See {@link CloudEvent.isValidEvent}.
   *
   * @param {object} [options={}] containing:
   *        - strict (boolean, default false) to validate it in a more strict way,
   *        - dataschemavalidator (function(data, dataschema) boolean, optional) a function to validate data of current CloudEvent instance with its dataschema
   * @return {boolean} true if valid, otherwise false
   */
  isValid ({ strict = false, dataschemavalidator = null } = {}) {
    return this.constructor.isValidEvent(this, { strict, dataschemavalidator })
  }

  /**
   * Getter method to tell if data content type is a JSON-derived format,
   * so data must be encoded/decoded accordingly.
   *
   * See {@link CloudEvent.isDatacontenttypeJSONEvent}.
   *
   * @type {boolean}
   */
  get isDatacontenttypeJSON () {
    return this.constructor.isDatacontenttypeJSONEvent(this)
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
   * Getter method to return a copy of CloudEvent data attribute (or data_base64 if defined),
   * but transformed/decoded if possible.
   *
   * See {@link CloudEvent.data}, {@link CloudEvent.data_base64}.
   *
   * @type {(object|Map|Set|Array|string|boolean|number)}
   */
  get payload () {
    if (V.isDefinedAndNotNull(this.data) && !V.isDefinedAndNotNull(this.data_base64)) {
      if (this.isDatacontenttypeJSON) {
        try {
          return JSON.parse(this.data)
        } catch (e) {
          // fallback in case of bad data (not parseable)
          if (V.isString(this.data)) {
            return this.data.slice()
          } else if (V.isArray(this.data)) {
            return this.data.map((i) => i)
          } else {
            return { ...this.data }
          }
        }
        // end of this.isDatacontenttypeJSON
      } else if (V.isString(this.data)) {
        return this.data.slice()
      } else if (V.isArray(this.data)) {
        return this.data.map((i) => i)
      } else if (V.isBoolean(this.data) || V.isNumber(this.data)) {
        return this.data
      } else {
        return { ...this.data }
      }
    } else if (V.isDefinedAndNotNull(this.data_base64)) {
      return T.stringFromBase64(this.data_base64)
    }
    // else return the same empty object
    return this.data
  }

  /**
   * Getter method to tell if CloudEvent data is text or binary,
   * or unknown if not clear.
   *
   * @type {string}
   */
  get dataType () {
    if (V.isDefinedAndNotNull(this.data) && !V.isDefinedAndNotNull(this.data_base64)) {
      return 'Text'
    } else if (V.isDefinedAndNotNull(this.data_base64)) {
      return 'Binary'
    }
    // else return an unknown/wrong data type
    return 'Unknown'
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
   * Override the usual toString method,
   * to show a summary (only some info) on current instance.
   * Note that the representation of the 'data' attribute is
   * limited to 1024 chars (arbitrary limit, set here including the trim marker),
   * to avoid too much overhead with instances with a big 'data' attribute.
   *
   * See {@link Object.toString}.
   *
   * @return {string} a string representation for object instance
   */
  toString () {
    const payload = this.payload
    const payloadDump = T.dumpObject(payload, 'payload')
    let payloadSummary = (payloadDump.length < 1024) ? payloadDump : (payloadDump.substring(0, 1021) + '...')
    if (V.isString(payload)) {
      payloadSummary = payloadSummary + '\''
    }
    return `CloudEvent[specversion:${this.specversion}, id:'${this.id}', type:'${this.type}', source:'${this.source}', datacontenttype:'${this.datacontenttype}', ${payloadSummary}, ...]`
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
 * @readonly
 * @type {string[]}
 * @static
 */
CloudEvent.standardProps = [
  'specversion',
  'id', 'type', 'source', 'data',
  'time', 'data_base64', 'datacontenttype',
  'dataschema', 'subject'
]

module.exports = CloudEvent
