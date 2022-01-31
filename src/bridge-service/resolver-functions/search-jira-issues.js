import { ForgeApiManager } from '../../shared/forge-api-manager';

export async function searchJiraIssues({ payload: query }) {
	const responseJson = await ForgeApiManager.searchJiraIssues(query);

	return (responseJson && responseJson.issues) || [];
}
