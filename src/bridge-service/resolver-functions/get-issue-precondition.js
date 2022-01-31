import { IssuePropertyManager } from '../../shared/issue-property-manager';

export async function getIssuePrecondition({ context, payload }) {
	const issuePropertyManager = new IssuePropertyManager(
		payload && JSON.stringify(payload) !== '{}' ? payload.issueKey : context.extension.issue.key
	);

	return await issuePropertyManager.getPrecondition();
}
