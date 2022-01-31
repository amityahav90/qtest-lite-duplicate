import { ForgeApiManager } from '../../../shared/forge-api-manager';
import { configCustomField } from './config-custom-field.function';

export async function configManifestCustomField(name, options, issueTypes) {
	const customFieldFolderId = await ForgeApiManager.getCustomFieldId(name);

	await configCustomField(customFieldFolderId, options, issueTypes);
}
