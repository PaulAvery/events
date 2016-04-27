# .on(event, handler)
Attaches a handler/listener function to the emitter for a given event.
All arguments passed to `emit()` will also be passed to the listener and the listener will be called with `this` set to the top-level EventEmitter.

```js
let e = new EventEmitter();

e.on('event', (...args) => console.log(args));
e.emit('event', 'Some', 'Arguments');
```

### Scopes
Events can be scoped, which is mainly useful for child emitters and wildcard handling.

```js
let e = new EventEmitter();

e.on('scope:event', (...args) => console.log(args));
e.emit('scope:event', 'This will be logged');
e.child('scope').emit('event', 'This will be logged as well');
```

### Wildcards
Instead of a scope or an event, a wildcard can be passed at the last position.
If a wildcard handler is attached, it will be passed the full path of the called event, split into scopes.

```js
let e = new EventEmitter();

e.on('scope:*', path => console.log(path));
e.emit('scope:event', 'This will log ["scope", "event"]');
e.emit('scope:nested:event', 'This will log ["scope", "nested", "event"]');
```
