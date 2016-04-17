export default class EventEmitter {
	/* Set up scope, parent and listeners */
	constructor(scope, parent) {
		this.scope = scope;
		this.parent = parent;
		this.listeners = {};
	}

	/*
	 * Creates a child instance of EventEmitter limited to a specific scope.
	 * Anything emitted here will also be emitted on the parent
	 */
	child(scope) {
		let path = scope.split(EventEmitter.DELIMITER);
		let emitter = new EventEmitter(path.shift(), this);

		if(path.length > 0) {
			return emitter.child(path.join(EventEmitter.DELIMITER));
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
		scope[EventEmitter.DELIMITER] = [];

		return scope;
	}

	/* Return all listeners for a specific path */
	getScopeListeners(path) {
		let listeners = [];

		let scope = path.reduce((current, step) => {
			/* Add wildcard listeners */
			if(current[EventEmitter.WILDCARD]) {
				listeners = listeners.concat(current[EventEmitter.WILDCARD][EventEmitter.DELIMITER].map(l => {
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
		return listeners.concat(scope[EventEmitter.DELIMITER].map(l => {
			return {
				listener: l,
				wildcard: false
			};
		}));
	}

	/* Attach a listener */
	on(event, handler) {
		/* Check for invalid wildcard (can only be at last position)*/
		let wildcardPosition = event.indexOf(EventEmitter.WILDCARD);
		if(wildcardPosition !== -1 && wildcardPosition !== event.length - 1) {
			throw new Error(`Wildcard "${EventEmitter.WILDCARD}" found at index ${wildcardPosition} of event "${event}". Only allowed at end of string!`);
		}

		/* Get to our scope */
		let path = event.split(EventEmitter.DELIMITER);
		let scope = path.reduce((current, step) => {
			current[step] = current[step] || this.createScope();
			return current[step];
		}, this.listeners);

		/* Add the handler */
		scope[EventEmitter.DELIMITER].push(handler);
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
			scope[EventEmitter.DELIMITER].forEach((l, i) => {
				if(l === listener) {
					scope[EventEmitter.DELIMITER].splice(i, 1);
				}
			});

			/* For all keys which are not the delimiter key, remove all keys */
			Object.keys(scope).filter(s => s !== EventEmitter.DELIMITER).forEach(iteration);
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
			/* Emit the correct events on the parent */
			this.parent.emit(`${this.scope}${EventEmitter.DELIMITER}${event}`, ...args);
		}

		/* Extract listeners */
		let path = event.split(EventEmitter.DELIMITER);
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
		return Promise.all(promises).catch(error => {
			if(this.catcher) {
				this.catcher(error);
			}

			throw error;
		});
	}
}

EventEmitter.DELIMITER = ':';
EventEmitter.WILDCARD = '*';
