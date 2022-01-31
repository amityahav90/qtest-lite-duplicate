import { EnvironmentVariables } from "../../shared/environment-variables";

export async function getApplicationInternalVersion() {
	return EnvironmentVariables.APP_INTERNAL_VERSION;
}
