import React from 'react';
import { withLogPath } from '../../../shared/log-service';
import { withErrorBoundary } from '../../../shared/error-boundary';
import PropTypes from 'prop-types';
import Button from '@atlaskit/button';
import './save-panel.styles.scss';

function SavePanelInternal(props) {
	function cancel() {
		if (props.onCancel) {
			props.onCancel();
		}
	}

	function save() {
		if (props.onSave) {
			props.onSave();
		}
	}

	function getSavePanelView() {
		if (!props.active) {
			return;
		}

		return (
			<div className="save-panel">
				<Button className="save-panel-cancel" appearance="subtle-link" onClick={cancel}>
					Cancel
				</Button>
				<Button className="save-panel-save" appearance="link" onClick={save}>
					Save
				</Button>
			</div>
		);
	}

	function getComponentClass() {
		let className = 'save-panel-component';

		if (props.className) {
			className += ` ${props.className}`;
		}

		return className;
	}

	return (
		<div className={getComponentClass()}>
			<div className="save-panel-content">{props.children}</div>
			{getSavePanelView()}
		</div>
	);
}

SavePanelInternal.propTypes = {
	children: PropTypes.any.isRequired,
	active: PropTypes.bool,
	onCancel: PropTypes.func,
	onSave: PropTypes.func,
	className: PropTypes.string
};

export const SavePanel = withLogPath(withErrorBoundary(SavePanelInternal), 'SavePanel');
