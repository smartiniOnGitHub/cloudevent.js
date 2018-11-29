# Change Log

## [0.2.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.2.0) (2018-xx-xx)
Summary Changelog:
- Updated dependencies
- Add Badges in the README for simpler download/identify from NPM web site
- Remove cloudEventsVersion attribute from constructor (it's defined in the implementation, as a read-only private property); so the change in release number
- Move source attribute from constructor options to a constructor property (for simpler set/override) and remove its default value; so the change in release number
- Add JSON Schema for CloudEvent, related to current attributes (so it makes sense to expose here, even if used only by other serializing libraries)

## [0.1.0](https://github.com/smartiniOnGitHub/cloudevent.js/releases/tag/0.1.0) (2018-08-28)
Summary Changelog:
- First release compliant with current CloudEvent Spec (0.1.0), with basic features: create instances with all attributes, or with some useful defaults
- Provide some basic validation checks and validation functions
- Implement Serialization in the default format
- Provide a Node.js Example

----
