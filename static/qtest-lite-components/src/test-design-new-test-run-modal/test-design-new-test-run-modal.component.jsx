import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLogHook, withLogPath } from '../shared/log-service';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import { If } from '../shared/if';
import { requestJira, view } from '@forge/bridge';
import { Radio } from '@atlaskit/radio';
import Button from '@atlaskit/button';
import { TestCycleRoundedIcon, TestCycleRoundedFilledIcon } from '../assets/icons';
import './test-design-new-test-run-modal.styles.scss';
import { ExternalCommunicationService } from '../shared/external-communication';
import Select from '@atlaskit/select';
import { CycleSelect } from '../test-execution-new-cycle-modal/cycles-select';
import { FOLDER_TREE_ITEM_ROOT_ID } from '../shared/folder-tree';
import Spinner from '@atlaskit/spinner';
import { CustomFieldName } from '../../../../shared/enums';
import { generateGuid22 } from '../../../../shared/tools';
import { TestExecutionNewCycleModal } from '../test-execution-new-cycle-modal/test-execution-new-cycle-modal.component';

function TestDesignNewTestRunModalInternal() {
	const log = useLogHook();

	const [versions, setVersions] = useState([]);
	const [testCases, setTestCases] = useState([]);
	const [projectId, setProjectId] = useState('');
	const [selectedOption, setSelectedOption] = useState('');
	const [loading, setLoading] = useState(false);
	const fieldsCache = useRef(new Map());
	const [selectedVersionId, setSelectedVersionId] = useState('');
	const [selectedCycle, setSelectedCycle] = useState({});

	useEffect(() => {
		getVersions();
		getTestCases();
		getCustomFieldsIds();
	}, []);

	const onChange = useCallback(
		({ currentTarget: { value } }) => {
			setSelectedOption(value);
		},
		[setSelectedOption]
	);

	const customStyles = {
		height: '105px',
		width: '235px',
		padding: '15px',
		overflow: 'auto'
	};

	function getVersions() {
		const externalCommunicationService = new ExternalCommunicationService();

		externalCommunicationService
			.getProjectVersions()
			.then((projectVersions) => {
				log.debug('Successfully retrieved project versions');
				initVersions(projectVersions);
			})
			.catch((e) => {
				log.error('Failed to retrieve project versions', e);
			});
	}

	function getTestCases() {
		view.getContext()
			.then((context) => {
				log.debug('Successfully get the test cases from the modal context.');

				setTestCases(context.extension.modal.testCases);
				setProjectId(context.extension.project.id);
			})
			.catch((e) => {
				log.error('Failed to get the test cases from the modal context.', e);
			});
	}

	function initVersions(projectVersions) {
		const unreleased = [];
		const released = [];

		projectVersions.forEach((v) => {
			if (!v.archived) {
				const entry = { label: v.name, value: v.id };

				if (!v.released) {
					unreleased.push(entry);
				} else {
					released.push(entry);
				}
			}
		});

		const versionsArray = [];

		if (unreleased.length > 0) {
			versionsArray.push({
				label: 'UNRELEASED',
				options: unreleased
			});
		}

		if (released.length > 0) {
			versionsArray.push({
				label: 'RELEASED',
				options: released
			});
		}

		setVersions(versionsArray);
	}

	function onVersionChange(option) {
		setSelectedVersionId(option.value);
		setSelectedCycle({});
	}

	function isValidForm() {
		return !!selectedVersionId && !!selectedCycle && selectedCycle.id && selectedCycle.name;
	}

	async function getTestCaseStepsFromJira(testCaseId) {
		const externalCommunicationService = new ExternalCommunicationService();

		return await externalCommunicationService.getIssueSteps(testCaseId);
	}

	async function getTestCasePreconditionFromJira(testCaseId) {
		const externalCommunicationService = new ExternalCommunicationService();

		return await externalCommunicationService.getIssuePrecondition(testCaseId);
	}

	async function createTestRun(testCase, cycle) {
		const externalCommunicationService = new ExternalCommunicationService();

		const requestBody = await createTestRunRequestBody(testCase);

		try {
			const testRun = await externalCommunicationService.createTestRunIssueType(requestBody);

			if (testRun && testRun.key) {
				log.debug(`Test Run [${testRun.key}] was created successfully`);

				await linkTestRunToTestCase(testCase.key, testRun.key);
				await setCycleForTestRun(testRun, cycle);
			}
		} catch (e) {
			log.error(`Failed to create a Test Run from Test Case ${testCase.id}`, e);
		}
	}

	async function createTestRunRequestBody(testCase) {
		const steps = await getTestCaseStepsFromJira(testCase.key);
		const precondition = await getTestCasePreconditionFromJira(testCase.key);

		const body = {
			fields: {
				summary: testCase.name,
				issuetype: {
					name: 'Test Run'
				},
				project: {
					id: projectId
				}
			},
			properties: [
				{
					key: 'tricentis-qtest-lite-steps',
					value: createStepsForTestRun(steps)
				},
				{
					key: 'tricentis-qtest-lite-precondition',
					value: precondition
				}
			]
		};

		if (fieldsCache.current.has('Planned Start Date')) {
			body.fields[fieldsCache.current.get('Planned Start Date')] = new Date();
		}

		if (fieldsCache.current.has('Planned End Date')) {
			body.fields[fieldsCache.current.get('Planned End Date')] = new Date();
		}

		if (fieldsCache.current.has('Test Status')) {
			body.fields[fieldsCache.current.get('Test Status')] = { value: 'Incomplete' };
		}

		return body;
	}

	function createStepsForTestRun(steps) {
		return steps.map((step) => ({
			id: generateGuid22(),
			index: step.index,
			description: step.description,
			expectedResult: step.expectedResult,
			actualResult: '',
			status: '',
			attachments: step.attachments
		}));
	}

	async function linkTestRunToTestCase(testCaseKey, testRunKey) {
		const body = {
			outwardIssue: {
				key: testCaseKey
			},
			inwardIssue: {
				key: testRunKey
			},
			type: {
				name: 'Executes'
			}
		};

		const externalCommunicationService = new ExternalCommunicationService();

		try {
			const linkIssuesResponse = await externalCommunicationService.linkTwoIssues(body);

			log.debug(
				linkIssuesResponse
					? `Successfully linked Test Case [${testCaseKey}] with Test Run [${testRunKey}]`
					: `Failed to link Test Case [${testCaseKey}] with Test Run [${testRunKey}]`
			);

			return linkIssuesResponse;
		} catch (e) {
			log.error(`An error occurred while trying to link Test Case [${testCaseKey}] with Test Run [${testRunKey}]`, e);
		}
	}

	async function getCustomFieldsIds() {
		const response = await requestJira(`/rest/api/3/field`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const fields = (await response.json()) || [];
		const fieldsNames = ['Test Type', 'Planned Start Date', 'Planned End Date', 'Executed By', 'Test Status', 'Cycle'];

		fields.forEach((field) => {
			if (fieldsNames.includes(field.name)) {
				fieldsCache.current.set(field.name, field.id);
			}
		});
	}

	async function setCycleForTestRun(testRun, cycle) {
		const externalCommunicationService = new ExternalCommunicationService();

		try {
			const updateCycleResponse = await externalCommunicationService.updateTestRunCycle(
				testRun,
				cycle || selectedCycle,
				fieldsCache.current.get('Cycle')
			);

			log.debug(
				`${updateCycleResponse ? 'Successfully' : 'Failed to'} set Test Run [${testRun.id}] to Cycle [${
					(cycle || selectedCycle).name
				}]`
			);
		} catch (e) {
			log.error(`An error occurred while trying to set Test Run [${testRun.id}] to Cycle [${(cycle || selectedCycle).name}]`, e);
		}
	}

	async function handleNewCycle(cycle) {
		for (const testCase of testCases) {
			await createTestRun(testCase, cycle);
		}

		await view.close();
	}

	function onCancel() {
		view.close();
	}

	async function onNext() {
		if (!isValidForm()) {
			return;
		}

		if (selectedOption === 'existing-cycle') {
			setLoading(true);

			for (const testCase of testCases) {
				await createTestRun(testCase);
			}

			await view.close();
		}
	}

	return (
		<div className={`test-design-new-test-run-modal ${loading ? 'disabled' : ''} ${selectedOption === 'new-cycle' ? 'new-cycle' : ''}`}>
			<If value={selectedOption !== 'new-cycle'}>
				<div className="new-test-run-header">
					<div className="new-test-run-header-head">Create a test cycle</div>
					<div className="new-test-run-header-paragraph">
						To run tests, create a test cycle to plan and execute specific sets of test runs, or add tests to an existing one.
					</div>
				</div>
				<div className="new-test-run-content">
					<div className="new-test-run-content-title">Choose how to proceed:</div>
					<div className="new-test-run-content-selection">
						<div className="content-selection-item">
							<div className="content-selection-item-radio">
								<Radio
									isChecked={selectedOption === 'new-cycle'}
									onChange={onChange}
									name="new-cycle-radio"
									value="new-cycle"
								/>
							</div>
							<div className="content-selection-item-icon">
								<TestCycleRoundedFilledIcon className="radio-item-icon" />
							</div>
							<div className="content-selection-item-name">Create a new test cycle</div>
						</div>
						<div className="content-selection-item">
							<div className="content-selection-item-radio">
								<Radio
									isChecked={selectedOption === 'existing-cycle'}
									onChange={onChange}
									name="existing-cycle-radio"
									value="existing-cycle"
								/>
							</div>
							<div className="content-selection-item-icon">
								<TestCycleRoundedIcon className="radio-item-icon" />
							</div>
							<div className="content-selection-item-name">Select an existing test cycle</div>
						</div>
					</div>
					<If value={selectedOption === 'existing-cycle'}>
						<div className="new-test-run-create-cycle">
							<div className="new-test-run-create-cycle-item version-select">
								<div className="create-cycle-item-label">
									Select version <span className="label-required">*</span>
								</div>
								<Select className="create-cycle-item-version-select" options={versions} onChange={onVersionChange} />
							</div>
							<div className="new-test-run-create-cycle-item cycle-select">
								<div className="create-cycle-item-label">
									Select an existing test cycle <span className="label-required">*</span>
								</div>
								<div className={`create-cycle-item-cycle-select ${!selectedVersionId ? 'disabled' : ''}`}>
									<CycleSelect
										versionId={selectedVersionId}
										onCycleSelect={(cycle) => setSelectedCycle(cycle)}
										customContentStyles={customStyles}
									/>
								</div>
							</div>
						</div>
					</If>
				</div>
				<div className="new-test-run-footer">
					<div className="new-test-run-footer-buttons">
						<div className="new-test-run-footer-button cancel">
							<Button appearance="subtle" onClick={onCancel}>
								Cancel
							</Button>
						</div>
						<div className="new-test-run-footer-button next">
							<Button isDisabled={!isValidForm()} appearance="primary" onClick={onNext}>
								Next
							</Button>
						</div>
					</div>
				</div>
				<If value={loading}>
					<div className="new-test-run-footer-loading">
						<Spinner size="xlarge" />
					</div>
				</If>
			</If>
			<If value={selectedOption === 'new-cycle' && versions.length > 0}>
				<TestExecutionNewCycleModal
					versions={versions}
					displayBack={true}
					onBack={() => setSelectedOption('')}
					onCreate={handleNewCycle}
				/>
			</If>
		</div>
	);
}

export const TestDesignNewTestRunModal = withLogPath(withErrorBoundaryRoot(TestDesignNewTestRunModalInternal), 'TestDesignNewTestRunModal');
