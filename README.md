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
  'org.github.smartiniOnGitHub.cloudeventjs.testevent', // eventType
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
const ceCommonOptionsStrict = {...ceCommonOptions, strict: true }
// create some instances with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
// note that null values are not handled by default values, only undefined values ...
const ceFull = new CloudEvent('1/full',
  'org.github.smartiniOnGitHub.cloudeventjs.testevent',
  { 'hello': 'world' }, // data
  ceCommonOptions
)
assert(ceFull !== null)
assert(!ceFull.isStrict)
const ceFullStrict = new CloudEvent('2/full-strict',
  'org.github.smartiniOnGitHub.cloudeventjs.testevent',
  { 'hello': 'world' }, // data
  ceCommonOptionsStrict // use common options, but set strict mode to true
)
assert(ceFullStrict !== null)
assert(ceFullStrict.isStrict)
assert(!ceFull.isStrict) // ensure common options object has not been changed when reusing some of its values for the second instance

// then, to validate objects, use class static methods like 'isValidEvent' and 'ValidateEvent', or instance methods like 'isValid', 'validate', etc ...
assert(!ceEmpty.isValid())
assert(!ceMinimalMandatoryUndefinedNoStrict.isValid())
assert(ceMinimal.isValid())
assert(ceFull.isValid())
assert(ceFullStrict.isValid())
// TODO: other validations, even from static methods ...

// serialization examples
// TODO: ...

// etc ...
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
