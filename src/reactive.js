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
	getter = null; setter = null;

	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,

		get: function () {
			var value = getter ? getter.call(obj) : val;
			return value;
		},
		set: function (newVal) {
			var value = getter ? getter.call(obj) : val;
			if (newVal === value || (newVal !== newVal && value !== value)) {
				return;
			}
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
							// delete value[i];
							// TODO value[i] = undefined; // Set to undefined, not delete. For recover
							// define to enumerable
							value[i] = undefined;
							var property = Object.getOwnPropertyDescriptor(value, i);
							// property.enumerable = false;
							Object.defineProperty(value, i, {
								enumerable: false,
								configurable: true,
								get: property.get,
								set: property.set
							});
						}
					}
					// Copy newVal properties to old value
					for (var i in newVal) {
						var property = Object.getOwnPropertyDescriptor(value, i);
						// console.log(property);
						if (property) { // Update properties  
							// Object.defineProperty(value, i, {
							// 	enumerable: true,
							// 	configurable: true,
							// 	get: property.get,
							// 	set: property.set
							// });
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
			console.log('changes');
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

/* public */
// 监控对象的某个属性的变化
// @param {function} fn 处理方法 function(oldVal, newVal)
function watch(obj, key, fn) {
	if (!obj._$ob$_) {
		throw 'Object is not reactive';
	}

	obj._$ob$_.watch(key, fn);
}

/* public */
function unwatch(obj, key) {
	obj._$ob$_ && obj._$ob$_.unwatch();
}


// TODO:
// array 操作重载。 splice, push, pop, shift, unshift
// 某property为object，将其整体替换，然后在其内部的添加新字段（以前的老字段），需要重新调用set方法


// NOTICE:
// 通过 = 赋值一个新属性，是不能使属性reactive的。只能通过set方法实现。set之后可以用 = 再次赋值


// TEST
a = {
	a: 1,
	b: {
		c: 2,
		d: 3,
		f: {},
		g: [4, 5]
	},
	c: [1, 2, 3]
}


toReactiveObject(a);

/* 
// test watch
// 删除属性，重新添加，watch还在
set(a.b.f, 'g', 'a'.repeat(1000000));
watch(a.b.f, 'g', function(o, n) { console.log(o, n); });
a.b.f.g = 'b'.repeat(1000000);
a.b = { c: 5, d: 8};
a.b.f = {e: 'x'};
a.b.f.g = 'd'.repeat(1000000);
*/

/*
// test array
watch(a.b, 'g', function (o, n) {
	console.log(o, n);
});
a.b.g = [7, 8];
*/


/*
// test 属性引用。 a,b属性联动。一个变动，都变动

b = {}
setByRef(b, 'c', a.b);
console.log(JSON.stringify(b.c), JSON.stringify(a));
a.b.c = 222;
console.log(JSON.stringify(b.c), JSON.stringify(a));
b.c.d = 333;
console.log(JSON.stringify(b.c), JSON.stringify(a));
a.b.f = 444;
console.log(JSON.stringify(b.c), JSON.stringify(a));
b.c.g = 555;
console.log(JSON.stringify(b.c), JSON.stringify(a));
*/