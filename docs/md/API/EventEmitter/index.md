# EventEmitter
The only thing exported from this module is the `EventEmitter` class.
Its constructor takes no arguments and it can be extended to give EventEmitter functionality to your own classes:

```js
import EventEmitter from '@paulavery/events';

class MyEventEmitter extends EventEmitter {
	constructor() {
		super();

		this.on('some:event', doSomething);
	}
}
```

## Constants
The `EventEmitter` class has two constants attached to allow some slight configuration.
If you decide to override them, do so before instantiating any emitter.

### DELIMITER
The `EventEmitter.DELIMITER` specifies which character should be used to split scopes. It defaults to `:`.

**Example:**

```js
EventEmitter.DELIMITER = '.';

let e = new EventEmitter();
e.on('scoped.event', doSomething);
```

### WILDCARD
The `EventEmitter.WILDCARD` specifies which character should be used to match any lower scope. It defaults to `*`.

**Example:**

```js
EventEmitter.WILDCARD = '?';

let e = new EventEmitter();
e.on('scoped:?', doSomething);
```
