import React, { useEffect, useRef, useState } from 'react';
import { useLogHook, withLogPath } from '../shared/log-service';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import Textfield from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import { DatePicker } from '@atlaskit/datetime-picker';
import Button from '@atlaskit/button';
import { view } from '@forge/bridge';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { R400 } from '../shared/design-styles';
import './test-execution-new-cycle-modal.styles.scss';
import i18n from '../shared/localization/i18n';
import { generateVersionCycleData } from '../../../../shared/generate-data-structure';
import { ExternalCommunicationService } from '../shared/external-communication';
import { FOLDER_TREE_ITEM_ROOT_ID } from '../shared/folder-tree';
import { CycleSelect } from './cycles-select';
import { If } from '../shared/if';
import Spinner from '@atlaskit/spinner';
import PropTypes from 'prop-types';

function TestExecutionNewCycleModalInternal(props) {
	const log = useLogHook();

	const [versions, setVersions] = useState([]);
	const [nameError, setNameError] = useState(false);
	const [versionError, setVersionError] = useState(false);
	const [nameStartDate, setNameStartDate] = useState();
	const [nameEndDate, setNameEndDate] = useState();
	const [isNested, setIsNested] = useState(false);
	const [reload, setReload] = useState(false);
	const [loading, setLoading] = useState(false);
	const fieldsState = useRef({
		name: '',
		description: '',
		version: '',
		isNested: false,
		cycle: '',
		startDate: '',
		endDate: ''
	});

	useEffect(() => {
		view.getContext()
			.then((context) => {
				if (context.extension.modal.versions) {
					populateVersions(context.extension.modal.versions);
				} else if (props.versions) {
					setVersions(props.versions);
				}
			})
			.catch((e) => {
				log.error('An error occurred while trying to retrieve the modal context', e);
			});
	}, []);

	function onCancel() {
		view.close();
	}

	function onCreate() {
		setLoading(true);

		if (!isValidForm()) {
			log.debug('Some of the new cycle information is not valid. Cannot create the new cycle.');
			setLoading(false);
			return;
		}

		const payload = {
			versionId: fieldsState.current.version,
			parentId: fieldsState.current.cycle || FOLDER_TREE_ITEM_ROOT_ID,
			cycle: generateVersionCycleData(
				undefined,
				fieldsState.current.name,
				fieldsState.current.description,
				fieldsState.current.startDate,
				fieldsState.current.endDate
			)
		};

		const externalCommunicationService = new ExternalCommunicationService();
		externalCommunicationService
			.addProjectTestCycle(payload.versionId, payload.parentId, payload.cycle)
			.then(() => {
				log.debug('Successfully save the new cycle in Jira');
				if (props.onCreate) {
					props.onCreate({ id: payload.cycle.id, name: payload.cycle.name });
				} else {
					view.close(payload);
				}
			})
			.catch((e) => {
				log.error('Failed to save the new cycle in Jira', e);
			})
			.finally(() => {
				if (!props.onCreate) {
					setLoading(false);
				}
			});
	}

	function populateVersions(_versions) {
		const unreleased = [];
		const released = [];

		_versions.forEach((v) => {
			const entry = { label: v.name, value: v.id };

			if (!v.released) {
				unreleased.push(entry);
			} else {
				released.push(entry);
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

	function isValidForm() {
		let valid = true;

		if (!fieldsState.current.name) {
			setNameError(true);
			valid = false;
		}

		if (!fieldsState.current.version) {
			setVersionError(true);
			valid = false;
		}

		let startDate = new Date(fieldsState.current.startDate);
		let endDate = new Date(fieldsState.current.endDate);

		if (endDate < startDate) {
			setNameStartDate("Start date can't be after end date");
			setNameEndDate("End date can't be before start date");
			valid = false;
		}

		return valid;
	}

	function onNameChange(e) {
		const temp = fieldsState.current;
		temp.name = e.target.value;
		fieldsState.current = temp;

		if (temp.name) {
			setNameError(false);
		}
	}

	function onDescriptionChange(e) {
		const temp = fieldsState.current;
		temp.description = e.target.value;
		fieldsState.current = temp;
	}

	function onVersionChange(option) {
		fieldsState.current.version = option.value;
		setVersionError(false);
		setReload(!reload);
	}

	function onCycleChange(id) {
		fieldsState.current.cycle = id;
	}

	function onCycleNestedChange() {
		fieldsState.current.isNested = !fieldsState.current.isNested;
		setIsNested(fieldsState.current.isNested);
	}

	function onStartDateChange(value) {
		fieldsState.current.startDate = value;
		setNameStartDate(null);
		setNameEndDate(null);
	}

	function onEndDateChange(value) {
		fieldsState.current.endDate = value;
		setNameStartDate(undefined);
		setNameEndDate(undefined);
	}

	return (
		<div className={`test-execution-new-cycle-modal ${loading ? 'disabled' : ''}`}>
			<div className="test-execution-new-cycle-modal-header">
				<div className="tencm-header-text qtest-text-h600">{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_HEADER')}</div>
			</div>
			<div className="test-execution-new-cycle-modal-content">
				<div className="tencm-content-item name">
					<label className="tencm-content-item-label qtest-text-h200" htmlFor="cycle-name">
						{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_CONTENT_NAME_LBL')}
						<span className="required-field qtest-text-h200">*</span>
					</label>
					<Textfield id="cycle-name" isRequired={true} width={265} isInvalid={nameError} onChange={onNameChange} />
					<div className={`tencm-content-item-error ${nameError ? 'visible' : ''}`}>
						<div className="tencm-content-item-error-icon">
							<ErrorIcon size="small" primaryColor={R400} />
						</div>
						<div className="tencm-content-item-error-text">This field is required.</div>
					</div>
				</div>
				<div className="tencm-content-item description">
					<label className="tencm-content-item-label qtest-text-h200" htmlFor="cycle-description">
						{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_CONTENT_DESCRIPTION_LBL')}
					</label>
					<TextArea id="cycle-description" onChange={onDescriptionChange} />
				</div>
				<div className="tencm-content-item-row">
					<div className="tencm-row-item version">
						<label className="tencm-row-item-label qtest-text-h200" htmlFor="cycle-version">
							{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_CONTENT_VERSION_LBL')}
							<span className="required-field qtest-text-h200">*</span>
						</label>
						<Select
							id="cycle-version"
							className={`tencm-row-item-version-select ${versionError ? 'invalid-field' : ''}`}
							options={versions}
							onChange={onVersionChange}
						/>
						<div className={`error-text ${versionError ? 'visible' : ''}`}>
							<div className="tencm-row-item-error-icon">
								<ErrorIcon size="small" primaryColor={R400} />
							</div>
							<div className="tencm-row-item-error-text">This field is required.</div>
						</div>
					</div>
					<div className="tencm-row-item cycle">
						<div className="tencm-content-item-cycle-checkbox-wrapper">
							<Checkbox id="cycle-nested" className="cycle-nested-checkbox" onChange={onCycleNestedChange} />
							<label className="tencm-content-item-cycle-label qtest-text-h200" htmlFor="cycle-nested">
								{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_CONTENT_NESTED_LBL')}
							</label>
						</div>
						<div className={`tencm-content-item-cycle-select ${!isNested || !fieldsState.current.version ? 'disabled' : ''}`}>
							<CycleSelect versionId={fieldsState.current.version} onCycleSelect={onCycleChange} />
						</div>
					</div>
				</div>
				<div className="tencm-content-item-row">
					<div className="tencm-row-item planned-start">
						<label className="tencm-row-item-label qtest-text-h200" htmlFor="planned-start">
							{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_CONTENT_PLANNED_START_LBL')}
						</label>
						<div className={`datepicker-wrapper ${nameStartDate ? 'invalid-field' : ''}`}>
							<DatePicker id="planned-start" onChange={onStartDateChange} />
						</div>
						<div className={`error-text ${nameStartDate ? 'visible' : ''}`}>
							<div className="tencm-row-item-error-icon">
								<ErrorIcon size="small" primaryColor={R400} />
							</div>
							<div className="tencm-row-item-error-text">{nameStartDate}</div>
						</div>
					</div>
					<div className="tencm-row-item planned-end">
						<label className="tencm-row-item-label qtest-text-h200" htmlFor="planned-end">
							{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_CONTENT_PLANNED_END_LBL')}
						</label>
						<div className={`datepicker-wrapper ${nameEndDate ? 'invalid-field' : ''}`}>
							<DatePicker id="planned-end" onChange={onEndDateChange} />
						</div>
						<div className={`error-text ${nameEndDate ? 'visible' : ''}`}>
							<div className="tencm-row-item-error-icon">
								<ErrorIcon size="small" primaryColor={R400} />
							</div>
							<div className="tencm-row-item-error-text">{nameEndDate}</div>
						</div>
					</div>
				</div>
			</div>
			<div className="test-execution-new-cycle-modal-footer">
				<div className="tencm-footer-buttons">
					<div className="tencm-footer-button">
						<If value={!props.displayBack}>
							<Button appearance="subtle" onClick={() => onCancel()}>
								{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_FOOTER_CANCEL_BTN')}
							</Button>
						</If>
						<If value={props.displayBack}>
							<Button appearance="subtle" onClick={() => props.onBack()}>
								{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_FOOTER_BACK_BTN')}
							</Button>
						</If>
					</div>
					<div className="tencm-footer-button">
						<Button appearance="primary" onClick={() => onCreate()}>
							{i18n.t('TEST_EXECUTION_NEW_CYCLE_MODAL_FOOTER_CREATE_BTN')}
						</Button>
					</div>
				</div>
			</div>
			<If value={loading}>
				<div className="test-execution-new-cycle-modal-spinner">
					<Spinner size="xlarge" />
				</div>
			</If>
		</div>
	);
}

TestExecutionNewCycleModalInternal.propTypes = {
	versions: PropTypes.array,
	displayBack: PropTypes.bool,
	onBack: PropTypes.func,
	onCreate: PropTypes.func
};

export const TestExecutionNewCycleModal = withLogPath(
	withErrorBoundaryRoot(TestExecutionNewCycleModalInternal),
	'TestExecutionNewCycleModal'
);
