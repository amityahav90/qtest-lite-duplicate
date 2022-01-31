import { ForgeApiManager } from '../../shared/forge-api-manager';
import { findKeyByValue } from '../../../shared/tools';
import { CustomFieldName } from '../../../shared/enums/custom-field-name.enum';

export async function getTestCaseIssues({
	context,
	payload: {
		start,
		limit,
		jqlOptions: { search, sorting, folderId },
		excludeCurrentTestCase = false
	}
}) {
	const projectId = context.extension.project.id;
	const query = {
		jql: `issuetype = 'Test Case' AND project = ${projectId}`,
		startAt: start,
		maxResults: limit,
		expand: ['names']
	};

	if (excludeCurrentTestCase) {
		query.jql += ` AND issue != ${context.extension.issue.id}`;
	}

	if (folderId) {
		query.jql += ` AND "${CustomFieldName.FOLDER}.id" = ${folderId}`;
	}

	if (search) {
		query.jql += ` AND text ~ '${search}'`;
	}

	if (sorting && sorting.key && sorting.order) {
		query.jql += ` ORDER BY ${sorting.key} ${sorting.order}`;
	}

	const result = await ForgeApiManager.searchJiraIssues(query);
	const folderCustomFieldName = findKeyByValue(result.names, CustomFieldName.FOLDER);

	result.issues = result.issues.map((issue) => ({
		id: issue.id,
		key: issue.key,
		summary: issue.fields.summary,
		creator: issue.fields.creator.displayName,
		created: issue.fields.created,
		assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
		updated: issue.fields.updated,
		priority: {
			name: issue.fields.priority.name,
			url: issue.fields.priority.iconUrl
		},
		folderId: issue.fields[folderCustomFieldName] && issue.fields[folderCustomFieldName].id
	}));

	return result;
}
