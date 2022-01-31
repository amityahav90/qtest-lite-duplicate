import { ForgeApiManager } from '../../../shared/forge-api-manager';

export async function linkIssueTypesToScheme(schemeId, issueTypeIds) {
	return await ForgeApiManager.linkIssueTypesToSchemes(schemeId, issueTypeIds);
}
