# Change Log

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
