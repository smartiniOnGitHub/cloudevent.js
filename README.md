# cloudevent / cloudevent.js

  [![NPM Version](https://img.shields.io/npm/v/cloudevent.svg?style=flat)](https://npmjs.org/package/cloudevent/)
  [![NPM Downloads](https://img.shields.io/npm/dm/cloudevent.svg?style=flat)](https://npmjs.org/package/cloudevent/)
  [![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Coverage Status](https://coveralls.io/repos/github/smartiniOnGitHub/cloudevent.js/badge.svg?branch=master)](https://coveralls.io/github/smartiniOnGitHub/cloudevent.js/?branch=master)
  [![dependencies Status](https://david-dm.org/smartiniOnGitHub/cloudevent.js/status.svg)](https://david-dm.org/smartiniOnGitHub/cloudevent.js)
  [![devDependencies Status](https://david-dm.org/smartiniOnGitHub/cloudevent.js/dev-status.svg)](https://david-dm.org/smartiniOnGitHub/cloudevent.js?type=dev)
  [![Known Vulnerabilities](https://snyk.io//test/github/smartiniOnGitHub/cloudevent.js/badge.svg?targetFile=package.json)](https://snyk.io//test/github/smartiniOnGitHub/cloudevent.js?targetFile=package.json)
  [![license - APACHE-2.0](https://img.shields.io/npm/l/cloudevent.svg)](http://opensource.org/licenses/APACHE-2.0)

JavaScript/Node.js implementation of [CloudEvents](http://cloudevents.io/)

Current release implements the v1.0 of the CloudEvents Spec.

The purpose of this library is to create instances of CloudEvents in a simple way 
(with some useful defaults), or in a full way (all attributes).
Optional, it's possible to validate created instances to be sure they are compliant with the standard.

Then, created instances can be serialized, for example to be sent (or saved/stored) somewhere.

Note that many features are exposed directly by the CloudEvent class with standard class instance 
methods, and even as class static methods (that operates on a given CloudEvent).
Anyway, to be more future-proof the library now exports a main object, with all features inside 
(the class for CloudEvent, its Validator class as CloudEventValidator, etc); 
using destructuring assignment (as seen in code samples) usage will be easier.


## Usage

Get a reference to the library:

```js
// Node.js example

// reference the library, not needed if using destructuring assignment, see below
const CloudEventExports = require('cloudevent')

// minimal, most common usage
// const { CloudEvent } = require('cloudevent')
// other, get more objects exposed by the library
const { CloudEvent, CloudEventValidator: V, CloudEventTransformer: T } = require('cloudevent')
assert(CloudEvent !== null && V !== null && T !== null)
```

create some sample CloudEvent instances:

```js
// create some sample instances but without mandatory fields (so not good for validation) ...
// note that errors will be thrown at instance creation only when strict mode is true
const ceEmpty = new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
const ceMinimalMandatoryUndefinedNoStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: false }) // expected success
const ceMinimalMandatoryUndefinedStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true }) // expected failure, so ceMinimalMandatoryUndefinedStrict will not be defined

// define some common attributes
const ceCommonOptions = {
  time: new Date(), // same as default
  datacontenttype: 'application/json',
  dataschema: 'http://my-schema.localhost.localdomain/v1/',
  subject: 'subject',
  strict: false // same as default
}
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
const ceCommonExtensions = { exampleextension: 'value' }
const ceNamespace = 'com.github.smartiniOnGitHub.cloudeventjs.testevent-v1.0.0'
const ceServerUrl = '/test'
const ceCommonData = { hello: 'world', year: 2020, enabled: true }
const ceDataAsJSONString = '{ "hello": "world", "year": 2020, "enabled": true }'
const ceDataAsString = 'Hello World, 2020'
const ceDataEncoded = 'SGVsbG8gV29ybGQsIDIwMjA='

// create a sample minimal instance ...
const ceMinimal = new CloudEvent('1', // id
  ceNamespace, // type
  '/', // source
  {} // data (empty) // optional, but useful the same in this sample usage
)

// When creating some instances with an undefined mandatory argument (handled by defaults),
// but with strict flag disabled success is expected, otherwise with strict flag enabled a failure is expected ...
// In JavaScript, null values are not handled as default values, only undefined values ...

// create a sample instance with most common attributes defined ...
const ceFull = new CloudEvent('1/full',
  ceNamespace,
  ceServerUrl,
  ceCommonData, // data
  ceCommonOptions,
  ceCommonExtensions
)
const ceFullStrict = new CloudEvent('2/full-strict',
  ceNamespace,
  ceServerUrl,
  ceCommonData, // data
  ceCommonOptionsStrict, // use common options, but set strict mode to true
  ceCommonExtensions
)
assert(ceFullStrict.isStrict)
assert(!ceFull.isStrict) // ensure common options object has not been changed when reusing some of its values for the second instance
assert(!CloudEvent.isStrictEvent(ceFull)) // the same, but using static method
// create an instance with a JSON string as data
const ceFullStrictJSONTextData = new CloudEvent('2/full-strict-json-string-data',
  ceNamespace,
  ceServerUrl,
  ceDataAsJSONString, // data
  ceCommonOptionsStrict, // use strict options
  ceCommonExtensions
)
assert(ceFullStrictJSONTextData !== null)
assert(ceFullStrictJSONTextData.isStrict)
// create an instance that wrap an Error
const error = new Error('sample error')
error.code = 1000 // add a sample error code, as number
const errorToData = T.errorToData(error, {
  includeStackTrace: true,
  // addStatus: false,
  addTimestamp: true
})
const ceErrorStrict = new CloudEvent('3/error-strict',
  ceNamespace,
  ceServerUrl,
  errorToData, // data
  ceCommonOptionsStrict, // use common options, but set strict mode to true
  ceCommonExtensions
)
assert(ceErrorStrict !== null)
assert(ceErrorStrict.isStrict)
assert(!ceErrorStrict.isStrict) // ensure common options object has not been changed when reusing some of its values for the second instance
assert(!CloudEvent.isStrictEvent(ceErrorStrict)) // the same, but using static method
// create an instance with a different content type
const ceFullStrictOtherContentType = new CloudEvent('4/full-strict-other-content-type',
  ceNamespace,
  ceServerUrl,
  ceCommonData, // data
  { ...ceCommonOptionsStrict, datacontenttype: 'application/xml' }, // use common strict options, but set strict mode to true
  ceCommonExtensions
)
assert(ceFullStrictOtherContentType !== null)
assert(ceFullStrictOtherContentType.isStrict)
// create an instance with data as a string, but not strict (to validate it even in strict mode)
const ceFullTextData = new CloudEvent('5/no-strict-text-data',
  ceNamespace,
  ceServerUrl,
  ceDataAsString, // data
  ceCommonOptions, // use common options
  ceCommonExtensions
)
assert(ceFullTextData !== null)
assert(!ceFullTextData.isStrict)
assert(ceFullTextData.payload === ceDataAsString) // returned data is transformed
// create an instance with data encoded in base64
const ceFullStrictBinaryData = new CloudEvent('6/full-strict-binary-data',
  ceNamespace,
  ceServerUrl,
  null, // data
  { ...ceCommonOptionsStrict, datainbase64: ceDataEncoded }, // use common strict options, and set binary data in base64
  ceCommonExtensions
)
assert(ceFullStrictBinaryData !== null)
assert(ceFullStrictBinaryData.isStrict)
assert(ceFullStrictBinaryData.payload === ceDataAsString) // returned data is transformed
```

optional, do some validations/checks on created instances.
As sample, use class static methods like 'isValidEvent' and 'ValidateEvent', 
or instance methods like 'isValid', 'validate', etc ...

```js
assert(!ceEmpty.isValid())
assert(!ceMinimalMandatoryUndefinedNoStrict.isValid())
assert(ceMinimal.isValid())
assert(ceFull.isValid())
assert(ceFullStrict.isValid())
assert(ceErrorStrict.isValid())
assert(ceFullStrictOtherContentType.isValid())
// etc ...

console.log(`Validation on ceEmpty: isValid: ${ceEmpty.isValid()}`)

console.log(`Validation output for ceEmpty, default strict mode is: size: ${CloudEvent.validateEvent(ceEmpty).length}, details:\n` + CloudEvent.validateEvent(ceEmpty))
console.log(`Validation output for ceEmpty, force strict mode to true is size: ${CloudEvent.validateEvent(ceEmpty, { strict: true }).length}, details:\n` + CloudEvent.validateEvent(ceEmpty, { strict: true }))
```

serialization examples:

```js
// default contenttype
const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
const ceFullSerialized = ceFull.serialize()
console.log('Serialization output for ceFull, details:\n' + ceFullSerialized)
const ceFullStrictSerialized = ceFullStrict.serialize()
console.log('Serialization output for ceFullStrict, details:\n' + ceFullStrictSerialized)
// non default contenttype
const ceFullStrictOtherContentTypeSerializedStatic = CloudEvent.serializeEvent(ceFullStrictOtherContentType, {
  // encoder: (data) => '<data "encoder"="sample" />',
  encodedData: '<data "hello"="world" "year"="2020" />',
  onlyValid: true
})
const ceFullStrictOtherContentTypeSerialized = ceFullStrictOtherContentType.serialize({
  // encoder: (data) => '<data "encoder"="sample" />',
  encodedData: '<data "hello"="world" "year"="2020" />',
  onlyValid: true
})
console.log('Serialization output for ceFullStrictOtherContentType, details:\n' + ceFullStrictOtherContentTypeSerialized)

// then use (send/store/etc) serialized instances ...

```

deserialization (parse) examples:

```js
// deserialization examples
// default contenttype
console.log('\nSome deserialization/parse examples:')
const ceFullDeserialized = CloudEvent.deserializeEvent(ceFullSerialized)
assert(ceFullDeserialized !== null)
assert(ceFullDeserialized.isValid())
assert(!ceFullDeserialized.isStrict)
assert(CloudEvent.isCloudEvent(ceFullDeserialized))
console.log(`cloudEvent dump: ${T.dumpObject(ceFullDeserialized, 'ceFullDeserialized')}`)
const ceFullStrictDeserializedOnlyValid = CloudEvent.deserializeEvent(ceFullStrictSerialized, { onlyValid: true })
assert(ceFullStrictDeserializedOnlyValid !== null)
console.log(`cloudEvent dump: ${T.dumpObject(ceFullStrictDeserializedOnlyValid, 'ceFullStrictDeserializedOnlyValid')}`)
// non default contenttype
const ceFullStrictOtherContentTypeDeserialized = CloudEvent.deserializeEvent(ceFullStrictOtherContentTypeSerialized, {
  // decoder: (data) => { decoder: 'Sample' },
  decodedData: { hello: 'world', year: 2020 },
  onlyValid: true
})
assert(ceFullStrictOtherContentTypeDeserialized !== null)
assert(ceFullStrictOtherContentTypeDeserialized.isValid())
assert(ceFullStrictOtherContentTypeDeserialized.isStrict)
assert(CloudEvent.isCloudEvent(ceFullStrictOtherContentTypeDeserialized))
console.log(`cloudEvent dump: ${T.dumpObject(ceFullStrictOtherContentTypeDeserialized, 'ceFullStrictOtherContentTypeDeserialized')}`)

// then use (validate/send/store/etc) deserialized instances ...

```

Look into the [example](./example/) folder for more sample scripts that uses the library 
(inline but it's the same using it from npm registry); 
you can find even examples for using JSONBatch objects (array of CloudEvent instances).


## Requirements

Node.js 10 LTS (but recommended 10.23.1) or later.


## Sources

Source code is all inside main repo:
[cloudevent.js](https://github.com/smartiniOnGitHub/cloudevent.js/).

Documentation generated from source code (library API):
[here](https://smartiniongithub.github.io/cloudevent.js/).


## Note

Note that in this implementation there is even the ability to validate CloudEvent instances 
in a stricter way, by setting to true the attribute 'strict' in constructor options; 
that attribute (when set) will be put in the extensions of the instance.
Otherwise you can specify it only during validation, in validation options.

See the CloudEvents Specification [here](https://github.com/cloudevents/spec).

In the past the name for this package was 'cloudevent.js', but it has been deprecated now 
and changed to the simpler 'cloudevent', so it will be easier to get it at npm.

Since v0.2 of the spec, there is no more a standard attribute to specify the version 
of any specific event type, so the best if to follow their recommendations, 
and for example add a version in the 'type' attribute 
(for example '-v1.0.0' at the end of its base value, or at the end of its full value), 
or into the 'schemaurl' attribute but only its major version 
(like '-v1' or '/v1/' at the end).
Since v0.3 of the spec, there is no more a standard attribute for extensions, 
so they are merged into usual properties (but must not use names 
of standard properties); a best practice is to use reverse-DNS name 
but without dots, so like 'com_github_smartiniOnGitHub_cloudevent'.
Since v1.0 of the spec, some properties has been removed/simplified; 
extension properties must be simple (no nested properties) 
and must contain only lowercase letters and numbers in the name (and less than 20 chars in total); 
so for example my strict extension now is 'strictvalidation' with a boolean value.


## Contributing

1. Fork it ( https://github.com/smartiniOnGitHub/cloudevent.js/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request


## License

Licensed under [Apache-2.0](./LICENSE).

----
