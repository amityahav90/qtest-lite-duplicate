/**
 * Generates a random GUID with a default of maximum 8 characters.
 * @param max
 * @returns {string}
 */
export function generateGuidMax(max = 8) {
	return (Math.random().toString(16) + '000000000').substr(2, max);
}
