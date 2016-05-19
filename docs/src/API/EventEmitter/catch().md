# .catch(handler)
The `.catch()` method allows you to globally handle errors in event handlers.
The error handler will be called for every failed listener. Only a single error handler can be attached at a single time.

The following will log the error twice:

```js
let e = new EventEmitter();
e.catch(error => console.error(error));

e.on('event', () => { throw new Error(); });
e.emit('event').then(error => console.error(error));
```
