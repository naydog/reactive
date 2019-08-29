
function Observer(parentObject, keyInParent) {
	this.parent = parentObject;
	this.property = keyInParent;
	// callback functions for property change
	// { propertyName: [{name: string, fn: function}]}
	this.watches = {};
}

Observer.prototype.notify = function (key, oldVal, newVal) {
	var watches = this.watches;
	if (watches[key]) {
		for (var i in watches[key]) {
			watches[key][i].fn(oldVal, newVal);
		}
	}
}

Observer.prototype.notifyParent = function (oldVal, newVal) {
	this.parent._$ob$_ && this.parent._$ob$_.notify(this.property, oldVal, newVal);
}

Observer.prototype.watch = function (key, fn, name) {
	var watches = this.watches;
	if (!watches[key]) {
		watches[key] = [];
	}

	for (var i in watches[key]) {
		if (watches[key][i].name === name) { // Already being watched
			console.warn('There is already a watch with same name', name);
			watches[key][i].fn = fn;
			return;
		}
	}
	watches[key].push({
		name: name,
		fn: fn
	});
}

Observer.prototype.unwatch = function (key, name) {
	var watchOnKey = this.watches[key];
	if (watchOnKey) {
		for (var i = watchOnKey.length - 1; i > -1; i--) {
			if (watchOnKey[i].name === name) {
				watchOnKey.splice(i, 1);
				return;
			}
		}
	}
}

Observer.prototype.unwatchAll = function (key) {
	this.watches[key] = [];
}

export default Observer