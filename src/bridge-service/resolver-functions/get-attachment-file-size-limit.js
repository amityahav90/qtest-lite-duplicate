import { ForgeApiManager } from '../../shared/forge-api-manager';

export async function getAttachmentFileSizeLimit() {
	return await ForgeApiManager.getAttachmentFileSizeLimit();
}
