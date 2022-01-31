import { InternalSettingsStorageManager } from '../../shared/storage-manager';

export async function resetInitializeApp() {
	await InternalSettingsStorageManager.resetInitializedApp();
}
