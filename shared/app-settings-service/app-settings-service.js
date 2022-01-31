const appSettings = require('../../app-settings.json');

export class AppSettingsService {
	constructor() {
		if (!AppSettingsService.instance) {
			AppSettingsService.instance = this;
		}

		return AppSettingsService.instance;
	}

	getLogLevels() {
		return appSettings.log.levels.value.split(',');
	}

	getDateFormat() {
		return appSettings.date.format.value;
	}
}
