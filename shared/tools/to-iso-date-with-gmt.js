/**
 * Converts UTC date string by Time Zone
 *	Example: ('2021-11-03T11:44:05.458Z', 'America/New_York') -> '2021-11-03T07:44:05.458'
 * @param date {string}
 * @param timeZone {string}
 * @returns {string}
 */
export function convertUTCToTimeZone(date, timeZone) {
	const localeDate = new Date(date);
	const dateWithTimeZone = new Date(localeDate.toLocaleString('en-US', { timeZone: timeZone }));

	dateWithTimeZone.setMilliseconds(localeDate.getMilliseconds());

	return dateWithTimeZone.toISOString().replace('Z', '');
}
