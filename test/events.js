/* eslint no-shadow: "off" */
import test from 'ava-spec';
import EventEmitter from '../src';

/* Some test data to run through to check if data is passed correctly */
const data = [
	-99,
	0,
	99,
	'',
	'String',
	'0',
	{},
	{ 'Some': 'object' },
	[],
	['Some', 'Array', 0],
	function() {},
	null,
	undefined,
	NaN,
	true,
	false
];

/* Helper function to make looping and checking of data array easier */
function testData(count, test, fn) {
	data.forEach((value, key) => {
		test(`works with "${typeof value === 'object' ? JSON.stringify(value) : value}"`, async t => {
			let e = new EventEmitter();
			let cb = val => {
				/* Hellooooo, I am Javascript and do not treat NaN as identical to itself */
				if(isNaN(val) && isNaN(data[key])) {
					t.pass();
				} else {
					t.is(val, data[key]);
				}
			};

			t.plan(count);

			await fn(e, cb, value);
		});
	});
}

test.group('emit() method', test => {
	test.group('returns a promise, which', test => {
		test('resolves once all handlers are run', async t => {
			let e = new EventEmitter();

			t.plan(1);
			let passed = 0;

			e.on('event', async () => await passed++);
			e.on('event', async () => await passed++);

			await e.emit('event').then(() => t.is(passed, 2));
		});

		test('rejects if a handler throws', async t => {
			let e = new EventEmitter();

			t.plan(1);
			e.on('event', () => { throw new Error(); });

			await t.throws(e.emit('event'));
		});
	});

	test('emits events to only the correct handler', async t => {
		let e = new EventEmitter();

		t.plan(1);
		e.on('success', () => t.pass());
		e.on('fail', () => t.fail());

		await e.emit('success');
	});

	test.group('emits events to multiple targets', async test => {
		testData(2, test, async (e, cb, value) => {
			e.on('event', cb);
			e.on('event', cb);

			await e.emit('event', value);
		});
	});

	test.group('emits the same event multiple times if called multiple times', test => {
		testData(3, test, async (e, cb, value) => {
			e.on('event', cb);

			await e.emit('event', value);
			await e.emit('event', value);
			await e.emit('event', value);
		});
	});
});
