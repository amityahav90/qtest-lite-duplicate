import { properties } from '@forge/api';

export class IssuePropertyManager {
	constructor(issueKey) {
		this.issueKey = issueKey;
	}

	async getHistory() {
		return (await this.getProperty('history')) || [];
	}

	async setHistory(value) {
		return await this.setProperty('history', value);
	}

	async getSteps() {
		return (await this.getProperty('steps')) || [];
	}

	async setSteps(value) {
		return await this.setProperty('steps', value);
	}

	async getPrecondition() {
		return (await this.getProperty('precondition')) || '';
	}

	async setPrecondition(value) {
		return await this.setProperty('precondition', value);
	}

	async getProperty(name) {
		return await properties.onJiraIssue(this.issueKey).get(IssuePropertyManager.getPropertyKey(name));
	}

	async setProperty(name, value) {
		return await properties.onJiraIssue(this.issueKey).set(IssuePropertyManager.getPropertyKey(name), value);
	}
}

IssuePropertyManager.getPropertyKey = function (name) {
	return `tricentis-qtest-lite-${name}`;
};
