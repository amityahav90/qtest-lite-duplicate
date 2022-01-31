import { generateGuid22 } from '../tools';

export function generateIssueNestedTestStepData(index = 0, issueKey = '', url = '', summary = '', stepsCount = 0, attachments = []) {
	return {
		id: generateGuid22(),
		index: index,
		isTestCase: true,
		issueKey: issueKey,
		url: url,
		summary: summary,
		stepsCount: stepsCount,
		attachments
	};
}
