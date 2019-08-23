function Observer(parentObject, keyInParent) {
	this.parentObject = parentObject;
	this.property = keyInParent;
	// callback functions for property change
	// { propertyName: [...functions]}
	this.watches = {};
}

Observer.prototype.notify = function (key, oldVal, newVal) {
	var watches = this.watches;
	if (watches[key]) {
		for (var i in watches[key]) {
			watches[key][i](oldVal, newVal);
		}
	}
}

Observer.prototype.watch = function (key, fn) {
	var watches = this.watches;
	if (!watches[key]) {
		watches[key] = [];
	}

	for (var i in watches) {
		if (watches[i] === fn) { // Already being watched
			return;
		}
	}
	watches[key].push(fn);
}

Observer.prototype.unwatch = function (key) {
	this.watches[key] = [];
}


function isObject(obj) {
	return typeof obj == 'object' && obj;
}

function isArray(obj) {
	return obj instanceof Array;
}

function isPrimitive(value) {
	return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function defineReactiveProperty(obj, key, val) {
	var property = Object.getOwnPropertyDescriptor(obj, key);
	if (property && property.configurable === false) {
		return;
	}

	var getter = property && property.get;
	var setter = property && property.set;
	getter = null;
	setter = null;

	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,

		get: function reactiveGetter() {
			var value = getter ? getter.call(obj) : val;
			return value;
		},
		set: function reactiveSetter(newVal) {
			var value = getter ? getter.call(obj) : val;
			if (newVal === value || (newVal !== newVal && value !== value)) {
				return;
			}

			togglePropertyEnumable(obj, key, true);
			if (isObject(newVal) && isObject(value) && isArray(newVal) == isArray(value)) { // Both are objects, and of same type
				if (isArray(newVal)) { //  Both are arrays
					for (var i = 0; i < value.length && i < newVal.length; i++) {
						toReactiveObject(newVal[i]);
						value[i] = newVal[i];
					}
					for (var i = value.length; i < newVal.length; i++) {
						toReactiveProperty(value, i, newVal[i]);
					}
					value.length = newVal.length;
				} else { // Both are normal objects
					// Remove properties
					for (var i in value) {
						if (!Object.getOwnPropertyDescriptor(newVal, i)) {
							// Set to undefined, not delete. For recover
							// delete value[i];
							value[i] = undefined;
							togglePropertyEnumable(value, i, false);
						}
					}
					// Copy newVal properties to old value
					for (var i in newVal) {
						var property = Object.getOwnPropertyDescriptor(value, i);
						if (property) { // Update properties  
							value[i] = newVal[i];
						} else { // Add properties
							toReactiveProperty(value, i, newVal[i]);
						}
					}
				}
			} else { // Type change or primitive value change
				toReactive();
			}

			// execute watches
			obj._$ob$_ && obj._$ob$_.notify(key, value, newVal);

			function toReactive() {
				toReactiveObject(newVal);
				attachObserver(obj, key, newVal);
				if (setter) {
					setter.call(obj, newVal);
				} else {
					val = newVal;
				}
			}
		}
	});

	attachObserver(obj, key, val);
}

function attachObserver(parentObject, keyInParent, object) {
	if (isObject(object) && !Object.getOwnPropertyDescriptor(object, '_$ob$_')) {
		var ob = new Observer(parentObject, keyInParent);
		Object.defineProperty(object, '_$ob$_', {
			enumerable: false,
			configurable: false,
			get: function () {
				return ob;
			}
		});
	}
}

function togglePropertyEnumable(obj, key, enumerable) {
	var property = Object.getOwnPropertyDescriptor(obj, key);
	if (property.enumerable !== !!enumerable) {
		property.enumerable = !!enumerable;
		Object.defineProperty(obj, key, property);
	}
}

function toReactiveProperty(obj, key, val) {
	defineReactiveProperty(obj, key, val);
	toReactiveObject(obj[key]);
}

/**
 * Turn a json-like object to be reactive.
 * DO NOT turn an object including function as property to reactive.
 * @param {object} obj a json-like object
 */
function toReactiveObject(obj) {
	if (isObject(obj)) {
		for (var i in obj) {
			defineReactiveProperty(obj, i, obj[i]);
			toReactiveObject(obj[i]);
		}
	}
}

/**
 * Add new reactive property.
 * Using = to add new property won't make it reactive. Please use this method.
 * @param {object} obj an object
 * @param {string} key property name
 * @param {any} val property value to set
 */
function set(obj, key, val) {
	toReactiveProperty(obj, key, val);
}

/* public */
// Assign by reference. Adaptable for reactive object
// Reactive object must have an unenumerable property '_$ob$_', which saves the parent object and its property name in parent
function setByRef(targetObj, targetKey, sourceObj, sourceKey) {
	if (!sourceKey && !sourceObj._$ob$_) {
		throw 'Not a reactive object';
	}

	if (!sourceKey) {
		var ob = sourceObj._$ob$_;
		sourceObj = ob.parentObject;
		sourceKey = ob.property;
	}
	var property = Object.getOwnPropertyDescriptor(sourceObj, sourceKey);
	Object.defineProperty(targetObj, targetKey, property);
}

/**
 * Watch a property change, and do something
 * @param {object} obj object to watch
 * @param {string} key property name to watch
 * @param {function} fn do something
 * 		function(oldVal, newVal)
 */
function watch(obj, key, fn) {
	if (!obj._$ob$_) {
		throw 'Object is not reactive';
	}

	obj._$ob$_.watch(key, fn);
}

/**
 * Unwatch a property change
 * @param {object} obj object
 * @param {string} key property name to unwatch
 */
function unwatch(obj, key) {
	obj._$ob$_ && obj._$ob$_.unwatch(key);
}


// TODO:
// override array method. splice, push, pop, shift, unshift


/*
export default {
	watch,
	unwatch,
	setByRef,
	set,
}
*/