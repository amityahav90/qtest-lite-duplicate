import { IssuePropertyManager } from '../../shared/issue-property-manager';
import { IssueHistoryManager } from '../../shared/issue-history-manager';

export async function setIssueSteps({ context, payload: steps }) {
	const issueKey = context.extension.issue.key;
	const issuePropertyManager = new IssuePropertyManager(issueKey);
	const issueHistoryManager = new IssueHistoryManager(context.accountId, issueKey);
	const oldSteps = await issuePropertyManager.getSteps();

	await issuePropertyManager.setSteps(steps);
	await issueHistoryManager.saveIssueTestCaseChanges(oldSteps, steps);
}
