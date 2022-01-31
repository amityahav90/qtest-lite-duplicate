import api, { route } from '@forge/api';
import { IssuePropertyManager } from '../issue-property-manager';
import { TREE_ITEM_ROOT_ID } from '../../../shared/constants';

export class ProjectPropertyManager {
	constructor(projectKey) {
		this.projectKey = projectKey;
	}

	async getTestFolders() {
		return (await (await this.getProperty('test-folders')).json()).value || [];
	}

	async setTestFolders(value) {
		return await this.setProperty('test-folders', value);
	}

	async getTestFoldersLinkMap() {
		return (await (await this.getProperty('test-folders-link-map')).json()).value || {};
	}

	async setTestFoldersLinkMap(value) {
		return await this.setProperty('test-folders-link-map', value);
	}

	async getTestCycles(versionId) {
		return (
			(await (await this.getProperty(`test-cycles-${versionId}`)).json()).value || [
				{
					id: TREE_ITEM_ROOT_ID,
					children: []
				}
			]
		);
	}

	async setTestCycles(versionId, value) {
		return await this.setProperty(`test-cycles-${versionId}`, value);
	}

	async getTestCyclesLinkMap() {
		return (await (await this.getProperty('test-cycles-link-map')).json()).value || {};
	}

	async setTestCyclesLinkMap(value) {
		return await this.setProperty('test-cycles-link-map', value);
	}

	async getProperty(name) {
		return await api
			.asUser()
			.requestJira(route`/rest/api/3/project/${this.projectKey}/properties/${IssuePropertyManager.getPropertyKey(name)}`, {
				headers: { Accept: 'application/json' }
			});
	}

	async setProperty(name, value) {
		return await api
			.asUser()
			.requestJira(route`/rest/api/3/project/${this.projectKey}/properties/${IssuePropertyManager.getPropertyKey(name)}`, {
				method: 'PUT',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify(value)
			});
	}
}
