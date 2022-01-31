import { ForgeApiManager } from '../../../shared/forge-api-manager';

export async function getUsers(userIds) {
	const response = await ForgeApiManager.getUsers(userIds);

	return (await response.json()).values || [];
}
