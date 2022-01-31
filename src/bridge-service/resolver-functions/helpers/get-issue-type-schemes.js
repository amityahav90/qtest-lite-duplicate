import { ForgeApiManager } from '../../../shared/forge-api-manager';

export async function getIssueTypeSchemes() {
	const schemeTypesResponse = await ForgeApiManager.getIssueTypeSchemes();

	return (await schemeTypesResponse.json()).values || [];
}
