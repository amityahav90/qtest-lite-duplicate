import Resolver from '@forge/resolver';
import { BridgeServiceFunction } from '../../shared/enums';
import {
	addProjectTestCycle,
	createTestRunIssueType,
	deleteStepAttachment,
	generateIssueTestPrecondition,
	generateIssueTestStepAttachments,
	generateIssueTestSteps,
	generateProjectTestCaseFolders,
	generateVersionCycles,
	getAttachmentFileSizeLimit,
	getExternalSettings,
	getInternalSettings,
	getIssueHistory,
	getIssuePrecondition,
	getIssueSteps,
	getProjectTestCycles,
	getProjectTestFolders,
	getProjectTestFoldersLinkMap,
	getProjectVersions,
	getTestCaseIssues,
	getTestCyclesLinkMap,
	getTestRunIssues,
	initializeApp,
	linkTwoIssues,
	moveTestCasesToFolder,
	resetInitializeApp,
	saveBubbledLog,
	searchJiraIssues,
	setExternalSettings,
	setIssuePrecondition,
	setIssueSteps,
	setProjectTestCycles,
	setProjectTestFolders,
	setProjectTestFoldersLinkMap,
	setTestCyclesLinkMap,
	updateTestRunCycle,
	unlinkTestCasesFromFolder
} from './resolver-functions';

const resolver = new Resolver();

resolver.define(BridgeServiceFunction.GET_ISSUE_STEPS, getIssueSteps);

resolver.define(BridgeServiceFunction.SET_ISSUE_STEPS, setIssueSteps);

resolver.define(BridgeServiceFunction.GET_ISSUE_HISTORY, getIssueHistory);

resolver.define(BridgeServiceFunction.GET_EXTERNAL_SETTINGS, getExternalSettings);

resolver.define(BridgeServiceFunction.SET_EXTERNAL_SETTINGS, setExternalSettings);

resolver.define(BridgeServiceFunction.INITIALIZE_APP, initializeApp);

resolver.define(BridgeServiceFunction.GET_INTERNAL_SETTINGS, getInternalSettings);

resolver.define(BridgeServiceFunction.RESET_INITIALIZE_APP, resetInitializeApp);

resolver.define(BridgeServiceFunction.SAVE_BUBBLED_LOG, saveBubbledLog);

resolver.define(BridgeServiceFunction.GET_ISSUE_PRECONDITION, getIssuePrecondition);

resolver.define(BridgeServiceFunction.SET_ISSUE_PRECONDITION, setIssuePrecondition);

resolver.define(BridgeServiceFunction.GENERATE_ISSUE_TEST_STEPS, generateIssueTestSteps);

resolver.define(BridgeServiceFunction.GENERATE_ISSUE_TEST_STEP_ATTACHMENTS, generateIssueTestStepAttachments);

resolver.define(BridgeServiceFunction.GENERATE_ISSUE_TEST_PRECONDITION, generateIssueTestPrecondition);

resolver.define(BridgeServiceFunction.SEARCH_JIRA_ISSUES, searchJiraIssues);

resolver.define(BridgeServiceFunction.GET_ATTACHMENT_FILE_SIZE_LIMIT, getAttachmentFileSizeLimit);

resolver.define(BridgeServiceFunction.DELETE_STEP_ATTACHMENT, deleteStepAttachment);

resolver.define(BridgeServiceFunction.GET_PROJECT_TEST_FOLDERS, getProjectTestFolders);

resolver.define(BridgeServiceFunction.SET_PROJECT_TEST_FOLDERS, setProjectTestFolders);

resolver.define(BridgeServiceFunction.GET_TEST_CASE_ISSUES, getTestCaseIssues);

resolver.define(BridgeServiceFunction.GET_TEST_RUN_ISSUES, getTestRunIssues);

resolver.define(BridgeServiceFunction.GET_PROJECT_TEST_FOLDERS_LINK_MAP, getProjectTestFoldersLinkMap);

resolver.define(BridgeServiceFunction.SET_PROJECT_TEST_FOLDERS_LINK_MAP, setProjectTestFoldersLinkMap);

resolver.define(BridgeServiceFunction.MOVE_TEST_CASES_TO_FOLDER, moveTestCasesToFolder);

resolver.define(BridgeServiceFunction.GET_PROJECT_VERSIONS, getProjectVersions);

resolver.define(BridgeServiceFunction.GET_PROJECT_TEST_CYCLES, getProjectTestCycles);

resolver.define(BridgeServiceFunction.SET_PROJECT_TEST_CYCLES, setProjectTestCycles);

resolver.define(BridgeServiceFunction.ADD_PROJECT_TEST_CYCLE, addProjectTestCycle);

resolver.define(BridgeServiceFunction.GENERATE_PROJECT_TEST_CASE_FOLDERS, generateProjectTestCaseFolders);

resolver.define(BridgeServiceFunction.GENERATE_VERSION_CYCLES, generateVersionCycles);

resolver.define(BridgeServiceFunction.CREATE_TEST_RUN_ISSUE_TYPE, createTestRunIssueType);

resolver.define(BridgeServiceFunction.LINK_TWO_ISSUES, linkTwoIssues);

resolver.define(BridgeServiceFunction.UPDATE_TEST_RUN_CYCLE, updateTestRunCycle);

resolver.define(BridgeServiceFunction.GET_TEST_CYCLES_LINK_MAP, getTestCyclesLinkMap);

resolver.define(BridgeServiceFunction.SET_TEST_CYCLES_LINK_MAP, setTestCyclesLinkMap);

resolver.define(BridgeServiceFunction.UNLINK_TEST_CASES_FROM_FOLDER, unlinkTestCasesFromFolder);

export const bridgeService = resolver.getDefinitions();
