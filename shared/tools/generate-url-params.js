/**
 * Generates URLSearchParams from provided "params" object
 * @param params {Object.<string, string | number | Array.<string | number>>}
 * @returns {URLSearchParams}
 */
export function generateUrlParams(params) {
	const urlSearchParams = new URLSearchParams();

	Object.keys(params).forEach((paramsKey) => {
		const paramsValue = params[paramsKey];

		if (Array.isArray(paramsValue)) {
			paramsValue.forEach((value) => {
				urlSearchParams.append(paramsKey, value);
			});
		} else {
			urlSearchParams.append(paramsKey, paramsValue);
		}
	});

	return urlSearchParams;
}
