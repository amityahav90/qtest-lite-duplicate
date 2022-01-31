import { convertUTCToTimeZone } from '../../../../shared/tools';
import { ForgeApiManager } from '../../../shared/forge-api-manager';

export async function getUserDateTimeZoneTransformer() {
	const currentUser = await (await ForgeApiManager.getCurrentUserDetails()).json();

	return (date) => convertUTCToTimeZone(date, currentUser.timeZone);
}
