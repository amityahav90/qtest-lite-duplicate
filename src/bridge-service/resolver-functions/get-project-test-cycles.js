import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function getProjectTestCycles(request) {
	const projectPropertyManager = new ProjectPropertyManager(request.context.extension.project.id);

	return await projectPropertyManager.getTestCycles(request.payload.versionId);
}
