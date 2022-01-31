const { defaults } = require('jest-config');

const config = {
	verbose: true,
	moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'jsx', 'ts', 'tsx', 'scss'],
	moduleDirectories: ['node_modules', 'src'],
	setupFiles: ['<rootDir>/jest/globals.js'],
	moduleNameMapper: {
		'\\.(css|scss)$': '<rootDir>/src/__mocks__/styles-mock.js'
	},
	testEnvironment: 'jsdom'
};

module.exports = config;
