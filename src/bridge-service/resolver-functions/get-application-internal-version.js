import { EnvironmentVariables } from "../../shared/environment-variables";

export function getApplicationInternalVersion() {
	return EnvironmentVariables.APP_INTERNAL_VERSION;
}
