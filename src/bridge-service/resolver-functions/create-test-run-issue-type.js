import { ForgeApiManager } from '../../shared/forge-api-manager';

export async function createTestRunIssueType({ context, payload }) {
	return ForgeApiManager.createTestRunIssueType(payload);
}
