import { ExternalSettingsStorageManager } from '../../shared/storage-manager';

export async function getExternalSettings() {
	return await ExternalSettingsStorageManager.get();
}
