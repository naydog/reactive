
export function isObject(obj) {
	return typeof obj == 'object' && obj;
}

export function isArray(obj) {
	return Array.isArray(obj);
}

/* istanbul ignore next */
export function isPrimitive(value) {
	return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}
