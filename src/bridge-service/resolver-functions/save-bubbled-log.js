import { logFormattedMessage } from '../../../shared/log-service';

/**
 * Gets a log object from the Custom UI and prints it using `console' according to the log level (info/debug/error/etc).
 * @param message
 */
export function saveBubbledLog({ payload: message }) {
	logFormattedMessage(message);
}
