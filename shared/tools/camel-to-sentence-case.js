export function camelToSentenceCase(camelCaseStr) {
	const result = camelCaseStr.replace(/([A-Z])/g, ' $1');
	return result.charAt(0).toUpperCase() + result.slice(1);
}
