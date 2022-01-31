import api, { route } from '@forge/api';
import { generateUrlParams } from '../../../shared/tools';
import { CustomFieldName } from '../../../shared/enums';

const customFieldKeyMap = {
	[CustomFieldName.FOLDER]: 'qtest-lite-custom-field-folder',
	[CustomFieldName.CYCLE]: 'qtest-lite-custom-field-cycle',
	[CustomFieldName.EXECUTED_BY]: 'qtest-lite-custom-field-executed-by',
	[CustomFieldName.PLANNED_START_DATE]: 'qtest-lite-custom-field-planned-start-date',
	[CustomFieldName.PLANNED_END_DATE]: 'qtest-lite-custom-field-planned-end-date'
};

export class ForgeApiManager {
	static async createIssueType(payload) {
		return await api.asApp().requestJira(route`/rest/api/3/issuetype`, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	}

	static async createIssueLinkType(payload) {
		return await api.asApp().requestJira(route`/rest/api/3/issueLinkType`, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	}

	static async getIssueTypeSchemes() {
		return await api.asApp().requestJira(route`/rest/api/3/issuetypescheme`, { headers: { Accept: 'application/json' } });
	}

	static async getCurrentUserDetails() {
		return await api.asUser().requestJira(route`/rest/api/3/myself`, { headers: { Accept: 'application/json' } });
	}

	static async getUsers(userIds) {
		const params = generateUrlParams({
			maxResults: userIds.length,
			accountId: userIds
		});

		return await api.asApp().requestJira(route`/rest/api/3/user/bulk?${params}`, { headers: { Accept: 'application/json' } });
	}

	static async linkIssueTypesToSchemes(schemeId, issueTypeIds) {
		const payload = { issueTypeIds: issueTypeIds };

		return await api.asApp().requestJira(route`/rest/api/3/issuetypescheme/${schemeId}/issuetype`, {
			method: 'PUT',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	}

	static async createIssueCustomField(payload) {
		const response = await api.asApp().requestJira(route`/rest/api/3/field`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		return await response.json();
	}

	static async getCustomFieldDefaultContext(fieldId) {
		const response = await api.asApp().requestJira(route`/rest/api/3/field/${fieldId}/context`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const responseJson = await response.json();

		return responseJson ? responseJson.values[0] : undefined;
	}

	static async createIssueCustomFieldOptions(fieldId, defaultContextId, options) {
		const fieldOptionsResponse = await api.asApp().requestJira(route`/rest/api/3/field/${fieldId}/context/${defaultContextId}/option`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(options)
		});

		return await fieldOptionsResponse.json();
	}

	static async addIssueTypesToFieldContext(fieldId, contextId, issueTypeIds) {
		const body = {
			issueTypeIds: issueTypeIds
		};

		return await api.asApp().requestJira(route`/rest/api/3/field/${fieldId}/context/${contextId}/issuetype`, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
	}

	static async getAllScreens() {
		const response = await api.asApp().requestJira(route`/rest/api/2/screens`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const responseJson = await response.json();

		return responseJson ? responseJson.values : [];
	}

	static async getScreenTabs(screenId) {
		const response = await api.asApp().requestJira(route`/rest/api/3/screens/${screenId}/tabs`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const responseJson = await response.json();

		return responseJson || [];
	}

	static async assignCustomFieldToScreen(screenId, tabId, fieldId) {
		const body = {
			fieldId: fieldId
		};

		const response = await api.asApp().requestJira(route`/rest/api/2/screens/${screenId}/tabs/${tabId}/fields`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
	}

	static async searchJiraIssues(query) {
		const response = await api.asApp().requestJira(route`/rest/api/3/search`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(query)
		});

		return await response.json();
	}

	static async getAttachmentFileSizeLimit() {
		const response = await api.asApp().requestJira(route`/rest/api/3/attachment/meta`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const responseJson = await response.json();

		return responseJson ? responseJson.uploadLimit : -1;
	}

	static async deleteStepAttachment(attachmentId) {
		const response = await api.asApp().requestJira(route`/rest/api/3/attachment/${attachmentId}`, {
			method: 'DELETE'
		});

		return {
			status: response.status,
			isOk: response.ok
		};
	}

	static async getCustomFieldId(byName) {
		const params = generateUrlParams({ type: 'custom', query: byName, expand: 'key' });
		const response = await api.asApp().requestJira(route`/rest/api/3/field/search?${params}`, { method: 'GET' });
		const responseJson = await response.json();

		if (responseJson && responseJson.values && responseJson.values.length > 0) {
			const fields = responseJson.values.filter((field) => field.key.indexOf(customFieldKeyMap[byName]) !== -1);

			if (fields.length > 0) {
				return fields[0].id;
			}
		}

		throw new Error(`Couldn't find a custom field with the provided name [${byName}].`);
	}

	static async updateIssuesCustomField(fieldId, issuesIds, value) {
		const payload = {
			updates: [
				{
					issueIds: issuesIds,
					value: value
				}
			]
		};

		const response = await api.asApp().requestJira(route`/rest/api/3/app/field/${fieldId}/value`, {
			method: 'PUT',
			body: JSON.stringify(payload)
		});

		return response.status;
	}

	static async updateIssueCustomField(fieldId, issueId, value) {
		return await ForgeApiManager.updateIssuesCustomField(fieldId, [issueId], value);
	}

	static async getProjectVersions(projectId) {
		const response = await api.asApp().requestJira(route`/rest/api/3/project/${projectId}/versions`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const responseJson = await response.json();

		return responseJson || [];
	}

	static async isCustomFiledNameExists(name) {
		const response = await api.asApp().requestJira(route`/rest/api/3/field`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const responseJson = await response.json();
		const issueTypes = responseJson || [];

		return issueTypes.some((issuetype) => issuetype.custom && issuetype.name === name);
	}

	static async createTestRunIssueType(body) {
		const response = await api.asApp().requestJira(route`/rest/api/3/issue`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		return await response.json();
	}

	static async linkTwoIssues(body) {
		const response = await api.asApp().requestJira(route`/rest/api/3/issueLink`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		return response.status;
	}
}
