import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function setProjectTestCycles({ context, payload: { versionId, cycles } }) {
	const projectKey = context.extension.project.id;
	const projectPropertyManager = new ProjectPropertyManager(projectKey);

	await projectPropertyManager.setTestCycles(versionId, cycles);
}
