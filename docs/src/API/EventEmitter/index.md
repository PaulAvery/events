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

## Options
The `EventEmitter` class takes an options object as its first parameter. Any [children](child().md) will inherit these options.
The following options are available:

### delimiter
The `delimiter` property specifies which character should be used to split scopes. It defaults to `:`.

**Example:**

```js
let e = new EventEmitter({ delimiter: '.' });
e.on('scoped.event', doSomething);
```

### wildcard
The `wildcard` property specifies which character should be used to match any lower scope. It defaults to `*`.

**Example:**

```js
EventEmitter.WILDCARD = '?';

let e = new EventEmitter({ wildcard: '?' });
e.on('scoped:?', doSomething);
```
