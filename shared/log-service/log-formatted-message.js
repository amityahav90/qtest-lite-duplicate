export function logFormattedMessage(message) {
	if (message) {
		if (message.level) {
			if (console[message.level.toLowerCase()]) {
				console[message.level.toLowerCase()](message.data);
			} else {
				console.error("logFormattedMessage: 'message.level' is invalid.");
			}
		} else {
			console.error("logFormattedMessage: 'message.level' is undefined.");
		}
	} else {
		console.error("logFormattedMessage: 'message' is undefined.");
	}
}
