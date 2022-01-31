import { LogType } from '../../../../../shared/enums';
import { LogService } from '../../../../../shared/log-service';
import { ExternalCommunicationService } from '../external-communication';

export class CustomUiLogService extends LogService {
	constructor(path) {
		super(path);
		this.type = LogType.CUSTOM_UI;
		this.externalCommunicationService = new ExternalCommunicationService();
	}

	sendMessage(level, message, error) {
		this.externalCommunicationService
			.saveBubbledLog(this.createMessage(level, message, error))
			.then(() => {})
			.catch(() => {});
	}
}
