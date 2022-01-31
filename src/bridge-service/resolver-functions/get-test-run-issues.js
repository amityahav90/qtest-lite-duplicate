import { CustomFieldName } from '../../../shared/enums';
import { ForgeApiManager } from '../../shared/forge-api-manager';
import { findKeyByValue } from '../../../shared/tools';

export async function getTestRunIssues({
	context,
	payload: {
		start,
		limit,
		jqlOptions: { search, sorting, cycleId }
	}
}) {
	const projectId = context.extension.project.id;
	const query = {
		jql: `issuetype = 'Test Run' AND project = ${projectId}`,
		startAt: start,
		maxResults: limit,
		expand: ['names']
	};

	if (cycleId) {
		query.jql += ` AND "${CustomFieldName.CYCLE}.id" = ${cycleId}`;
	}

	if (search) {
		query.jql += ` AND text ~ '${search}'`;
	}

	if (sorting && sorting.key && sorting.order) {
		query.jql += ` ORDER BY ${sorting.key} ${sorting.order}`;
	}

	const result = await ForgeApiManager.searchJiraIssues(query);
	const cycleCustomFieldName = findKeyByValue(result.names, CustomFieldName.CYCLE);
	const testStatusCustomFieldName = findKeyByValue(result.names, CustomFieldName.TEST_STATUS);
	const plannedStartDateCustomFieldName = findKeyByValue(result.names, CustomFieldName.PLANNED_START_DATE);
	const plannedEndDateCustomFieldName = findKeyByValue(result.names, CustomFieldName.PLANNED_END_DATE);

	result.issues = result.issues.map((issue) => ({
		id: issue.id,
		key: issue.key,
		summary: issue.fields.summary,
		status: issue.fields[testStatusCustomFieldName] && issue.fields[testStatusCustomFieldName].value,
		assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
		plannedStartDate: issue.fields[plannedStartDateCustomFieldName],
		plannedEndDate: issue.fields[plannedEndDateCustomFieldName],
		cycleId: issue.fields[cycleCustomFieldName] && issue.fields[cycleCustomFieldName].id
	}));

	return result;
}
