import { LogService } from '../../../shared/log-service';
import { BridgeServiceFunction } from '../../../shared/enums';
import { InternalSettingsStorageManager } from '../../shared/storage-manager';
import { configManifestCustomField, createCustomField, createIssueLinkType, createIssueType, linkIssueTypesToSchemes } from './helpers';
import { CustomFieldName } from '../../../shared/enums/custom-field-name.enum';

export async function initializeApp() {
	const log = new LogService(BridgeServiceFunction.INITIALIZE_APP);
	const internalSettings = await InternalSettingsStorageManager.get();
	const requirementIssueTypePayload = {
		name: 'Requirement',
		description: "This is the qTest Lite 'Requirement' issue type.",
		hierarchyLevel: 0
	};
	const testCaseIssueTypePayload = {
		name: 'Test Case',
		description: "This is the qTest Lite 'Test Case' issue type.",
		hierarchyLevel: 0
	};
	const testRunIssueTypePayload = {
		name: 'Test Run',
		description: "This is the qTest Lite 'Test Run' issue type. This issue type is used to execute an existing Test Case.",
		hierarchyLevel: 0
	};
	const coverIssueLinkTypePayload = {
		inward: 'covered by',
		name: 'Covers',
		outward: 'covers'
	};
	const executeIssueLinkTypePayload = {
		inward: 'executed by',
		name: 'Executes',
		outward: 'executes'
	};
	const defectsIssueLinkTypePayload = {
		inward: 'defects found by',
		name: 'Defects',
		outward: 'defect discovered in'
	};
	const typeIssueCustomField = {
		searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:multiselectsearcher',
		name: 'Test Type',
		description: 'Custom field for test type.',
		type: 'com.atlassian.jira.plugin.system.customfieldtypes:select'
	};
	const statusIssueCustomField = {
		searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:multiselectsearcher',
		name: 'Test Status',
		description: 'Custom field for test status.',
		type: 'com.atlassian.jira.plugin.system.customfieldtypes:select'
	};
	const typeIssueCustomFieldOptions = {
		options: [
			{
				value: 'Functional'
			},
			{
				value: 'Non-functional'
			}
		]
	};
	const statusIssueCustomFieldOptions = {
		options: [
			{
				value: 'Passed'
			},
			{
				value: 'Failed'
			},
			{
				value: 'Skipped'
			},
			{
				value: 'Incomplete'
			},
			{
				value: 'Blocked'
			}
		]
	};

	if (internalSettings.initializedApp) {
		log.debug('App is already initialized. Skipping the initialization request.');
		return;
	}

	log.debug('Creating a Requirement issue type...');
	let requirementIssueTypeId = undefined;
	const issueTypeRequirementResponse = await createIssueType(requirementIssueTypePayload);

	if (issueTypeRequirementResponse !== undefined) {
		requirementIssueTypeId = issueTypeRequirementResponse.id;
	}

	log.debug('Creating a Test Case issue type...');
	let testCaseIssueTypeId = undefined;
	const issueTypeTestCaseResponse = await createIssueType(testCaseIssueTypePayload);

	if (issueTypeTestCaseResponse !== undefined) {
		testCaseIssueTypeId = issueTypeTestCaseResponse.id;
	}

	log.debug('Creating a Test Run issue type...');
	let testRunIssueTypeId = undefined;
	const issueTypeTestRunResponse = await createIssueType(testRunIssueTypePayload);

	if (issueTypeTestRunResponse !== undefined) {
		testRunIssueTypeId = issueTypeTestRunResponse.id;
	}

	log.debug('Link issue types "Test Case", "Test Run" and "Requirement" to all issue type schemes');
	await linkIssueTypesToSchemes([testCaseIssueTypeId, testRunIssueTypeId, requirementIssueTypeId]);

	log.debug('Creating an issue link type between Requirement and a Test Case.');
	await createIssueLinkType(coverIssueLinkTypePayload);

	log.debug('Creating an issue link type between Test Case and a Test Run.');
	await createIssueLinkType(executeIssueLinkTypePayload);

	log.debug('Creating an issue link type between Test Run and a Bug.');
	await createIssueLinkType(defectsIssueLinkTypePayload);

	log.debug("Creating the 'Test Type' issue custom field");
	await createCustomField(typeIssueCustomField, typeIssueCustomFieldOptions, [
		testCaseIssueTypeId,
		testRunIssueTypeId,
		requirementIssueTypeId
	]);

	log.debug("Creating the 'Test Status' issue custom field");
	await createCustomField(statusIssueCustomField, statusIssueCustomFieldOptions, [testRunIssueTypeId]);

	log.debug(`Adding configuration for the '${CustomFieldName.FOLDER}' issue custom field`);
	await configManifestCustomField(CustomFieldName.FOLDER, undefined, [testCaseIssueTypeId]);

	log.debug(`Adding configuration for the '${CustomFieldName.CYCLE}' issue custom field`);
	await configManifestCustomField(CustomFieldName.CYCLE, undefined, [testRunIssueTypeId]);

	log.debug(`Adding configuration for the '${CustomFieldName.EXECUTED_BY}' issue custom field`);
	await configManifestCustomField(CustomFieldName.EXECUTED_BY, undefined, [testRunIssueTypeId]);

	log.debug(`Adding configuration for the '${CustomFieldName.PLANNED_START_DATE}' issue custom field`);
	await configManifestCustomField(CustomFieldName.PLANNED_START_DATE, undefined, [testRunIssueTypeId]);

	log.debug(`Adding configuration for the '${CustomFieldName.PLANNED_END_DATE}' issue custom field`);
	await configManifestCustomField(CustomFieldName.PLANNED_END_DATE, undefined, [testRunIssueTypeId]);

	log.debug("Updating the app's internal settings in the app storage");
	await InternalSettingsStorageManager.initializedApp();
}
