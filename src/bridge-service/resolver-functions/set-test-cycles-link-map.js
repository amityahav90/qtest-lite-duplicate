import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function setTestCyclesLinkMap({ context, payload: linkMap }) {
	const projectKey = context.extension.project.id;
	const projectPropertyManager = new ProjectPropertyManager(projectKey);

	await projectPropertyManager.setTestCyclesLinkMap(linkMap);
}
