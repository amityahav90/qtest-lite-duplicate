/**
 * Swaps items in an array between the specified indexes.
 * @param arr
 * @param fromIndex
 * @param toIndex
 */
export function arraySwapItem(arr, fromIndex, toIndex) {
	if (toIndex >= arr.length && toIndex > 0) {
		throw new Error(`"toIndex" [${toIndex}] is out of array bounds [${arr.length}]`);
	}

	if (fromIndex >= arr.length && fromIndex > 0) {
		throw new Error(`"fromIndex" [${fromIndex}] is out of array bounds [${arr.length}]`);
	}

	arr[fromIndex] = [arr[toIndex], (arr[toIndex] = arr[fromIndex])][0];
}
