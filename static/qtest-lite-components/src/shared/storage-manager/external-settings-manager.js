import { ExternalCommunicationService } from '../external-communication';

export class ExternalSettingsManager {
	constructor() {
		this.state = {};
		this.externalCommunicationService = new ExternalCommunicationService();
	}

	updateStorage() {
		this.externalCommunicationService
			.setExternalSettings(this.state)
			.then(() => {})
			.catch(() => {});
	}
}
