import { ForgeApiManager } from '../../shared/forge-api-manager';

export async function linkTwoIssues({ context, payload }) {
	const status = await ForgeApiManager.linkTwoIssues(payload);

	return status === 201;
}
