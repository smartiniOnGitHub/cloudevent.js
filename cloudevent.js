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

// const validators = require('./validators') // get validators from here

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

  // TODO: add other methods, but remove the event argument in this case ... better, check how to define these functions static, then call them in methods with this ... wip
  // function validate({ strict = false } = {}) {
  // function isValid({ strict = false } = {}) {
}

// TODO: chek if add methods validate and isValid even as static methods (to work on a given event) ... wip
// TODO: here in strict mode verify even if it would be gpod to check for the right instanceof type ... wip

module.exports = CloudEvent
