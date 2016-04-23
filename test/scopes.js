/* eslint no-shadow: "off" */
import test from 'ava-spec';
import EventEmitter from '../src';

let wc = EventEmitter.WILDCARD;
let delim = EventEmitter.DELIMITER;

test.afterEach(() => {
	EventEmitter.WILDCARD = wc;
	EventEmitter.DELIMITER = delim;
});

function wildcardTests(test, wc, delim) {
	test.group('are emitted to wildcard handlers', test => {
		test.serial('at top level', async t => {
			EventEmitter.WILDCARD = wc;
			EventEmitter.DELIMITER = delim;

			let e = new EventEmitter();

			t.plan(1);
			e.on(wc, () => t.pass());

			await e.emit(`event${delim}scope1${delim}scope2`);
		});

		test.serial('at intermediate level', async t => {
			EventEmitter.WILDCARD = wc;
			EventEmitter.DELIMITER = delim;

			let e = new EventEmitter();

			t.plan(1);
			e.on(`event${delim}${wc}`, () => t.pass());

			await e.emit(`event${delim}scope1${delim}scope2`);
		});

		test.serial('at closest level', async t => {
			EventEmitter.WILDCARD = wc;
			EventEmitter.DELIMITER = delim;

			let e = new EventEmitter();

			t.plan(1);
			e.on(`event${delim}scope1${delim}${wc}`, () => t.pass());

			await e.emit(`event${delim}scope1${delim}scope2`);
		});
	});
}

test('Default wildcard is *', t => {
	t.is(EventEmitter.WILDCARD, '*');
});

test('Default delimiter is :', t => {
	t.is(EventEmitter.DELIMITER, ':');
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
