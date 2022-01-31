import { ForgeApiManager } from '../../shared/forge-api-manager';
import { getProjectTestFoldersLinkMap } from './get-test-folders-link-map';
import { LogService } from '../../../shared/log-service';
import { setProjectTestFoldersLinkMap } from './set-test-folders-link-map';
import { CustomFieldName } from '../../../shared/enums/custom-field-name.enum';

export async function moveTestCasesToFolder(request) {
	const log = new LogService('moveTestCasesToFolder');
	const {
		payload: { testCases, folder }
	} = request;
	const folderCustomFieldId = await ForgeApiManager.getCustomFieldId(CustomFieldName.FOLDER);
	const testFoldersLinkMap = await getProjectTestFoldersLinkMap(request);

	for (const testCase of testCases) {
		try {
			await ForgeApiManager.updateIssueCustomField(folderCustomFieldId, testCase.id, folder);

			if (testCase.folderId && testFoldersLinkMap[testCase.folderId]) {
				testFoldersLinkMap[testCase.folderId] = testFoldersLinkMap[testCase.folderId].filter(
					(testCaseId) => testCaseId !== testCase.id
				);
			}

			if (folder) {
				if (testFoldersLinkMap[folder.id]) {
					if (testFoldersLinkMap[folder.id].indexOf(testCase.id) === -1) {
						testFoldersLinkMap[folder.id].push(testCase.id);
					}
				} else {
					testFoldersLinkMap[folder.id] = [testCase.id];
				}
			}
		} catch (e) {
			log.error(`Failed move the Test Case [${testCase.id}] to a folder [${(folder && folder.id) || 'None'}]`, e);
		}
	}

	await setProjectTestFoldersLinkMap({ context: request.context, payload: testFoldersLinkMap });
}
