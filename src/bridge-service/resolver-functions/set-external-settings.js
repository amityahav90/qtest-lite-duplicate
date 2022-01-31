import { ExternalSettingsStorageManager } from '../../shared/storage-manager';

export async function setExternalSettings({ payload: externalSettings }) {
	return await ExternalSettingsStorageManager.set(externalSettings);
}
