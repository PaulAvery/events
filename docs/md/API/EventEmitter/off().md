# .off(handler)
Removes a given handler from all events.

```js
let e = new EventEmitter();
let handler = message => console.log(message);

e.on('event', handler);
e.emit('event', 'This will be logged');

e.off(handler);
e.emit('event', 'This won\'t');
```
