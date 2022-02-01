import { EnvironmentVariables } from "../../shared/environment-variables";

export async function getApplicationInternalVersion() {
	console.log('EnvironmentVariables.APP_INTERNAL_VERSION', EnvironmentVariables.APP_INTERNAL_VERSION);
	console.log('EnvironmentVariables.DATA_SERVICE_URL', EnvironmentVariables.DATA_SERVICE_URL);
	console.log('EnvironmentVariables.MIGRATION_SERVICE_URL', EnvironmentVariables.MIGRATION_SERVICE_URL);
	console.log('process.env.APP_INTERNAL_VERSION', process.env.APP_INTERNAL_VERSION);
	console.log('process.env.DATA_SERVICE_URL', process.env.DATA_SERVICE_URL);
	console.log('process.env.MIGRATION_SERVICE_URL', process.env.MIGRATION_SERVICE_URL);
	return EnvironmentVariables.APP_INTERNAL_VERSION;
}
