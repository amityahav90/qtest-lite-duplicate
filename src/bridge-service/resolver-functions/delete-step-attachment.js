import { ForgeApiManager } from '../../shared/forge-api-manager';

export function deleteStepAttachment(request) {
	return ForgeApiManager.deleteStepAttachment(request.payload.attachmentId);
}
