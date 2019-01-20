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
 * Get a reference to cloudevent validator class.
 */
const V = require('./validator') // get validator from here

/**
 * CloudEvent implementation.
 *
 * @see https://github.com/cloudevents/spec/blob/master/json-format.md
 */
class CloudEvent {
  /**
   * Create a new instance of a CloudEvent object.
   * @param {!string} eventID the ID of the event (unique), mandatory
   * @param {!string} eventType the type of the event (usually), mandatory
   * @param {!uri} source the source uri of the event (use '/' if empty), mandatory
   * @param {(object|Map|Set)} data the real event data
   * @param {object} options optional attributes of the event; some has default values chosen here:
   *        eventTypeVersion (string) optional,
   *        eventTime (timestamp, default now),
   *        extensions (object) optional but if given must contain at least 1 property (key/value),
   *        contentType (string, default 'application/json') tell how the data attribute must be encoded,
   *        schemaURL (uri) optional,
   *        strict (boolean, default false) tell if object instance will be validated in a more strict way
   * @throws {Error} if strict is true and eventID or eventType is undefined or null
   */
  constructor (eventID, eventType, source, data, {
    eventTypeVersion,
    eventTime = new Date(),
    extensions,
    contentType = 'application/json',
    schemaURL,
    strict = false } = {}
  ) {
    if (strict === true) {
      if (!eventID || !eventType || !source) {
        throw new Error('Unable to create CloudEvent instance, mandatory field missing')
      }
    }

    /**
     * The event ID.
     * @type {string}
     * @private
     */
    this.eventID = eventID
    /**
     * The event type.
     * @type {string}
     * @private
     */
    this.eventType = eventType
    /**
     * The source URI of the event.
     * @type {uri}
     * @private
     */
    this.source = source
    /**
     * The real event data.
     * Usually it's an object, but could be even a Map or a Set.
     * Copy the original object to avoid changing objects that could be shared.
     * @type {(object|Map|Set)}
     * @private
     */
    this.data = { ...data }
    if (V.isString(data)) {
      // handle an edge case: if the given data is a String, I need to clone in a different way ...
      this.data = data.slice()
    }

    /**
     * The CloudEvent specification version.
     * @type {string}
     * @private
     */
    this.cloudEventsVersion = this.constructor.version()
    /**
     * The MIME Type for the encoding of the data attribute, when serialized.
     * @type {string}
     * @private
     */
    this.contentType = contentType
    /**
     * The event timestamp.
     * Copy the original object to avoid changing objects that could be shared.
     * @type {timestamp}
     * @private
     */
    this.eventTime = new Date(eventTime.valueOf())
    /**
     * The event version.
     * @type {string}
     * @private
     */
    this.eventTypeVersion = eventTypeVersion
    /**
     * Extensions defined for the event.
     * Copy the original object to avoid changing objects that could be shared.
     * @type {object}
     * @private
     */
    this.extensions = { ...extensions }
    /**
     * The URL of schema for the event, if any.
     * @type {uri}
     * @private
     */
    this.schemaURL = schemaURL

    // add strict to extensions, but only when defined
    if (strict === true) {
      this.extensions = this.extensions || {}
      this.extensions.strict = strict
    }
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
   * Return the version of the CloudEvent Specification implemented here
   *
   * @static
   * @return {string} the value
   */
  static version () {
    return '0.1'
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
   * Tell if the object has the strict flag enabled.
   *
   * @static
   * @param {!object} event the CloudEvent to validate
   * @return {boolean} true if strict, otherwise false
   * @throws {Error} if event if undefined or null
   */
  static isStrictEvent (event) {
    if (V.isUndefinedOrNull(event)) {
      throw new Error('CloudEvent undefined or null')
    }
    if (V.isDefinedAndNotNull(event.extensions)) {
      return event.extensions.strict === true
    } else {
      return false
    }
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
    let ve = [] // validation errors

    // standard validation
    // note that some properties are not checked here because I assign a default value, and I check them in strict mode, like:
    // data, eventTime, extensions, contentType ...
    // ve.push(V.ensureIsStringNotEmpty(event.cloudEventsVersion, 'cloudEventsVersion')) // no more a public attribute
    ve.push(V.ensureIsStringNotEmpty(event.eventID, 'eventID'))
    ve.push(V.ensureIsStringNotEmpty(event.eventType, 'eventType'))
    ve.push(V.ensureIsStringNotEmpty(event.source, 'source'))
    if (V.isDefinedAndNotNull(event.eventTypeVersion)) {
      ve.push(V.ensureIsStringNotEmpty(event.eventTypeVersion, 'eventTypeVersion'))
    }
    if (V.isDefinedAndNotNull(event.schemaURL)) {
      ve.push(V.ensureIsStringNotEmpty(event.schemaURL, 'schemaURL'))
    }

    // additional validation if strict mode enabled, or if enabled in the event ...
    if (strict === true || CloudEvent.isStrictEvent(event) === true) {
      ve.push(V.ensureIsClass(event, CloudEvent, 'CloudEvent_Subclass'))
      ve.push(V.ensureIsVersion(event.cloudEventsVersion, 'cloudEventsVersion'))
      if (V.isDefinedAndNotNull(event.data)) {
        ve.push(V.ensureIsObjectOrCollectionNotString(event.data, 'data'))
      }
      if (V.isDefinedAndNotNull(event.eventTypeVersion)) {
        ve.push(V.ensureIsVersion(event.eventTypeVersion, 'eventTypeVersion'))
      }
      ve.push(V.ensureIsURI(event.source, 'source'))
      if (V.isDefinedAndNotNull(event.extensions)) {
        ve.push(V.ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
        const extensionsSize = V.getSize(event.extensions)
        if (extensionsSize < 1) {
          ve.push(new Error(`The object 'extensions' must contain at least 1 property`))
        }
      }
      ve.push(V.ensureIsDatePast(event.eventTime, 'eventTime'))
      ve.push(V.ensureIsStringNotEmpty(event.contentType, 'contentType'))
      ve.push(V.ensureIsURI(event.schemaURL, 'schemaURL'))
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
   * Serialize the given CloudEvent in JSON format.
   * Note that here standard serialization to JSON is used (no additional libraries).
   * Note that the result of encoder function is assigned to encoded data.
   *
   * @param {!object} event the CloudEvent to serialize
   * @param {object} options optional serialization attributes:
   *        encoder (function, default null) a function that takes data and returns encoded data,
   *        encodedData (string, default null) already encoded data (but consistency with the contentType is not checked),
   * @return {string} the serialized event, as a string
   */
  static serializeEvent (event, { encoder, encodedData } = {}) {
    if (V.isUndefinedOrNull(event)) {
      throw new Error('CloudEvent undefined or null')
    }
    if (event.contentType === 'application/json') {
      return JSON.stringify(event)
    }
    // else
    if (V.isDefinedAndNotNull(encoder)) {
      if (!V.isFunction(encoder)) {
        throw new Error(`Missing or wrong encoder function: '${encoder}' for the given content type: '${event.contentType}'.`)
      }
      encodedData = encoder(event.payload)
    } else {
      // encoder not defined
      if (!V.isDefinedAndNotNull(encodedData)) {
        throw new Error(`Missing encoder function: use encoder function or encoded data with the given content type: '${event.contentType}'.`)
      }
    }
    if (!V.isStringNotEmpty(encodedData)) {
      throw new Error(`Missing or wrong encoded data: '${encodedData}' for the given content type: '${event.contentType}'.`)
    }
    return JSON.stringify({ ...event, data: encodedData })
  }

  /**
   * Get the JSON Schema for a CloudEvent.
   * Note that it's not used in standard serialization to JSON,
   * but only in some serialization libraries.
   *
   * See JSON Schema.
   *
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
        cloudEventsVersion: { type: 'string' },
        eventID: { type: 'string' },
        eventType: { type: 'string' },
        // data: { type: 'object' },
        eventTypeVersion: { type: 'string' },
        source: { type: 'string' },
        eventTime: { type: 'string' },
        // extensions: { type: 'object' },
        contentType: { type: 'string' },
        // TODO: use if/then/else on contentType ... wip
        schemaURL: { type: 'string' }
      },
      required: ['cloudEventsVersion', 'eventID', 'eventType',
        'source', 'contentType'
      ],
      additionalProperties: true // to handle data, extensions, and maybe other (non-standard) properties
    }
  }

  /**
   * Serialize the current CloudEvent.
   *
   * See {@link CloudEvent.serializeEvent}.
   *
   * @param {object} options optional serialization attributes:
   *        encoder (function, default null) a function that takes data and returns encoded data,
   *        encodedData (string, default null) already encoded data (but consistency with the contentType is not checked),
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
    return { ...this.data }
  }

  /**
   * Override the usual toString method.
   *
   * See {@link Object.toString}.
   *
   * @return {string} a string representation for object instance
   */
  toString () {
    return `CloudEvent[cloudEventsVersion: ${this.cloudEventsVersion}, ${this.constructor.dumpObject(this.eventID, 'eventID')}, ${this.constructor.dumpObject(this.eventType, 'eventType')}, ${this.constructor.dumpObject(this.data, 'data')}, ...]`
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

module.exports = CloudEvent
