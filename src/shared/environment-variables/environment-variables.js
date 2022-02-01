export const EnvironmentVariables = {
	get DATA_SERVICE_URL () { return process.env.DATA_SERVICE_URL; },
	get MIGRATION_SERVICE_URL () { return process.env.MIGRATION_SERVICE_URL; },
	get APP_INTERNAL_VERSION () { return process.env.APP_INTERNAL_VERSION; }
};
