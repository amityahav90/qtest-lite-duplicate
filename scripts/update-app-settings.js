console.log('Updating App Settings...');

const fs = require('fs');
const path = require('path');
const process = require('process');
const args = process.argv.slice(2);

const filePath = path.join(__dirname, '../app-settings.json');

readFile(filePath);

function readFile(path) {
	fs.readFile(path, 'utf8', (err, contents) => {
		const settings = parseAppSettings(contents);

		if (args.length === 0) {
			printUsage(settings);
		}

		args.forEach((arg) => {
			const [key, value] = splitArgument(arg);
			const settingsLevel = getSettingsLevel(key, settings);

			if (settingsLevel) {
				if (isValidValue(settingsLevel, key, value)) {
					try {
						settingsLevel.value = JSON.parse(value);
					} catch (e) {
						settingsLevel.value = value;
					}

					console.log(`Updated "${key}" to: "${value}"`);
				}
			}
		});

		writeFile(path, settings);
	});
}

function writeFile(path, value) {
	const jsonString = `${JSON.stringify(value, null, 4)}
`;

	fs.writeFile(path, jsonString, function (err) {
		if (err) {
			console.error(`Failed to update the App Settings file`, err);
			process.exit(1);
		}

		console.log('Successfully updated App Settings.');
	});
}

function splitArgument(arg) {
	const [key, value] = arg.split('=');

	if (value === undefined) {
		console.error(`Missing value for parameter: ${key}`);
		process.exit(2);
	}

	return [key, value];
}

function parseAppSettings(jsonString) {
	try {
		return JSON.parse(jsonString);
	} catch (e) {
		console.error('Failed to parse the app-settings file.');
		process.exit(2);
	}
}

function getSettingsLevel(fullKey, settings) {
	const keyLevels = fullKey.split('-');
	const check = (key, settingsLevel) => {
		if (settingsLevel[key] !== undefined) {
			if (keyLevels.length === 0) {
				return settingsLevel[key];
			}

			return check(keyLevels.shift(), settingsLevel[key]);
		} else {
			return undefined;
		}
	};

	const result = check(keyLevels.shift(), settings);

	if (!result) {
		console.warn(`Warning: Invalid argument key: ${fullKey}`);
	}

	return result;
}

function isValidValue(settingsLevel, key, value) {
	const valueItems = `${value}`.split(',');

	if (settingsLevel.allowed === undefined) {
		return true;
	}

	const notAllowed = valueItems.filter((valueItem) => settingsLevel.allowed.indexOf(valueItem) === -1);

	if (notAllowed.length === 0) {
		return true;
	}

	console.error(`Invalid value(s): ${JSON.stringify(notAllowed)} in key ${key}.
	- Allowed values: ${JSON.stringify(settingsLevel.allowed)}`);
	process.exit(2);
}

function printUsage(settings) {
	console.log('Usage:');
	console.log('node update-app-settings.js key=<value>,<value> ...');

	printUsageHelper(settings);

	process.exit(0);
}

function printUsageHelper(settingsLevel, partKey = '') {
	const keys = Object.keys(settingsLevel);

	if (keys.indexOf('value') !== -1) {
		let message = `-> ${partKey}=`;

		if (settingsLevel.allowed) {
			message += `<allowed values: ${JSON.stringify(settingsLevel.allowed)}>`;
		} else {
			message += `<value>`;
		}

		console.log(message);

		return;
	}

	keys.forEach((key) => {
		printUsageHelper(settingsLevel[key], partKey ? `${partKey}-${key}` : key);
	});
}
