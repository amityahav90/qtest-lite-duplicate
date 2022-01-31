/**
 * Moves items in an array between the specified indexes.
 * @param arr
 * @param fromIndex
 * @param toIndex
 */
export function arrayMoveItem(arr, fromIndex, toIndex) {
	if (toIndex >= arr.length && toIndex > 0) {
		throw new Error(`"toIndex" [${toIndex}] is out of array bounds [${arr.length}]`);
	}

	if (fromIndex >= arr.length && fromIndex > 0) {
		throw new Error(`"fromIndex" [${fromIndex}] is out of array bounds [${arr.length}]`);
	}

	arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);
}
