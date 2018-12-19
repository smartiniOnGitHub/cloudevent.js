# Change Log

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
