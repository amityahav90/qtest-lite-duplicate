export function findKeyByValue(obj, value) {
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			if (obj[key] === value) {
				return key;
			}
		}
	}

	return undefined;
}
