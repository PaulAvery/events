# .emit(event, ...args)
The `emit()` method causes the EventEmitter and all its parents and children to emit a specific event.
Any arguments specified after the event will be passed on to the handlers.

The method returns a promise which is basically `Promise.all()` called with all handlers return values.

## Examples
**Throwing handler:**

```js
let e = new EventEmitter();

e.on('event', () => console.log('I ran'));
e.on('event', () => { throw new Error('An Error'); });

e.emit('event').catch((e) => console.error('I threw: ', e));
```

**Async handler:**

```js
let e = new EventEmitter();

e.on('event', async d => await doSomething(d));

await e.emit('event');
```
