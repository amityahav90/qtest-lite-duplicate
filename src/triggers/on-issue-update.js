import { IssuePropertyManager } from '../shared/issue-property-manager';
import { IssueUpdateTypeEnum } from '../../shared/enums';

export async function onIssueUpdate(event, context) {
	if (event === null || event === undefined || JSON.stringify(event) === '{}') {
		return;
	}

	const issue = event.issue;
	const changes = event.changelog.items;

	// Loop through the changelog items and handle each change
	for (const change of changes) {
		switch (change.field) {
			case IssueUpdateTypeEnum.ATTACHMENT:
				await handleAttachmentsChange(change, issue.key, issue.fields.issuetype.name);
				break;
			default:
				break;
		}
	}
}

async function handleAttachmentsChange(change, issueKey, issueType) {
	if (issueType !== 'Test Case') {
		console.debug(
			`Issue [${issueKey}] is of type [${issueType}]. Removing attachments from steps is only done in 'Test Case' issue type.`
		);
	}

	const attachmentsToRemove = [];

	// Indicates that an attachment has been removed
	if (change.from !== null && change.to === null) {
		attachmentsToRemove.push(`${change.from}`);
	}

	if (attachmentsToRemove.length === 0) {
		return;
	}

	const issuePropertyManager = new IssuePropertyManager(issueKey);
	const steps = await issuePropertyManager.getSteps();

	steps.forEach((step) => {
		if (step.attachments) {
			step.attachments.forEach((attachment, index) => {
				if (attachmentsToRemove.indexOf(attachment.id) !== -1) {
					step.attachments.splice(index, 1);
				}
			});

			if (step.attachments.length === 0) {
				step.attachments = undefined;
			}
		}
	});

	await issuePropertyManager.setSteps(steps);
}
