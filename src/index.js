import merge from 'merge-deep';

export default class EventEmitter {
	/* Set up scope, parent and listeners */
	constructor(options, scope, parent) {
		this.listeners = {};
		this.options = merge({ delimiter: ':', wildcard: '*' }, options);
		this.parent = parent;
		this.scope = scope;
	}

	/*
	 * Creates a child instance of EventEmitter limited to a specific scope.
	 * Anything emitted here will also be emitted on the parent
	 */
	child(scope) {
		let path = scope.split(this.options.delimiter);
		let emitter = new this.constructor(this.options, path[0], this);

		this.on(
			`${path[0]}${this.options.delimiter}${this.options.wildcard}`,
			(pth, ...args) => emitter.emitDirect(pth.slice(1), ...args)
		);

		if(path.length > 1) {
			return emitter.child(path.slice(1).join(this.options.delimiter));
		} else {
			return emitter;
		}
	}

	/* Return root EventEmitter */
	root() {
		return this.parent ? this.parent.root() : this;
	}

	/* Used to attach a handler to catch failed listeners */
	catch(listener) {
		this.catcher = listener;
	}

	/* Create a new scope object */
	createScope() {
		let scope = {};

		/* Create array for the handlers attached to this scope */
		scope[this.options.delimiter] = [];

		return scope;
	}

	/* Return all listeners for a specific path */
	getScopeListeners(path) {
		let listeners = [];

		let scope = path.reduce((current, step) => {
			/* Add wildcard listeners */
			if(current[this.options.wildcard]) {
				listeners = listeners.concat(current[this.options.wildcard][this.options.delimiter].map(l => {
					return {
						listener: l,
						wildcard: true
					};
				}));
			}

			/* Dig deeper */
			return current[step] || this.createScope();
		}, this.listeners);

		/* Return all wildcard listeners as well as the normal ones */
		return listeners.concat(scope[this.options.delimiter].map(l => {
			return {
				listener: l,
				wildcard: false
			};
		}));
	}

	/* Attach a listener */
	on(event, handler) {
		/* Check for invalid wildcard (can only be at last position)*/
		let wildcardPosition = event.indexOf(this.options.wildcard);
		if(wildcardPosition !== -1 && wildcardPosition !== event.length - 1) {
			throw new Error(`Wildcard "${this.options.wildcard}" found at index ${wildcardPosition} of event "${event}". Only allowed at end of string!`);
		}

		/* Get to our scope */
		let path = event.split(this.options.delimiter);
		let scope = path.reduce((current, step) => {
			current[step] = current[step] || this.createScope();
			return current[step];
		}, this.listeners);

		/* Add the handler */
		scope[this.options.delimiter].push(handler);
	}

	/* Attach a handler once */
	once(event, listener) {
		let emitter = this;

		/* Create a non-anonymous wrapper to allow passing of "this" */
		function wrapper(...args) {
			/* Detach wrapper immediately */
			emitter.off(wrapper);

			/* Call the original listener */
			return listener.apply(this, args);
		}

		/* Attach our wrapper */
		this.on(event, wrapper);
	}

	/* Detach a handler */
	off(listener) {
		/* Go through a single scope and recursively remove all instances of the listener */
		let iteration = scope => {
			/* If we find the listener, remove it */
			if(scope[this.options.delimiter]) {
				scope[this.options.delimiter].forEach((l, i) => {
					if(l === listener) {
						scope[this.options.delimiter].splice(i, 1);
					}
				});
			}

			/* For all keys which are not the delimiter key, remove all keys */
			Object.keys(scope)
				.filter(s => s !== this.options.delimiter)
				.forEach(s => iteration(scope[s]));
		};

		/* Start the removal at the top-level */
		iteration(this.listeners);
	}

	/*
	 * Return a promise triggered on a specific handler. Very useful to wait for a specific event.
	 * Because promises can only be resolved to a single value, we pass it the arguments as an array.
	 */
	async wait(event) {
		return await new Promise((resolve) => this.once(event, (...args) => resolve(args)));
	}

	/* Emit a given event and call all handlers with the given arguments */
	emit(event, ...args) {
		if(this.parent) {
			/* Bubble event up if parent is available */
			return this.parent.emit(`${this.scope}${this.options.delimiter}${event}`, ...args);
		} else {
			/* Otherwise, chain downwards */
			return this.emitDirect(event.split(this.options.delimiter), ...args);
		}
	}

	/* Emit event downwards */
	emitDirect(path, ...args) {
		/* Extract listeners */
		let listeners = this.getScopeListeners(path);

		/* Call them properly */
		let promises = listeners.map(listener => {
			let listenerArgs = listener.wildcard ? [path].concat(args) : args;

			return Promise.resolve().then(() => {
				/*
				 * Call all listeners inside a promises .then() method to catch synchronous errors
				 * Also call on the root EventEmitter
				 */
				return listener.listener.apply(this.root(), listenerArgs);
			});
		});

		/* Return once all listeners are done */
		return Promise.all(promises.map(
			promise => promise.catch(error => {
				if(this.catcher) {
					this.catcher(error);
				}

				throw error;
			})
		));
	}
}
