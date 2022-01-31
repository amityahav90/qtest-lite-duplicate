import { LogLevel, LogType } from '../enums';
import { logFormattedMessage } from './log-formatted-message';
import { AppSettingsService } from '../app-settings-service';

export class LogService {
	constructor(path) {
		this.path = path;
		this.type = LogType.FORGE;
	}

	sendMessage(level, message, error) {
		if (LogService.levels[level.toLowerCase()]) {
			logFormattedMessage(this.createMessage(level, message, error));
		}
	}

	createMessage(level, message, error) {
		const data = {
			type: this.type,
			path: this.path,
			message: message
		};

		if (error) {
			data.error = error;
		}

		return {
			level: level,
			data: data
		};
	}

	info(message) {
		this.sendMessage(LogLevel.INFO, message);
	}

	debug(message) {
		this.sendMessage(LogLevel.DEBUG, message);
	}

	warning(message) {
		this.sendMessage(LogLevel.WARNING, message);
	}

	error(message, error) {
		this.sendMessage(LogLevel.ERROR, message, error);
	}
}

LogService.levels = {
	info: false,
	debug: false,
	warn: false,
	error: false
};

function initLevels() {
	const appSettingsService = new AppSettingsService();
	const levels = appSettingsService.getLogLevels();

	levels.forEach((level) => {
		if (LogService.levels[level.toLowerCase()] !== undefined) {
			LogService.levels[level.toLowerCase()] = true;
		} else {
			console.error(`Log level [${level}] does not exist in the LogService.`);
		}
	});
}

initLevels();
