import { CustomFieldName } from '../../../shared/enums';
import { ForgeApiManager } from '../../shared/forge-api-manager';

export async function unlinkTestCasesFromFolder({ context, payload: folder }) {
	const projectId = context.extension.project.id;
	const query = {
		jql: `issuetype = 'Test Case' AND project = ${projectId} AND "${CustomFieldName.FOLDER}.id" = ${folder.id}`,
		expand: ['names']
	};

	const result = await ForgeApiManager.searchJiraIssues(query);
	const folderCustomFieldId = await ForgeApiManager.getCustomFieldId(CustomFieldName.FOLDER);

	if (!result.issues) return;

	let issuesIds = [];

	for (const key in result.issues) {
		issuesIds.push(result.issues[key].id);
	}

	if (issuesIds.length > 0) await ForgeApiManager.updateIssueCustomField(folderCustomFieldId, issuesIds);
}
