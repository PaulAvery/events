# .wait(event)
This method returns a promise which will be resolved the first time the event is emitted.
It will be resolved with an array of the arguments that would be passed to a handler attached to the same event.

```js
let e = new EventEmitter();

e.wait('event').then(args => {
	console.log(args[0]);
});

e.emit('event', 'This will be logged');
e.emit('event', 'This won\'t');
```
