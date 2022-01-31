import { generateIssueNestedTestStepData, generateIssueTestStepData } from '../../../shared/generate-data-structure';

export function generateIssueTestSteps({ payload }) {
	return payload.map((item) => {
		if (item.issueKey) {
			return generateIssueNestedTestStepData(item.index, item.issueKey, item.url, item.summary, item.stepsCount, item.attachments);
		} else {
			return generateIssueTestStepData(item.index, item.description, item.expectedResult, item.attachments);
		}
	});
}
