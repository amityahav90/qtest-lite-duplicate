import { generateIssueTestStepAttachmentData } from '../../../shared/generate-data-structure';

export function generateIssueTestStepAttachments({ payload }) {
	return payload.map((item) => generateIssueTestStepAttachmentData(item.id, item.filename, item.size, item.mimeType));
}
