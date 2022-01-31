import React, { createRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useLogHook, withLogPath } from '../../shared/log-service';
import { withErrorBoundary } from '../../shared/error-boundary';
import { Modal } from '@forge/bridge';
import Button from '@atlaskit/button';
import i18n from '../../shared/localization/i18n';
import AddIcon from '@atlaskit/icon/glyph/add';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import EditorCloseIcon from '@atlaskit/icon/glyph/editor/close';
import Spinner from '@atlaskit/spinner';
import Badge from '@atlaskit/badge';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import AttachmentIcon from '@atlaskit/icon/glyph/attachment';
import MoreIcon from '@atlaskit/icon/glyph/more';
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add';
import { CallTestIcon, TestcaseIcon } from '../../assets/icons';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import ArrowDownIcon from '@atlaskit/icon/glyph/arrow-down';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import ShortcutIcon from '@atlaskit/icon/glyph/shortcut';
import PropTypes from 'prop-types';
import './issue-panel-test-case-content.styles.scss';
import { arrayMoveItem } from '../../../../../shared/tools';
import { generateIssueNestedTestStepData, generateIssueTestStepData } from '../../../../../shared/generate-data-structure';
import { RichTextbox } from '../../shared/rich-textbox';
import { SavePanel } from './save-panel';
import { ExternalCommunicationService } from '../../shared/external-communication';

function IssuePanelTestCaseContentInternal(props) {
	const log = useLogHook();
	const externalCommunicationService = new ExternalCommunicationService();

	const [stepsExpanded, setStepsExpanded] = useState(false);
	const [activeEditMap, setActiveEditMap] = useState({ _current: undefined });
	const [deactivatedEditTrigger, setDeactivatedEditTrigger] = useState(0);
	const [refresh, setRefresh] = useState(0);
	const refs = useRef({});

	const setSteps = (newSteps) => props.onStepsChange(newSteps);
	const setPrecondition = (newPrecondition) => props.onPreconditionChange(newPrecondition);
	const saveStepsInJira = (newSteps) => props.saveStepsInJira(newSteps);
	const savePreconditionInJira = (newPrecondition) => props.savePreconditionInJira(newPrecondition);

	useImperativeHandle(props.contentRef, () => ({
		deactivateEdit: () => {
			if (hasActiveEdit()) {
				saveActiveEdit();
			}

			setDeactivatedEditTrigger(deactivatedEditTrigger + 1);
		}
	}));

	useEffect(() => {
		if (deactivatedEditTrigger > 0) {
			if (props.onDeactivateEdit) {
				props.onDeactivateEdit();
			}
		}
	}, [deactivatedEditTrigger]);

	useEffect(() => {
		setRefresh(refresh + 1);
	}, [props.refresh]);

	function getRef(name) {
		return refs.current[name] || (refs.current[name] = createRef());
	}

	function getPreconditionRef() {
		return getRef('precondition');
	}

	function getStepDescriptionRef(step) {
		return getRef(`step-${step.id}-description`);
	}

	function getStepExpectedRef(step) {
		return getRef(`step-${step.id}-expected`);
	}

	function isActive(key) {
		return activeEditMap[key];
	}

	function hasActiveEdit() {
		return !!activeEditMap._current;
	}

	function getActiveStepKey(step) {
		return `step-${step.id}`;
	}

	function isActivePrecondition() {
		return isActive('precondition');
	}

	function isActiveStep(step) {
		return isActive(getActiveStepKey(step));
	}

	function isMoreButtonDisabled(step) {
		return isActiveStep(step);
	}

	const saveStepChanges = (step) => {
		activeEditStepChange(step, false);
		saveStepChangesPrivate(step);
	};

	function saveStepChangesPrivate(step) {
		const tempSteps = props.steps ? [...props.steps] : [];
		const description = getStepDescriptionRef(step).current.getValue();
		const expectedResult = getStepExpectedRef(step).current.getValue();

		if (
			JSON.stringify(step.description) === JSON.stringify(description) &&
			JSON.stringify(step.expectedResult) === JSON.stringify(expectedResult)
		) {
			return;
		}

		step.description = description;
		step.expectedResult = expectedResult;

		setSteps(tempSteps);
		saveStepsInJira(tempSteps);
	}

	function cancelStepChanges(step) {
		activeEditStepChange(step, false);
		setSteps(props.steps ? [...props.steps] : []);
		setRefresh(refresh + 1);
	}

	function activeEditChange(key, value) {
		if (!!activeEditMap._current && activeEditMap._current !== key) {
			saveActiveEdit();
		}

		activeEditMap._current = value ? key : undefined;
		activeEditMap[key] = value;
		setActiveEditMap({ ...activeEditMap });
	}

	function saveActiveEdit() {
		if (activeEditMap._current === 'precondition') {
			savePreconditionPrivate();
		} else {
			const id = activeEditMap._current.split('-')[1];

			saveStepChangesPrivate(props.steps.filter((step) => step.id === id)[0]);
		}

		activeEditMap[activeEditMap._current] = false;
	}

	function activeEditPreconditionChange(value) {
		activeEditChange(`precondition`, value);
	}

	function activeEditStepChange(step, value) {
		activeEditChange(getActiveStepKey(step), value);
	}

	const updateStepsIndexes = (stepsList) => {
		for (let i = 0; i < stepsList.length; i++) {
			stepsList[i].index = i + 1;
		}
	};

	const generateStep = (index = -1, description, expectedResult, attachments) => {
		return generateIssueTestStepData(
			index === -1 ? (props.steps ? props.steps.length : 0) : index,
			description,
			expectedResult,
			attachments
		);
	};

	function generateNestedTestStep(index = -1, issueKey, url, summary, stepsCount, attachments) {
		return generateIssueNestedTestStepData(index, issueKey, url, summary, stepsCount, attachments);
	}

	const addStep = (step) => {
		const tempSteps = props.steps ? [...props.steps] : [];

		tempSteps.splice(step.index, 0, step);

		updateStepsIndexes(tempSteps);

		setSteps(tempSteps);

		return tempSteps;
	};

	const addNewStep = (index = -1) => {
		addStep(generateStep(index));
	};

	const cloneStep = (step) => {
		saveStepsInJira(
			addStep(
				step.isTestCase
					? generateNestedTestStep(step.index, step.issueKey, step.url, step.summary, step.stepsCount, step.attachments)
					: generateStep(step.index, step.description, step.expectedResult, step.attachments)
			)
		);
	};

	const deleteStep = (index) => {
		const tempSteps = [...props.steps];
		tempSteps.splice(index, 1);
		updateStepsIndexes(tempSteps);

		setSteps(tempSteps);
		saveStepsInJira(tempSteps);
	};

	const reorderSteps = (srcIndex, destIndex) => {
		const tempSteps = [...props.steps];

		arrayMoveItem(tempSteps, srcIndex, destIndex);
		updateStepsIndexes(tempSteps);

		setSteps(tempSteps);
		saveStepsInJira(tempSteps);
	};

	const moveStepUp = (currentIndex) => {
		if (currentIndex - 1 < 0) {
			return;
		}

		reorderSteps(currentIndex, currentIndex - 1);
	};

	const moveStepDown = (currentIndex) => {
		if (currentIndex + 1 >= props.steps.length) {
			return;
		}

		reorderSteps(currentIndex, currentIndex + 1);
	};

	const isMoveUpDisabled = (currentIndex) => {
		return currentIndex === 0;
	};

	const isMoveDownDisabled = (currentIndex) => {
		return currentIndex + 1 === props.steps.length;
	};

	const onDragEnd = (result) => {
		const { destination, source } = result;

		if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
			return;
		}

		reorderSteps(result.source.index - 1, result.destination.index - 1);
	};

	const deletePrecondition = () => {
		setPrecondition(undefined);

		if (props.precondition) {
			savePreconditionInJira('');
		}
	};

	const expandFullView = async () => {
		const modal = new Modal({
			resource: 'ql-issue-test-case-exp',
			onClose: (payload) => {
				if (payload) {
					log.debug('Updating the state with the new steps & precondition values returned from the expanded modal.');

					setSteps(payload.steps);
					setPrecondition(payload.precondition);
					setRefresh(refresh + 1);
				} else {
					log.debug('The expanded modal was closed without saving the changes.');
				}
			},
			size: 'xlarge',
			context: {
				steps: props.steps,
				loading: false,
				precondition: props.precondition,
				context: props.context
			}
		});

		await modal.open();
	};

	function getStepAttachments(stepIndex) {
		if (stepIndex < 0 || stepIndex > props.steps.length) {
			log.debug(`The provided step index [${stepIndex}] is out of bounds (steps length [${props.steps.length}]).`);
			return [];
		}

		const step = props.steps[stepIndex];

		if (step.attachments === undefined || step.attachments === []) {
			log.debug(`The step with index [${stepIndex}] has no attachments.`);
			return [];
		}

		return step.attachments;
	}

	async function uploadStepAttachments(stepIndex) {
		const stepAttachments = getStepAttachments(stepIndex);
		const ctx = {
			issueKey: props.context.issueKey,
			stepIndex: stepIndex
		};

		if (stepAttachments.length > 0) {
			ctx.existingAttachments = stepAttachments;
		}

		const modal = new Modal({
			resource: 'ql-issue-attachments',
			onClose: (payload) => {
				if (payload) {
					const tempSteps = [...props.steps];
					const stepAttachments = tempSteps[stepIndex].attachments || [];

					log.debug(`Updating the step attachments for step number ${stepIndex}.`);

					if (payload.uploadedAttachments && payload.uploadedAttachments.length > 0) {
						log.debug(`Uploaded ${payload.length} attachments for step number ${stepIndex}.`);

						payload.uploadedAttachments.forEach((item) => {
							stepAttachments.push(item);
						});

						tempSteps[stepIndex].attachments = stepAttachments;
					}

					if (payload.deletedAttachments && payload.deletedAttachments.length > 0) {
						tempSteps[stepIndex].attachments = tempSteps[stepIndex].attachments.filter(
							(attachment) => payload.deletedAttachments.indexOf(attachment.id) === -1
						);
					}

					setSteps(tempSteps);
					saveStepsInJira(tempSteps);
				} else {
					log.debug(`The attachments modal for step number ${stepIndex} was closed without uploading any attachment.`);
				}
			},
			size: 'medium',
			context: ctx
		});

		await modal.open();
	}

	async function callToTest(index = -1) {
		const modal = new Modal({
			resource: 'ql-issue-call-to-test',
			onClose: async (payload) => {
				if (payload) {
					saveStepsInJira(
						addStep(
							generateNestedTestStep(
								index !== -1 ? index : props.steps.length + 1,
								payload.issueKey,
								`/browse/${payload.issueKey}`,
								payload.summary,
								payload.stepsCount
							)
						)
					);
				} else {
					log.debug('Failed to import the selected test case as a step.');
				}
			},
			size: 'xlarge',
			context: {}
		});

		await modal.open();
	}

	async function openNestedTestCase(url) {
		await externalCommunicationService.openUrl(url);
	}

	const isPreconditionOpened = () => props.precondition !== undefined;

	function cancelPrecondition() {
		activeEditPreconditionChange(false);
		setPrecondition(props.precondition);
		setRefresh(refresh + 1);
	}

	function savePrecondition() {
		activeEditPreconditionChange(false);
		savePreconditionPrivate();
	}

	function savePreconditionPrivate() {
		const precondition = getPreconditionRef().current.getValue();

		if (JSON.stringify(props.precondition) === JSON.stringify(precondition)) {
			return;
		}

		setPrecondition(precondition);
		savePreconditionInJira(precondition);
	}

	return (
		<div className="test-case-issue-panel">
			<div className="tcip-header">
				<div className="tcip-header-section left">
					{!props.isModal && (
						<>
							<Button
								className="tcip-header-btn-expand-view"
								appearance="default"
								iconBefore={<ShortcutIcon />}
								onClick={() => expandFullView()}
							>
								{i18n.t('TEST_CASE_ISSUE_PANEL_EXPAND_VIEW_BTN')}
							</Button>
							<Button
								className="tcip-header-btn-expand-collapse"
								appearance="default"
								onClick={() => setStepsExpanded(!stepsExpanded)}
							>
								{stepsExpanded ? 'Collapse all' : 'Expand all'}
							</Button>
						</>
					)}
				</div>
				<div className="tcip-header-section right">
					{!isPreconditionOpened() && (
						<Button
							className="tcip-header-btn-precondition"
							appearance="link"
							iconBefore={<AddIcon size="small" />}
							onClick={() => setPrecondition('')}
						>
							{i18n.t('TEST_CASE_ISSUE_PANEL_ADD_PRECONDITION_BTN')}
						</Button>
					)}
					<div className="tcip-header-btn-add">
						<DropdownMenu trigger={i18n.t('TEST_CASE_ISSUE_PANEL_ADD_DROPDOWN')}>
							<DropdownItemGroup>
								<DropdownItem onClick={() => addNewStep()}>
									{i18n.t('TEST_CASE_ISSUE_PANEL_ADD_DROPDOWN_NEW_STEP')}
								</DropdownItem>
								<DropdownItem onClick={() => callToTest()}>
									{i18n.t('TEST_CASE_ISSUE_PANEL_ADD_DROPDOWN_CALL_TEST')}
								</DropdownItem>
							</DropdownItemGroup>
						</DropdownMenu>
					</div>
				</div>
			</div>
			{isPreconditionOpened() && (
				<SavePanel
					className="tcip-precondition-wrapper"
					active={isActivePrecondition() && !props.isModal}
					onCancel={cancelPrecondition}
					onSave={() => savePrecondition()}
				>
					<div key={refresh} className={`tcip-precondition ${isActivePrecondition() && 'precondition-active'}`}>
						<RichTextbox
							noHeightLimit={true}
							expanded={stepsExpanded || props.isModal}
							editorRef={getPreconditionRef()}
							active={isActivePrecondition()}
							onActiveChange={activeEditPreconditionChange}
							defaultValue={props.precondition}
							editorPlaceholder="Describe precondition"
						/>
						<Button className="tcip-precondition-close-btn" appearance="default" onClick={() => deletePrecondition()}>
							<EditorCloseIcon />
						</Button>
					</div>
				</SavePanel>
			)}
			{props.loading ? (
				<div className="tcip-table spinner">
					<Spinner size="xlarge" />
				</div>
			) : (
				<DragDropContext onDragEnd={(result) => onDragEnd(result)}>
					<div className="tcip-table">
						<div className="tcip-table-headers">
							<div className="tcip-table-header index" />
							<div className="tcip-table-header description">
								{i18n.t('TEST_CASE_ISSUE_PANEL_TABLE_HEADERS_STEP_DESCRIPTION')}
							</div>
							<div className="tcip-table-header expected">
								{i18n.t('TEST_CASE_ISSUE_PANEL_TABLE_HEADERS_EXPECTED_RESULT')}
							</div>
							<div className="tcip-table-header attachments">{i18n.t('TEST_CASE_ISSUE_PANEL_TABLE_HEADERS_ATTACHMENTS')}</div>
						</div>
						<div className="tcip-table-separator" />
						<Droppable droppableId="test-case-steps">
							{(provided) => (
								<div className="tcip-table-steps" ref={provided.innerRef} {...provided.droppableProps}>
									{props.steps ? (
										props.steps.map((step, i) => (
											<Draggable key={step.id} draggableId={step.id} index={step.index}>
												{(provided) => (
													<div
														className="table-step-wrapper"
														ref={provided.innerRef}
														{...provided.draggableProps}
													>
														<SavePanel
															active={isActiveStep(step) && !props.isModal}
															onCancel={() => cancelStepChanges(step)}
															onSave={() => saveStepChanges(step)}
														>
															{step.isTestCase ? (
																<div className="table-step test-case">
																	<div
																		className="table-step-item index-wrapper index-tc"
																		{...provided.dragHandleProps}
																	>
																		<div className="table-step-drag-icon">
																			<DragHandlerIcon size="medium" />
																		</div>
																		<div className="table-step-splitter" />
																		<div className="table-step-index">{step.index}</div>
																	</div>
																	<div className="table-step-item tc-content">
																		<div className="tc-content-left">
																			<div className="tc-content-icon">
																				<TestcaseIcon />
																			</div>
																			<div className="tc-content-issue-key">
																				<Button
																					onClick={async () => await openNestedTestCase(step.url)}
																					appearance="link"
																				>
																					{step.issueKey}
																				</Button>
																			</div>
																			<div className="tc-content-issue-summary">{step.summary}</div>
																		</div>
																		<div className="tc-content-right">
																			<div className="tc-steps-count">
																				<div className="tc-steps-count-txt">
																					{step.stepsCount} steps
																				</div>
																			</div>
																		</div>
																	</div>
																	<div className="table-step-item attachments">
																		<div className="btn-wrapper">
																			<Button
																				className="attachments-btn"
																				appearance="default"
																				onClick={() => uploadStepAttachments(i)}
																			>
																				<AttachmentIcon />
																			</Button>
																			{step.attachments && step.attachments.length > 0 && (
																				<div className="attachment-badge-wrapper">
																					<Badge appearance="primary">
																						{step.attachments.length}
																					</Badge>
																				</div>
																			)}
																		</div>
																		<div className="btn-wrapper">
																			<DropdownMenu
																				placement={'bottom'}
																				trigger={({ triggerRef, ...props }) => (
																					<Button
																						className="attachments-btn"
																						{...props}
																						iconBefore={<MoreIcon label="more" />}
																						ref={triggerRef}
																					/>
																				)}
																			>
																				<DropdownItemGroup>
																					<DropdownItem onClick={() => addNewStep(i + 1)}>
																						<div className="test-case-step-menu-item">
																							<EditorAddIcon
																								label="add"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_ADD_STEP'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem onClick={() => callToTest(i + 1)}>
																						<div className="test-case-step-menu-item">
																							<CallTestIcon className="step-menu-item-icon" />
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_CALL_TO_TEST'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem onClick={() => cloneStep(step)}>
																						<div className="test-case-step-menu-item">
																							<CopyIcon
																								label="add"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_CLONE'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem onClick={() => moveStepUp(i)}>
																						<div className="test-case-step-menu-item">
																							<ArrowUpIcon
																								label="moveUp"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_MOVE_UP'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem onClick={() => moveStepDown(i)}>
																						<div className="test-case-step-menu-item">
																							<ArrowDownIcon
																								label="moveDown"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_MOVE_DOWN'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem onClick={() => deleteStep(i)}>
																						<div className="test-case-step-menu-item">
																							<TrashIcon
																								label="delete"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_DELETE'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																				</DropdownItemGroup>
																			</DropdownMenu>
																		</div>
																	</div>
																</div>
															) : (
																<div className={`table-step${isActiveStep(step) ? ' step-active' : ''}`}>
																	<div
																		className="table-step-item index-wrapper"
																		{...provided.dragHandleProps}
																	>
																		<div className="table-step-drag-icon">
																			<DragHandlerIcon size="medium" />
																		</div>
																		<div className="table-step-splitter" />
																		<div className="table-step-index">{step.index}</div>
																	</div>
																	<div className="table-step-item description">
																		<div key={refresh} className="text-wrapper">
																			<RichTextbox
																				noHeightLimit={true}
																				expanded={stepsExpanded || props.isModal}
																				editorRef={getStepDescriptionRef(step)}
																				active={isActiveStep(step)}
																				onActiveChange={(value) =>
																					activeEditStepChange(step, value)
																				}
																				defaultValue={step.description}
																				editorPlaceholder="Add step description"
																			/>
																		</div>
																	</div>
																	<div className="table-step-item expected">
																		<div key={refresh} className="text-wrapper">
																			<RichTextbox
																				noHeightLimit={true}
																				expanded={stepsExpanded || props.isModal}
																				editorRef={getStepExpectedRef(step)}
																				active={isActiveStep(step)}
																				onActiveChange={(value) =>
																					activeEditStepChange(step, value)
																				}
																				defaultValue={step.expectedResult}
																				editorPlaceholder="Add expected result"
																			/>
																		</div>
																	</div>
																	<div className="table-step-item attachments">
																		<div className="btn-wrapper">
																			<Button
																				className="attachments-btn"
																				appearance="default"
																				onClick={() => uploadStepAttachments(i)}
																			>
																				<AttachmentIcon />
																			</Button>
																			{step.attachments && step.attachments.length > 0 && (
																				<div className="attachment-badge-wrapper">
																					<Badge appearance="primary">
																						{step.attachments.length}
																					</Badge>
																				</div>
																			)}
																		</div>
																		<div className="btn-wrapper">
																			<DropdownMenu
																				placement={'bottom'}
																				trigger={({ triggerRef, ...props }) => (
																					<Button
																						isDisabled={isMoreButtonDisabled(step)}
																						className="attachments-btn"
																						{...props}
																						iconBefore={<MoreIcon label="more" />}
																						ref={triggerRef}
																					/>
																				)}
																			>
																				<DropdownItemGroup>
																					<DropdownItem onClick={() => addNewStep(i + 1)}>
																						<div className="test-case-step-menu-item">
																							<EditorAddIcon
																								label="add"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_ADD_STEP'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem>
																						<div className="test-case-step-menu-item">
																							<CallTestIcon className="step-menu-item-icon" />
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_CALL_TO_TEST'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem onClick={() => cloneStep(step)}>
																						<div className="test-case-step-menu-item">
																							<CopyIcon
																								label="add"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_CLONE'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem
																						onClick={() => moveStepUp(i)}
																						isDisabled={isMoveUpDisabled(i)}
																					>
																						<div className="test-case-step-menu-item">
																							<ArrowUpIcon
																								label="moveUp"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_MOVE_UP'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem
																						onClick={() => moveStepDown(i)}
																						isDisabled={isMoveDownDisabled(i)}
																					>
																						<div className="test-case-step-menu-item">
																							<ArrowDownIcon
																								label="moveDown"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_MOVE_DOWN'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																					<DropdownItem onClick={() => deleteStep(i)}>
																						<div className="test-case-step-menu-item">
																							<TrashIcon
																								label="delete"
																								primaryColor={'#42526e'}
																							/>
																							<div className="step-menu-item-text">
																								{i18n.t(
																									'TEST_CASE_ISSUE_PANEL_TABLE_ATTACHMENTS_DROPDOWN_DELETE'
																								)}
																							</div>
																						</div>
																					</DropdownItem>
																				</DropdownItemGroup>
																			</DropdownMenu>
																		</div>
																	</div>
																</div>
															)}
														</SavePanel>
													</div>
												)}
											</Draggable>
										))
									) : (
										<div className="table-no-steps">{i18n.t('TEST_CASE_ISSUE_PANEL_TABLE_NO_STEPS_TXT')}</div>
									)}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</div>
				</DragDropContext>
			)}
			<div className="tcip-footer">
				<div className="tcip-footer-hint">
					<div className="tcip-footer-hint-text">{i18n.t('TEST_CASE_ISSUE_PANEL_TABLE_FOOTER_HINT_TXT')}</div>
				</div>
				<div className="tcip-footer-buttons">
					<div className="tcip-footer-button call-test">
						<Button appearance="subtle-link" onClick={() => callToTest()}>
							{i18n.t('TEST_CASE_ISSUE_PANEL_TABLE_FOOTER_CALL_TEST_BTN')}
						</Button>
					</div>
					<div className="tcip-footer-button new-step">
						<Button className="new-step-btn" appearance="primary" onClick={() => addNewStep()}>
							{i18n.t('TEST_CASE_ISSUE_PANEL_TABLE_FOOTER_NEW_STEP_BTN')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

IssuePanelTestCaseContentInternal.propTypes = {
	steps: PropTypes.array,
	onStepsChange: PropTypes.func.isRequired,
	precondition: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	onPreconditionChange: PropTypes.func.isRequired,
	saveStepsInJira: PropTypes.func.isRequired,
	savePreconditionInJira: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	context: PropTypes.object.isRequired,
	isModal: PropTypes.bool,
	refresh: PropTypes.number.isRequired,
	contentRef: PropTypes.any,
	onDeactivateEdit: PropTypes.func
};

export const IssuePanelTestCaseContent = withLogPath(withErrorBoundary(IssuePanelTestCaseContentInternal), 'IssuePanelTestCaseContent');
