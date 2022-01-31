import { generateIssueTestPreconditionData } from '../../../shared/generate-data-structure';

export function generateIssueTestPrecondition({ payload }) {
	return generateIssueTestPreconditionData(payload.precondition);
}
