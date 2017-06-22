/**
 * EventEmitter extend from this class in order to add
 * event emitter functionality like
 * emit, addEventListener, on, once
 */
class EventEmitter {
	constructor() {
		/**
		 * event handlers map, with eventNames as keys, and handler functions Arrays as values {"update" : [func1, func2]}
		 * @type {Object}
		 */
		this.events = {};
	}

	/**
	 * Add listener(s) to Event(s).
	 * @param {string[]|string} eventNames - event name(s)
	 * @param {function} callback - callback function
	 */
	addEventListener(eventNames, callback) {
		if (!Array.isArray(eventNames)) {
			eventNames = [eventNames];
		}
		for (let i = 0; i < eventNames.length; i++) {
			let evt = eventNames[i];
			if (!this.events[evt]) {
				this.events[evt] = [];
			}
			this.events[evt].push(callback);
		}
	}

	/**
	 * Add listener(s) to Event(s). Alias to addEventListener()
	 * @param {string[]|string} eventNames - event name(s)
	 * @param {function} callback - callback function
	 */
	on(eventNames, callback) {
		this.addEventListener(eventNames, callback);
	}

	/**
	 * Adds listener(s) to Event(s) which only need to be called once.
	 * It will be called only the first time event is fired.
	 * @param {string[]|string} eventNames - event name(s)
	 * @param {function} callback - callback function
	 */
	once(eventNames, callback) {
		const tmp = () => {
			callback(...arguments);
			this.removeEventListener(eventNames, tmp);
		};

		this.addEventListener(eventNames, tmp);
	}

	/**
	 * Removes specific listener from Event.
	 * @param {string} eventName - event name
	 * @param {function} callback - callback function
	 *
	 * @returns {boolean} true if callback removed. else if callback not assigned
	 */
	removeEventListener(eventName, callback) {
		if (this.events[eventName] && this.events[eventName].indexOf(callback) !== -1) {
			this.events[eventName].splice(this.events[eventName].indexOf(callback), 1);
			return true;
		}

		return false;
	}

	/**
	 * Emits Event with params.
	 * @param {String} eventName
	 * @param {RodinEvent} rodinEvent - a custom Event object
	 * @param {Array} args - arguments to be passed to the event callback
	 */
	emit(eventName, rodinEvent = {}, ...args) {
		rodinEvent.type = eventName;

		if (this.events[eventName] && this.events[eventName].length > 0) {
			for (let f = 0; f < this.events[eventName].length; f++) {
				if (typeof this.events[eventName][f] === "function") {
					this.events[eventName][f].apply((rodinEvent && rodinEvent.target), [rodinEvent].concat(args));
				}
			}
		}
	}

	/**
	 * Emits event async
	 * @param {String} eventName
	 * @param {RodinEvent} rodinEvent - a custom Event object
	 * @param {Array} args - arguments to be passed to the event callback
	 */
	emitAsync(eventName, rodinEvent, ...args) {
		const tmpTimeout = setTimeout(() => {
			this.emit(eventName, rodinEvent, ...args);
			clearTimeout(tmpTimeout);
		}, 0);
	}
}