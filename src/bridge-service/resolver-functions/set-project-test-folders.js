import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function setProjectTestFolders({ context, payload: folders }) {
	const projectKey = context.extension.project.id;
	const projectPropertyManager = new ProjectPropertyManager(projectKey);

	await projectPropertyManager.setTestFolders(folders);
}
