import React, { useState } from 'react';
import './execution-status-select.styles.scss';
import { PopupSelect } from '@atlaskit/select';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import { ExecutionStatus } from '../../../../../shared/enums';
import PropTypes from 'prop-types';
import { getExecutionStatusLabel } from './get-execution-status-label.function';
import Lozenge from '@atlaskit/lozenge';
import { deepCopyJson } from '../../../../../shared/tools';
import { getExecutionStatusColors } from './get-execution-status-colors.function';

function ExecutionStatusSelectComponent(props) {
	const [status, setStatus] = useState(props.defaultValue);
	const options = [
		{ value: ExecutionStatus.PASSED, label: getExecutionStatusLabel(ExecutionStatus.PASSED) },
		{ value: ExecutionStatus.FAILED, label: getExecutionStatusLabel(ExecutionStatus.FAILED) },
		{ value: ExecutionStatus.BLOCKED, label: getExecutionStatusLabel(ExecutionStatus.BLOCKED) },
		{ value: ExecutionStatus.IN_PROGRESS, label: getExecutionStatusLabel(ExecutionStatus.IN_PROGRESS) },
		{ value: ExecutionStatus.UNEXECUTED, label: getExecutionStatusLabel(ExecutionStatus.UNEXECUTED) }
	];

	function onChange(option) {
		setStatus(option.value);
		props.onChange(option.value);
	}

	function isOptionSelected(option) {
		return option.value === status;
	}

	function getOptionsLabel() {
		return getExecutionStatusLabel(status);
	}

	function getOptionColors() {
		return deepCopyJson(getExecutionStatusColors(status));
	}

	function renderTarget({ isOpen, ...triggerProps }) {
		return (
			<div {...triggerProps} className="execution-status-select-component-target">
				<span className="trigger-container">
					<span className="trigger-label">
						<Lozenge style={getOptionColors()}>{getOptionsLabel()}</Lozenge>
					</span>
					<span className="trigger-arrow">
						<ChevronDownIcon />
					</span>
				</span>
			</div>
		);
	}

	return (
		<PopupSelect
			onChange={onChange}
			options={options}
			menuPlacement="top"
			isOptionSelected={isOptionSelected}
			isSearchable={false}
			target={renderTarget}
			minMenuWidth={145}
		/>
	);
}

ExecutionStatusSelectComponent.defaultProps = {
	defaultValue: ExecutionStatus.UNEXECUTED,
	onChange: () => {}
};

ExecutionStatusSelectComponent.propTypes = {
	defaultValue: PropTypes.string,
	onChange: PropTypes.func
};

export const ExecutionStatusSelect = withLogPath(withErrorBoundary(ExecutionStatusSelectComponent), 'ExecutionStatusSelect');
