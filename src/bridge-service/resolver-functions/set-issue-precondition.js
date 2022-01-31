import { IssuePropertyManager } from '../../shared/issue-property-manager';
import { IssueHistoryManager } from '../../shared/issue-history-manager';

export async function setIssuePrecondition({ context, payload }) {
	const issueKey = context.extension.issue.key;
	const issuePropertyManager = new IssuePropertyManager(issueKey);
	const issueHistoryManager = new IssueHistoryManager(context.accountId, issueKey);
	const oldPrecondition = await issuePropertyManager.getPrecondition();

	await issuePropertyManager.setPrecondition(payload.precondition);
	await issueHistoryManager.saveIssuePreconditionChanges(oldPrecondition, payload.precondition);
}
