import { ForgeApiManager } from '../../../shared/forge-api-manager';
import { configCustomField } from './config-custom-field.function';
import { LogService } from '../../../../shared/log-service';
import { BridgeServiceFunction } from '../../../../shared/enums';

export async function createCustomField(payload, options, issueTypes) {
	const log = new LogService(BridgeServiceFunction.CREATE_CUSTOM_FIELD);

	// Check if the custom field is already exists. If it does, will not create a new one
	if (await ForgeApiManager.isCustomFiledNameExists(payload.name)) {
		log.debug(`A custom filed with the name ${payload.name} already exists. Will not add a new one.`);
		return;
	}

	// Creating the new custom field
	const customField = await ForgeApiManager.createIssueCustomField(payload);

	await configCustomField(customField.id, options, issueTypes);
}
