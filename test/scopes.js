/* eslint no-shadow: "off" */
import test from 'ava-spec';
import EventEmitter from '../src';

let wc = '*';
let delim = ':';

function wildcardTests(test, wc, delim) {
	let options = { wildcard: wc, delimiter: delim };

	test.group('are emitted to wildcard handlers', test => {
		test.serial('at top level', async t => {
			let e = new EventEmitter(options);

			t.plan(1);
			e.on(wc, () => t.pass());

			await e.emit(`event${delim}scope1${delim}scope2`);
		});

		test.serial('at intermediate level', async t => {
			let e = new EventEmitter(options);

			t.plan(1);
			e.on(`event${delim}${wc}`, () => t.pass());

			await e.emit(`event${delim}scope1${delim}scope2`);
		});

		test.serial('at closest level', async t => {
			let e = new EventEmitter(options);

			t.plan(1);
			e.on(`event${delim}scope1${delim}${wc}`, () => t.pass());

			await e.emit(`event${delim}scope1${delim}scope2`);
		});
	});
}

test('Default wildcard is *', t => {
	let emitter = new EventEmitter();

	t.is(emitter.options.wildcard, '*');
});

test('Default delimiter is :', t => {
	let emitter = new EventEmitter();

	t.is(emitter.options.delimiter, ':');
});

test('Wildcard at position other than last throws', t => {
	let e = new EventEmitter();

	t.throws(() => e.on('a.*.c'));
	t.throws(() => e.on('*.b'));
	t.notThrows(() => e.on('*'));
	t.notThrows(() => e.on('a.*'));
});

test.group('Scoped events', test => {
	test('are emitted to exact handlers', async t => {
		let e = new EventEmitter();

		t.plan(1);
		e.on('event.scope1.scope2', () => t.pass());

		await e.emit('event.scope1.scope2');
	});

	test.group('with default wildcard and default delimiter', test => wildcardTests(test, wc, delim));
	test.group('with default wildcard and changed delimiter', test => wildcardTests(test, wc, '.'));
	test.group('with changed wildcard and changed delimiter', test => wildcardTests(test, '?', '.'));
	test.group('with changed wildcard and default delimiter', test => wildcardTests(test, '?', delim));
});
