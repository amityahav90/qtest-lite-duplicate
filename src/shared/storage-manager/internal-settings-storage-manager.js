import { storage } from '@forge/api';
import { StorageKey } from '../../../shared/enums';

const defaultInternalSettings = {
	initializedApp: false
};

export class InternalSettingsStorageManager {}

InternalSettingsStorageManager.initializedApp = async function () {
	return InternalSettingsStorageManager.set((internalSettings) => {
		internalSettings.initializedApp = true;
	});
};

InternalSettingsStorageManager.resetInitializedApp = async function () {
	return InternalSettingsStorageManager.set((internalSettings) => {
		internalSettings.initializedApp = false;
	});
};

InternalSettingsStorageManager.get = async function () {
	return (await storage.get(StorageKey.INTERNAL_SETTINGS)) || { ...defaultInternalSettings };
};

InternalSettingsStorageManager.set = async function (interceptFn = () => {}) {
	const internalSettings = InternalSettingsStorageManager.get();

	interceptFn(internalSettings);

	return await storage.set(StorageKey.INTERNAL_SETTINGS, internalSettings);
};
