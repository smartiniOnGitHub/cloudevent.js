# cloudevent.js

JavaScript/Node.js implementation of http://cloudevents.io/


## Usage

```js
const CEClass = require('cloudevent.js')()

// create some sample intances ...
const ceEmpty = new CEClass() // create a not valid CloudEvent instance (for the validator)

// TODO: ...
```

In the [example](./example/) folder there are some simple server scripts that uses the library  (inline but it's the same using it from npm registry).


## Requirements

Node.js 8.11.x or later.


## Note

See the CloudEvents Specification [here](https://github.com/cloudevents/spec).


## License

Licensed under [Apache-2.0](./LICENSE).

----
