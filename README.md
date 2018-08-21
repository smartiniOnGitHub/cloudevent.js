# cloudevent.js

JavaScript/Node.js implementation of [CloudEvents](http://cloudevents.io/)


## Usage

```js
const CEClass = require('cloudevent.js')()

// create some sample not so good intances ...
const ceEmpty = new CEClass() // create a not valid CloudEvent instance (for the validator, when strict mode flag is enabled)
const ceMinimalMandatoryUndefinedNoStrict = new CEClass(undefined, undefined, undefined, { strict: false })
const ceMinimalMandatoryUndefinedStrict = new CEClass(undefined, undefined, undefined, { strict: true })

// create some sample minimal but good intances ...
const ceMinimal = new CEClass('1', // eventID
'org.fastify.plugins.cloudevents.testevent', // eventType
{} // data (empty) // optional, but useful the same in this sample usage
)

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
// create an instance with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
// note that null values are not handled by default values, only undefined values ...
const ceFull1 = new CEClass('1/full',
'org.fastify.plugins.cloudevents.testevent',
{ 'hello': 'world' }, // data
ceCommonOptions
)

// then, to validate objects, use class static methods like 'isValidEvent' and 'ValidateEvent', or instance methods like 'isValid', 'validate', etc ...

// etc ...
```

In the [example](./example/) folder there are some simple server scripts that uses the library  (inline but it's the same using it from npm registry).


## Requirements

Node.js 8.11.x or later.


## Note

You can find Code Documentation for the API of the library [here](https://smartiniongithub.github.io/cloudevent.js/).

See the CloudEvents Specification [here](https://github.com/cloudevents/spec).


## License

Licensed under [Apache-2.0](./LICENSE).

----
