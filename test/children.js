/* eslint no-shadow: "off" */
import test from 'ava-spec';
import EventEmitter from '../src';

test.group('child() method creates a child, which', test => {
	test('is an instance of EventEmitter', t => {
		let e = new EventEmitter();
		let child = e.child('scope');

		if(child instanceof EventEmitter) {
			t.pass();
		} else {
			t.fail();
		}
	});

	test('calls its handlers with this set to the root emitter', async t => {
		let e = new EventEmitter();
		let child = e.child('nested');
		let deeperChild = child.child('scope');

		t.plan(6);
		child.on('scope:event', function() { t.is(this, e); });
		deeperChild.on('event', function() { t.is(this, e); });

		await e.emit('nested:scope:event');
		await child.emit('scope:event');
		await deeperChild.emit('event');
	});

	test('inherits the delimiter', async t => {
		let e = new EventEmitter({ delimiter: '.' });
		let child = e.child('nested');

		t.plan(1);
		child.on('*', pth => t.deepEqual(pth, ['scope', 'event']));

		await child.emit('scope.event');
	});

	test('inherits the wildcard', async t => {
		let e = new EventEmitter({ wildcard: '?' });
		let child = e.child('nested');

		t.plan(1);
		child.on('?', pth => t.deepEqual(pth, ['scope', 'event']));

		await child.emit('scope:event');
	});

	test.group('properly has a scope set, if', test => {
		test('simple scope is passed', async t => {
			let e = new EventEmitter();
			let child = e.child('scope');

			t.plan(4);
			e.once('scope:nested', d => t.is(d, 0));
			child.once('nested', d => t.is(d, 0));

			await e.emit('scope:nested', 0);

			e.once('scope:nested', d => t.is(d, 1));
			child.once('nested', d => t.is(d, 1));

			await child.emit('nested', 1);
		});

		test('nested scope is passed', async t => {
			let e = new EventEmitter();
			let child = e.child('scope:nested');

			t.plan(4);
			e.once('scope:nested:deeper', d => t.is(d, 0));
			child.once('deeper', d => t.is(d, 0));

			await e.emit('scope:nested:deeper', 0);

			e.once('scope:nested:deeper', d => t.is(d, 1));
			child.once('deeper', d => t.is(d, 1));

			await child.emit('deeper', 1);
		});
	});
});
