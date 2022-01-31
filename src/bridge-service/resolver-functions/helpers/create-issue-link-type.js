import { ForgeApiManager } from '../../../shared/forge-api-manager';

export async function createIssueLinkType(payload) {
	return await ForgeApiManager.createIssueLinkType(payload);
}
