import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function getProjectTestFolders(request) {
	const projectPropertyManager = new ProjectPropertyManager(request.context.extension.project.id);

	return await projectPropertyManager.getTestFolders();
}
