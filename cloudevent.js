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

const validators = require('./validators') // get validators from here

class CloudEvent {
  // TODO: debug even using obj.toSource() utility function ...
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
    // TODO: try to log data using toSource, with something like: (x !== null) ? x.toSource() : 'null', but handle even undefined values ... or maybe add an utility function for this (like dumpSource and maybe even dumpSourceOrElse), and call here ... but cleanup of previous commented line later ... wip
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

  static mediaType () {
    return 'application/cloudevents+json'
  }

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

  static isValidEvent (event, { strict = false } = {}) {
    // console.log(`DEBUG - cloudEvent details: eventID = ${event.eventID}, eventType = ${event.eventType}, data = ${event.data}, ..., strict = ${event.strict}`)
    const validationErrors = CloudEvent.validateEvent(event, { strict })
    const size = validators.getSize(validationErrors)
    // console.log(`DEBUG - isValid: validationErrors = ${validationErrors}, size = ${size}`)
    return (size === 0)
  }

  // TODO: add other methods, but remove the event argument in this case ... better, check how to define these functions static, then call them in methods with this ... ok, then test all them
  validate ({ strict = false } = {}) {
    return CloudEvent.validateEvent(this, { strict })
  }

  isValid ({ strict = false } = {}) {
    return CloudEvent.isValid(this, { strict })
  }
}
// TODO: chek if add methods validate and isValid even as static methods (to work on a given event) ... ok

// TODO: here in strict mode verify even if it would be gpod to check for the right instanceof type, but ensure it works even when using inheritance ... wip

module.exports = CloudEvent
