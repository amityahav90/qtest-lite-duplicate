import { invoke, router } from '@forge/bridge';
import { BridgeServiceFunction } from '../../../../../shared/enums';

export class ExternalCommunicationService {
	constructor() {
		if (!ExternalCommunicationService.instance) {
			ExternalCommunicationService.instance = this;
		}

		return ExternalCommunicationService.instance;
	}

	getExternalSettings() {
		return this.withInvoke(BridgeServiceFunction.GET_EXTERNAL_SETTINGS);
	}

	getInternalSettings() {
		return this.withInvoke(BridgeServiceFunction.GET_INTERNAL_SETTINGS);
	}

	getIssueHistory() {
		return this.withInvoke(BridgeServiceFunction.GET_ISSUE_HISTORY);
	}

	getIssueSteps(payload) {
		return this.withInvoke(BridgeServiceFunction.GET_ISSUE_STEPS, { issueKey: payload });
	}

	getIssuePrecondition(payload) {
		return this.withInvoke(BridgeServiceFunction.GET_ISSUE_PRECONDITION, { issueKey: payload });
	}

	setIssuePrecondition(payload) {
		return this.withInvoke(BridgeServiceFunction.SET_ISSUE_PRECONDITION, { precondition: payload });
	}

	initializeApp() {
		return this.withInvoke(BridgeServiceFunction.INITIALIZE_APP);
	}

	resetInitializeApp() {
		return this.withInvoke(BridgeServiceFunction.RESET_INITIALIZE_APP);
	}

	saveBubbledLog(payload) {
		return this.withInvoke(BridgeServiceFunction.SAVE_BUBBLED_LOG, payload);
	}

	setExternalSettings(payload) {
		return this.withInvoke(BridgeServiceFunction.SET_EXTERNAL_SETTINGS, payload);
	}

	setIssueSteps(payload) {
		return this.withInvoke(BridgeServiceFunction.SET_ISSUE_STEPS, payload);
	}

	searchJiraIssues(query) {
		return this.withInvoke(BridgeServiceFunction.SEARCH_JIRA_ISSUES, query);
	}

	openUrl(url) {
		return router.navigate(url);
	}

	getAttachmentFileSizeLimit() {
		return this.withInvoke(BridgeServiceFunction.GET_ATTACHMENT_FILE_SIZE_LIMIT);
	}

	deleteStepAttachment(attachmentId) {
		return this.withInvoke(BridgeServiceFunction.DELETE_STEP_ATTACHMENT, { attachmentId });
	}

	getProjectTestFolders() {
		return this.withInvoke(BridgeServiceFunction.GET_PROJECT_TEST_FOLDERS);
	}

	setProjectTestFolders(payload) {
		return this.withInvoke(BridgeServiceFunction.SET_PROJECT_TEST_FOLDERS, payload);
	}

	getTestCaseIssues(payload) {
		return this.withInvoke(BridgeServiceFunction.GET_TEST_CASE_ISSUES, payload);
	}

	getProjectTestFoldersLinkMap() {
		return this.withInvoke(BridgeServiceFunction.GET_PROJECT_TEST_FOLDERS_LINK_MAP);
	}

	setProjectTestFoldersLinkMap(payload) {
		return this.withInvoke(BridgeServiceFunction.SET_PROJECT_TEST_FOLDERS_LINK_MAP, payload);
	}

	getProjectTestCyclesLinkMap() {
		return this.withInvoke(BridgeServiceFunction.GET_TEST_CYCLES_LINK_MAP);
	}

	setProjectTestCyclesLinkMap(payload) {
		return this.withInvoke(BridgeServiceFunction.SET_TEST_CYCLES_LINK_MAP, payload);
	}

	moveTestCasesToFolder(testCases, folder) {
		return this.withInvoke(BridgeServiceFunction.MOVE_TEST_CASES_TO_FOLDER, { testCases, folder });
	}

	getProjectVersions(payload) {
		return this.withInvoke(BridgeServiceFunction.GET_PROJECT_VERSIONS, payload);
	}

	getProjectTestCycles(versionId) {
		return this.withInvoke(BridgeServiceFunction.GET_PROJECT_TEST_CYCLES, { versionId });
	}

	setProjectTestCycles(versionId, cycles) {
		return this.withInvoke(BridgeServiceFunction.SET_PROJECT_TEST_CYCLES, { versionId, cycles });
	}

	addProjectTestCycle(versionId, parentId, cycle) {
		return this.withInvoke(BridgeServiceFunction.ADD_PROJECT_TEST_CYCLE, { versionId, parentId, cycle });
	}

	getTestRunIssues(payload) {
		return this.withInvoke(BridgeServiceFunction.GET_TEST_RUN_ISSUES, payload);
	}

	createTestRunIssueType(payload) {
		return this.withInvoke(BridgeServiceFunction.CREATE_TEST_RUN_ISSUE_TYPE, payload);
	}

	linkTwoIssues(payload) {
		return this.withInvoke(BridgeServiceFunction.LINK_TWO_ISSUES, payload);
	}

	updateTestRunCycle(testRun, cycle, cycleFieldKey) {
		return this.withInvoke(BridgeServiceFunction.UPDATE_TEST_RUN_CYCLE, { testRun, cycle, cycleFieldKey });
	}

	unlinkTestCasesFromFolder(folder) {
		return this.withInvoke(BridgeServiceFunction.UNLINK_TEST_CASES_FROM_FOLDER, folder);
	}

	withInvoke(functionKey, payload) {
		return invoke(functionKey, payload);
	}
}
