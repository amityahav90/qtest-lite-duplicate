import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function getProjectTestFoldersLinkMap(request) {
	const projectPropertyManager = new ProjectPropertyManager(request.context.extension.project.id);

	return await projectPropertyManager.getTestFoldersLinkMap();
}
