# .child(scope)
The `child()` method creates a new EventEmitter which is restricted to the scope of its parent.


```js
let e = new EventEmitter();
let child = e.child('scope');

e.on('scope:event', () => console.log('I will be called twice'));
child.on('event', () => console.log('Me too'));

e.emit('scope:event');
child.on('event');
```
