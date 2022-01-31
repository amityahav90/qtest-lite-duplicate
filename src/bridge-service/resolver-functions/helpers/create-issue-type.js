import { ForgeApiManager } from '../../../shared/forge-api-manager';

export async function createIssueType(payload) {
	const response = await ForgeApiManager.createIssueType(payload);

	return await response.json();
}
