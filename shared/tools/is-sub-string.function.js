export function isSubString(target, query, caseSensitive = false) {
	target = caseSensitive ? target : target.toLowerCase();
	query = caseSensitive ? query : query.toLowerCase();

	return target.indexOf(query) !== -1;
}
