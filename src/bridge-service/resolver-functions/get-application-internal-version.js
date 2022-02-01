import { EnvironmentVariables } from "../../shared/environment-variables";

export async function getApplicationInternalVersion() {
	console.log('EnvironmentVariables.APP_INTERNAL_VERSION', EnvironmentVariables.APP_INTERNAL_VERSION);
	console.log('process.env.APP_INTERNAL_VERSION', process.env.APP_INTERNAL_VERSION);
	return EnvironmentVariables.APP_INTERNAL_VERSION;
}
