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

const validators = require('./validators') // get validators from here

/**
 * Create a new instance of a CloudEvent object.
 * Must be called with the 'new' operator to return the new object instance.
 *
 * @see https://github.com/cloudevents/spec/blob/master/json-format.md
 *
 * @param {string} eventID the ID of the event (unique), mandatory
 * @param {string} eventType the type of the event (usually), mandatory
 * @param {object | Map | Set} data the real event data
 * @param {object} [{
 *   {string} cloudEventsVersion default '0.1',
 *   {string} eventTypeVersion optional,
 *   {uri} source default '/',
 *   {timestamp} eventTime = new Date(),
 *   {object} extensions optional but if given must contain at least 1 property (key/value),
 *   {string} contentType default 'application/json',
 *   {uri} schemaURL optional,
 *   {boolean} strict default false
 * }] optional attributes of the event; some has default values chosen here
 */
class CloudEvent {
  constructor (eventID, eventType, data, {
    cloudEventsVersion = '0.1',
    eventTypeVersion,
    source = '/',
    eventTime = new Date(),
    extensions,
    contentType = 'application/json',
    schemaURL,
    strict = false } = {}
  ) {
    // console.log(`DEBUG - eventID = ${eventID}, eventType = ${eventType}, data = ${data}, { strict = ${strict}, ... }`)
    // TODO: try to log data using toSource, with something like: (x !== null) ? x.toSource() : 'null', but handle even undefined values ... or maybe add an utility function for this (like dumpSource and maybe even dumpSourceOrElse), and call here ... but cleanup of previous commented line later ... ok
    console.log(`DEBUG - ${CloudEvent.dumpObject(eventID, 'eventID')}, ${CloudEvent.dumpObject(eventType, 'eventType')}, ${CloudEvent.dumpObject(data, 'data')}, { strict = ${strict}, ... }`)
    if (strict === true) {
      if (!eventID || !eventType) {
        throw new Error('Unable to create CloudEvent instance, mandatory field missing')
      }
    }

    this.eventID = eventID
    this.eventType = eventType
    this.data = data

    this.cloudEventsVersion = cloudEventsVersion
    this.contentType = contentType
    this.eventTime = eventTime
    this.eventTypeVersion = eventTypeVersion
    this.extensions = extensions
    this.schemaURL = schemaURL
    this.source = source

    this.strict = strict // could be useful ...
  }

  /**
   * Utility function that return a dump of the given object.
   *
   * @static
   * @param {object | Map | Set} obj the object to dump
   * @param {string} name the name to assign in the returned string
   * @returns string, the dump of the object or a message when obj is undefined/null/not an object
   * @memberof CloudEvent
   */
  static dumpObject (obj, name) {
    if (validators.isUndefined(obj)) {
      return `${name}: undefined`
    } else if (validators.isNull(obj)) {
      return `${name}: null`
    } else if (!validators.isObjectOrCollection(obj)) {
      return `${name}: '${obj.toString()}'`
    } else {
      return `${name}: ${obj.toSource()}'`
    }
  }

  /**
   * Return the MIME Type for a CloudEvent
   *
   * @static
   * @returns a string with the value
   * @memberof CloudEvent
   */
  static mediaType () {
    return 'application/cloudevents+json'
  }

  /**
   * Validate the given CloudEvent.
   *
   * @static
   * @param {object} event the CloudEvent to validate
   * @param {object} [{
   *   {boolean} strict default false, to validate it in a more strict way
   * }] options, optional
   * @returns an array of (non null) validation errors, or at least an empty array
   * @memberof CloudEvent
   */
  static validateEvent (event, { strict = false } = {}) {
    // console.log(`DEBUG - cloudEvent = ${event}, { strict = ${strict}, ... }`)
    if (validators.isUndefinedOrNull(event)) {
      return [new Error('CloudEvent undefined or null')]
    }
    let ve = [] // validation errors

    // standard validation
    ve.push(validators.ensureIsStringNotEmpty(event.cloudEventsVersion, 'cloudEventsVersion'))
    ve.push(validators.ensureIsStringNotEmpty(event.eventID, 'eventID'))
    ve.push(validators.ensureIsStringNotEmpty(event.eventType, 'eventType'))
    // no check here because I assign a default value, and I check in strict mode ... ok
    // if (validators.isDefinedAndNotNull(event.data)) {
    // ve.push(validators.ensureIsObjectOrCollectionNotString(event.data, 'data'))
    // }
    if (validators.isDefinedAndNotNull(event.eventTypeVersion)) {
      ve.push(validators.ensureIsStringNotEmpty(event.eventTypeVersion, 'eventTypeVersion'))
    }
    // no check here because I assign a default value, and I check in strict mode ... ok
    // if (validators.isDefinedAndNotNull(event.source)) {
    // ve.push(validators.ensureIsStringNotEmpty(event.source, 'source')) // keep commented here ... ok
    // }
    // no check here because I assign a default value, and I check in strict mode ... ok
    // ve.push(validators.ensureIsDateValid(event.eventTime, 'eventTime'))
    // no check here because I assign a default value, and I check in strict mode ... ok
    // if (validators.isDefinedAndNotNull(event.extensions)) {
    //   ve.push(validators.ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
    // }
    // no check here because I assign a default value, and I check in strict mode ... ok
    // ve.push(ensureIsStringNotEmpty(event.contentType, 'contentType'))
    if (validators.isDefinedAndNotNull(event.schemaURL)) {
      ve.push(validators.ensureIsStringNotEmpty(event.schemaURL, 'schemaURL'))
    }

    // additional validation if strict mode enabled, or if enabled in the event ...
    if (strict === true || event.strict === true) {
      ve.push(validators.ensureIsVersion(event.cloudEventsVersion, 'cloudEventsVersion'))
      if (validators.isDefinedAndNotNull(event.data)) {
        ve.push(validators.ensureIsObjectOrCollectionNotString(event.data, 'data'))
      }
      if (validators.isDefinedAndNotNull(event.eventTypeVersion)) {
        ve.push(validators.ensureIsVersion(event.eventTypeVersion, 'eventTypeVersion'))
      }
      ve.push(validators.ensureIsURI(event.source, 'source'))
      if (validators.isDefinedAndNotNull(event.extensions)) {
        ve.push(validators.ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
        const extensionsSize = validators.getSize(event.extensions)
        if (extensionsSize < 1) {
          ve.push(new Error(`The object 'extensions' must contain at least 1 property`))
        }
      }
      ve.push(validators.ensureIsDatePast(event.eventTime, 'eventTime'))
      ve.push(validators.ensureIsStringNotEmpty(event.contentType, 'contentType'))
      ve.push(validators.ensureIsURI(event.schemaURL, 'schemaURL'))
    }

    return ve.filter((i) => i)
  }

  /**
   * Tell the given CloudEvent, if it's valid.
   *
   * @static
   * @param {object} event the CloudEvent to validate
   * @param {object} [{
   *   {boolean} strict default false, to check its validation in a more strict way
   * }] options, optional
   * @returns true if valid, otherwise false
   * @memberof CloudEvent
   */
  static isValidEvent (event, { strict = false } = {}) {
    // console.log(`DEBUG - cloudEvent details: eventID = ${event.eventID}, eventType = ${event.eventType}, data = ${event.data}, ..., strict = ${event.strict}`)
    const validationErrors = CloudEvent.validateEvent(event, { strict })
    const size = validators.getSize(validationErrors)
    // console.log(`DEBUG - isValid: validationErrors = ${validationErrors}, size = ${size}`)
    return (size === 0)
  }

  /**
   * Validate the current CloudEvent.
   *
   * @param {object} [{
   *   {boolean} strict default false, to validate it in a more strict way
   * }] options, optional
   * @returns an array of (non null) validation errors, or at least an empty array
   * @memberof CloudEvent
   */
  validate ({ strict = false } = {}) {
    return CloudEvent.validateEvent(this, { strict })
  }

  /**
   * Tell the current CloudEvent, if it's valid.
   *
   * @param {object} [{
   *   {boolean} strict default false, to check its validation in a more strict way
   * }] options, optional
   * @returns true if valid, otherwise false
   * @memberof CloudEvent
   */
  isValid ({ strict = false } = {}) {
    return CloudEvent.isValid(this, { strict })
  }
}

// TODO: here in strict mode verify even if it would be gpod to check for the right instanceof type, but ensure it works even when using inheritance ... wip

module.exports = CloudEvent
