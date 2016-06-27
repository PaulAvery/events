import test from 'ava-spec';
import EventEmitter from '../src';

test('Can be instantiated', t => {
	t.notThrows(() => new EventEmitter());
});

test('Cannot be called as function', t => {
	t.throws(() => EventEmitter());
});

test('on() attaches a handler', async t => {
	let e = new EventEmitter();

	t.plan(1);
	e.on('event', () => t.pass());

	await e.emit('event');
});

test('off() removes a handler', async t => {
	let e = new EventEmitter();

	let f = () => t.fail();

	e.on('event', f);
	e.off(f);

	await e.emit('event');
});

test('once() attaches a handler for one emit', async t => {
	let e = new EventEmitter();

	t.plan(1);
	e.once('event', () => t.pass());

	await e.emit('event');
	await e.emit('event');
});

test('wait() returns a promise, which is resolved on emitted event', async t => {
	let e = new EventEmitter();

	t.plan(1);
	e.wait('success').then(args => {
		if(args[0] === '1' && args[1] === 'A') {
			t.pass();
		} else {
			t.fail();
		}
	});
	e.wait('fail').then(() => t.fail());

	await e.emit('success', '1', 'A');
});

test('Errors in handlers are caught by a callback assigned via catch()', async t => {
	let e = new EventEmitter();
	let error = new Error();

	e.catch(err => t.is(err, error));
	e.on('event', () => { throw error; });

	await e.emit('event').catch(() => {});
});
