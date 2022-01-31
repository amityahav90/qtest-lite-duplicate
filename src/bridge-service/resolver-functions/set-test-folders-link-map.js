import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function setProjectTestFoldersLinkMap({ context, payload: linkMap }) {
	const projectKey = context.extension.project.id;
	const projectPropertyManager = new ProjectPropertyManager(projectKey);

	await projectPropertyManager.setTestFoldersLinkMap(linkMap);
}
