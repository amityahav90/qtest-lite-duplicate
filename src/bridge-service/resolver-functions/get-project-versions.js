import { ForgeApiManager } from '../../shared/forge-api-manager';

export function getProjectVersions(request) {
	return ForgeApiManager.getProjectVersions(request.context.extension.project.id);
}
