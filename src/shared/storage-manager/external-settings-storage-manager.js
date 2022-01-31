import { storage } from '@forge/api';
import { StorageKey } from '../../../shared/enums';
import { deepCopyJson } from '../../../shared/tools';
import { defaultExternalSettings } from '../../../default-external-settings';

export class ExternalSettingsStorageManager {}

ExternalSettingsStorageManager.get = async function () {
	return (await storage.get(StorageKey.EXTERNAL_SETTINGS)) || deepCopyJson(defaultExternalSettings);
};

ExternalSettingsStorageManager.set = async function (externalSettings) {
	return await storage.set(StorageKey.EXTERNAL_SETTINGS, externalSettings);
};
