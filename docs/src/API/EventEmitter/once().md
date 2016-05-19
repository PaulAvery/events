# .once(event, handler)
Attaches a handler which is automatically detached at the moment it is called.

```js
let e = new EventEmitter();

e.once('event', message => console.log());

e.emit('event', 'This will be logged');
e.emit('event', 'This won\'t');
```
