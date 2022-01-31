export function range(length, start = 0, step = 1) {
	const arr = new Array(length);

	for (let i = 0; i < length; i++) {
		arr[i] = start + i * step;
	}

	return arr;
}
