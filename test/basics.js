import test from 'ava-spec';
import EventEmitter from '../src';

test('Can be instantiated', t => {
	t.notThrows(() => new EventEmitter());
});

test('Cannot be called as function', t => {
	t.throws(() => EventEmitter());
});
