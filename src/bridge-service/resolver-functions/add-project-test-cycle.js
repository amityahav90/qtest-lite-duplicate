import { ProjectPropertyManager } from '../../shared/project-property-manager';

export async function addProjectTestCycle(request) {
	const projectPropertyManager = new ProjectPropertyManager(request.context.extension.project.id);
	const { versionId, parentId, cycle } = request.payload;
	const cycles = await projectPropertyManager.getTestCycles(versionId);
	const parent = cycles.filter((v) => v.id === parentId)[0];

	cycles.unshift(cycle);
	parent.children.push(cycle.id);

	await projectPropertyManager.setTestCycles(versionId, cycles);
}
