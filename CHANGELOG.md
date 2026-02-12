# Change Log

## [0.20.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.20.0) (2026-02-12)
Summary Changelog:
- Update requirements to Node.js 20 LTS (20.9.0)
- Update all dependencies to latest
- Ensure all is good as before

## [0.10.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.10.0) (2022-08-07)
Summary Changelog:
- Update requirements to Node.js 14 LTS (14.15.0)
- Ensure all is good as before
- Change CloudEvent validation methods/functions: the given argument to validate/check in strict mode 
  now defaults to null, so validation/check will override the value in the event (is any) 
  only when that flag has a value in arguments
- Add a flag in CloudEvent serialization/deserialization to simplify debugging issues
- Small improvements in Validator functions
- Add some Utility functions, in its own source
- Add an example (minimal) benchmark
- Small improvements in performances (inline some small utility code block),
  as seen in flame graph on both examples; later check if do more
- Rewritten some code to use new ES features and operators; 
  but not (yet) private functions/methods to avoid less code coverage 
  (to not add a library to mock that code for testing it once private; later check if it worth the effort)

## [0.9.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.9.0) (2022-04-16)
Summary Changelog:
- Implement the [v1.0.2 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0.2) 
  but ensure compatibility with release 1.0 of the spec
- Update dependencies but keep compatibility with Node.js 10
- Update internals about 'time', to be managed as a string (as in spec); 
  in costructor now is accepted even as a string (that could be checked later 
  during validation); added a getter method to get its value as a Date
- Update JSONBatch serialize/deserialize with an additional argument: 
  a callback function to notify when each item has been processed 
  (in the right way or not), it could be useful
- General cleanup
- No features implemented as async functions here at the moment

## [0.8.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.8.0) (2021-03-26)
Summary Changelog:
- Implement the [v1.0.1 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0.1) 
  but ensure compatibility with release 1.0
- Update requirements to Node.js 10 LTS (10.13.0 or later)
- Update dependencies for the development environment
- Generate documentation from sources with JSDoc, no more ESDoc
- Fix: Manage in the right way optional values given as null (even extensions)
- Fix: remove the unnecessary executable attribute from sources and some other file in the repo
- Feature: add to CloudEvent an utility (static) method to dump validation results
- Feature: ensure 'data' works in the right way with a string value 
  and even with a boolean value, both with a non default datacontenttype (for example 'text/plain')
- Feature: handle 'data' as array (it was previously forbidden)
- Feature: update example and update/simplify README
- Feature: update JSONBatch strict validation to consider even null/undefined items in the array
- Feature: update to string representation including all mandatory attributes, 
  and by using 'payload' instead of 'data' (shortened if more than 1024 chars) 
  because it's more general

## [0.7.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.7.0) (2020-09-20)
Summary Changelog:
- Implement the [v1.0 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0) 
  with all breaking changes since its v0.3
- Update dependencies for the development environment
- Update JSON Schema to that of spec v1.0
- Feature: keep compatibility with Node.js 8 (but this is latest release that supports it)
- Breaking change: updated attributes as per spec
- Breaking change: updated my extension/s to be compliant with updated spec
- Breaking change: updated getter method 'payload' to return parsed JSON data 
  if datacontenttype is default or json-derived, and unparsed data in other cases; 
  if data_base64 is defined, an uncoded version of it will be returned
- Feature: implement a getter method 'dataType' to tell if data is text or binary encoded
- Feature: added as validation option a user defined function to validate data with dataschema
- General: ensured some CloudEvent serialized instances pass some online validators for this spec version; 
  for example [this](https://www.itb.ec.europa.eu/json/cloudevents/upload) from its Web UI

## [0.6.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.6.0) (2019-10-23)
Summary Changelog:
- Implement the [v0.3 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v0.3) with all breaking changes since its v0.2
- Update dependencies for the development environment
- Update JSON Schema to that of spec v0.3
- Breaking change: updated attributes as per spec, like: 
  rename 'contenttype' into 'datacontenttype', add the new attribute 'subject', 
  remove the 'extensions' specific attribute, standard names no more usable in extensions, 
  handle 'datacontentencoding' and its 'base64' encoding (other encodings with a user-defined encode function), 
  etc; 
  updated/renamed methods (normal and static) in the same way, for consistency with the naming of attributes
- Update Validator and Transformer with some new useful (static) methods
- Restore the ability to have object (and not only string) value for data when 'datacontenttype' is not default
- Implement even the "JSON Batch Format" (many Cloudevents inside a JSON array) in a new class JSONBatch, 
  with specific new static methods for serializing/deserializing array of Cloudevents; 
  but do not use streaming here (for simplicity)
- Improve generated docs with an update of ESDoc syntax, to clarify 
  not nullable parameters, nullable parameters, optional, optional with a default value 
- Update examples with new features
- Add npm custom command to run Tap tests in a 'dev' mode (but without debugger breaks), 
  by continuously run it in 'watch' mode
- Add npm custom command 'example:debug' to be able to debug the example
- Refactor unit tests to share some common parts
- Use Node.js assertions but in strict mode, available in Node.js 8.16.x (but not in previous like 8.9.0)
- Ensure test code has 100% coverage
- Other small changes
- Add a badge for license, another for vulnerabilities in dependencies

## [0.5.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.5.0) (2019-04-28)
Summary Changelog:
- Implement the [v0.2 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v0.2) with all breaking changes since its v0.1
- Updated dependencies for the development environment
- Updated documentation and samples to describe/show changes and the new behavior
- Updated Tap unit tests to always run in strict mode, and some refactoring
- Clarify which CloudEvents Spec version is implemented in the current release

## [0.4.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.4.0) (2019-03-15)
Summary Changelog:
- Updated dependencies for the development environment
- Remove unused dev dependencies
- In serialization/deserialization methods, add a boolean option 'onlyValid' (by default false) 
  to serialize/deserialize only if validation is successful
- Relax strict validation rules, so when contentType is not default, 
  the 'data' attribute could be a string
- in Transformer, add utility static methods 'timestampToNumber' and 'timestampFromNumber', 
  to simplify timestamp handling even when in number format
- in Transformer, add utility static method 'uriStripArguments', to return the given URI/URL string 
  but without arguments (if any); note that this would be useful to cleanup given url (sometimes 
  returned by frameworks as requested by web clients), to put into the 'source' attribute
- in Transformer, add utility static method 'mergeObjects', to merge the given objects 
  and return the merged one (but with the same prototype of the first object); 
  note that this is useful to merge a CloudEvent instance with other objects 
  containing attribute values to merge in it
- Achieve 100% test code coverage

## [0.3.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.3.0) (2019-02-12)
Summary Changelog:
- Updated dependencies for the development environment
- Add the ability to deserialize/parse a string into a CloudEvent 
  (via the static method 'deserializeEvent')
- Add a static method 'isCloudEvent' to tell the given object, if it's 
  a class/subclass instance of CloudEvent
- Add an utility class 'Transformer' with useful static methods 
  to transform CloudEvent related data, like: 
  tmestamp (Date) to/from string, error to data (the CloudEvent data attribute), 
  process info to data, etc
- Add some useful static methods to the class 'Validator'
- Breaking change: to be more future proof, the main object exported by the library now
  is only a container for library classes/objects/functions; 
  using destructuring assignment, using the library will be simple the same;
  see samples and documentation for more info
- Breaking change: move the utility static method 'dumpObject' from the CloudEvent class 
  to the new Transformer class
- Improve (Test) Code Coverage, to be near 100%

## [0.2.2](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.2.2) (2019-01-20)
Summary Changelog:
- Updated dependencies for the development environment
- Add some tests with nested data (objects nested with some levels of depth)
- Add a getter method for reading the data attribute (payload)
- To handle non default 'contentType' mime type, pass an options object to serializer 
- In serialization options, add a function to transform data and return the encoded version 
  (but without checks on the transformed value), used with non default 'contentType'
- In serialization options, add an argument to specify the (already) encoded version 
  of the data (payload) (but without checks on the value), used with non default 'contentType'
- Add an npm custom command to run Tap unit tests with Node.js debugger breaks enabled (inspector) 
  and no parallel and no timeout, useful for example in Visual Studio Code
- Note that accordingly with the [Semantic Versioning](https://semver.org/) specification 
  (version number: MAJOR.MINOR.PATCH), in this case I added functionality in a backwards-compatible 
  manner, so I should update the MINOR version now (update MAJOR is for incompatible changes, 
  MINOR for compatible changes, and PATCH is for compatible fixes); 
  but in this case there are no real addition of new features (but an improvement over existing 
  features, and remove some TODO), so could be good the same even a PATCH release

## [0.2.1](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.2.1) (2018-12-20)
Summary Changelog:
- Updated dependencies for the development environment
- Expose the JSON Schema even with a static method, for simpler usage by others
- Fix documentation generation in ESDoc (using latest JavaScript syntax), 
  and tweak configuration for documentation on tests
- Added badge for the status (updated or not) for dependencies, in the README

## [0.2.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.2.0) (2018-12-09)
Summary Changelog:
- Updated dependencies
- Add Badges in the README for simpler download/identify from NPM web site
- Remove cloudEventsVersion attribute from constructor (it's defined in the implementation, 
  as a read-only private property); so the change in release number
- Move source attribute from constructor options to a constructor property (for simpler set/override) 
  and remove its default value; so the change in release number
- Add JSON Schema for CloudEvent, related to current attributes (so it makes sense to expose here, 
  even if used only by other serializing libraries)
- Deprecate the current package name, the new name (simpler) will be `cloudevent` 
  (drop the `.js` from the package name); this release will have both, 
  but later versions will be published only with the new name;
  unluckily I can't use 'cloudevents' because it's already used

## [0.1.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.1.0) (2018-08-28)
Summary Changelog:
- First release compliant with current CloudEvent Spec (0.1.0), with basic features: create instances with all attributes, or with some useful defaults
- Provide some basic validation checks and validation functions
- Implement Serialization in the default format
- Provide a Node.js Example

----
