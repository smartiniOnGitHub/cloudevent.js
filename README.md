# cloudevent.js

JavaScript/Node.js implementation of [CloudEvents](http://cloudevents.io/)


## Usage

```js
// Node.js example

// get a reference to the library
const CloudEvent = require('cloudevent.js')

// create some sample instances but without mandatory fields (for validation) ...
const ceEmpty = new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
assert(ceEmpty !== null)
const ceMinimalMandatoryUndefinedNoStrict = new CloudEvent(undefined, undefined, undefined, { strict: false }) // expected success
assert(ceMinimalMandatoryUndefinedNoStrict !== null)
const ceMinimalMandatoryUndefinedStrict = new CloudEvent(undefined, undefined, undefined, { strict: true }) // expected failure
// assert(ceMinimalMandatoryUndefinedStrict == null) // no, ReferenceError: ceMinimalMandatoryUndefinedStrict is not defined

// create some sample minimal instances, good even for validation ...
const ceMinimal = new CloudEvent('1', // eventID
  'com.github.smartiniOnGitHub.cloudeventjs.testevent', // eventType
  {} // data (empty) // optional, but useful the same in this sample usage
)
assert(ceMinimal !== null)

// create some instance with all attributes ...
// could be useful to define some common attributes
const ceCommonOptions = {
  cloudEventsVersion: '0.0.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: new Date(),
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false // same as default
}
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
// create some instances with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
// note that null values are not handled by default values, only undefined values ...
const ceFull = new CloudEvent('1/full',
  'com.github.smartiniOnGitHub.cloudeventjs.testevent',
  { 'hello': 'world' }, // data
  ceCommonOptions
)
assert(ceFull !== null)
assert(!ceFull.isStrict)
const ceFullStrict = new CloudEvent('2/full-strict',
  'com.github.smartiniOnGitHub.cloudeventjs.testevent',
  { 'hello': 'world' }, // data
  ceCommonOptionsStrict // use common options, but set strict mode to true
)
assert(ceFullStrict !== null)
assert(ceFullStrict.isStrict)
assert(!ceFull.isStrict) // ensure common options object has not been changed when reusing some of its values for the second instance
assert(!CloudEvent.isStrictEvent(ceFull)) // the same, but using static method

// then, to validate objects, use class static methods like 'isValidEvent' and 'ValidateEvent', or instance methods like 'isValid', 'validate', etc ...
assert(!ceEmpty.isValid())
assert(!ceMinimalMandatoryUndefinedNoStrict.isValid())
assert(ceMinimal.isValid())
assert(ceFull.isValid())
assert(ceFullStrict.isValid())
// the same, but using static method
assert(!CloudEvent.isValidEvent(ceEmpty))
assert(!CloudEvent.isValidEvent(ceMinimalMandatoryUndefinedNoStrict))
assert(CloudEvent.isValidEvent(ceMinimal))
assert(CloudEvent.isValidEvent(ceFull))
assert(CloudEvent.isValidEvent(ceFullStrict))
assert(CloudEvent.validateEvent(ceEmpty).length > 0)
assert(CloudEvent.validateEvent(ceEmpty, { strict: true }).length > 0)
assert(CloudEvent.validateEvent(ceMinimalMandatoryUndefinedNoStrict).length > 0)
assert(CloudEvent.validateEvent(ceMinimal).length === 0)
assert(CloudEvent.validateEvent(ceFull).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)
assert(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)
// some diagnostic info
console.log(`Validation output for ceEmpty, default strict mode is: size: ${CloudEvent.validateEvent(ceEmpty).length}, details:\n` + CloudEvent.validateEvent(ceEmpty))
console.log(`Validation output for ceEmpty, force strict mode to true is size: ${CloudEvent.validateEvent(ceEmpty, { strict: true }).length}, details:\n` + CloudEvent.validateEvent(ceEmpty, { strict: true }))

// serialization examples
const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
assert(ceFullSerializedStatic !== null)
const ceFullSerialized = ceFull.serialize()
assert(ceFullSerialized !== null)
assert(ceFullSerializedStatic === ceFullSerialized)
// some diagnostic info
console.log(`Serialization output for ceFull, details:\n` + ceFullSerialized)

// etc ...

// end of script
```

Look into the [example](./example/) folder for more sample scripts that uses the library (inline but it's the same using it from npm registry).


## Requirements

Node.js 8.11.x or later.


## Note

Note that in this implementation there is even the ability to validate CloudEvent instances in a stricter way, by setting to true the attribute 'strict' in options in costructor options; or specify it during validation.
That attribute when set will be put in the 'extensions' standard attribute of a CloudEvent.

You can find Code Documentation for the API of the library [here](https://smartiniongithub.github.io/cloudevent.js/).

See the CloudEvents Specification [here](https://github.com/cloudevents/spec).


## License

Licensed under [Apache-2.0](./LICENSE).

----
