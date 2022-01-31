import { generateGuid22 } from '../tools';

export function generateIssueTestStepData(index = 0, description = '', expectedResult = '', attachments = []) {
	return { id: generateGuid22(), index, description, expectedResult, attachments };
}
