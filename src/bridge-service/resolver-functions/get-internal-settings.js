import { InternalSettingsStorageManager } from '../../shared/storage-manager';

export async function getInternalSettings() {
	return await InternalSettingsStorageManager.get();
}
