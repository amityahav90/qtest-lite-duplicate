import React, { useEffect, useRef, useState } from 'react';
import { withLogPath } from '../../shared/log-service';
import { withErrorBoundaryRoot } from '../../shared/error-boundary-root';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import './cycles-select.styles.scss';
import Popup from '@atlaskit/popup';
import { FOLDER_TREE_ITEM_ROOT_ID } from '../../shared/folder-tree';
import * as PropTypes from 'prop-types';
import { TestExecutionVersionCycles } from '../../project-page/project-page-test-execution/test-execution-version-cycles';

function CycleSelectInternal(props) {
	const [opened, setOpened] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState(FOLDER_TREE_ITEM_ROOT_ID);
	const [placeholder, setPlaceholder] = useState('Select...');
	const cyclesCache = useRef(new Map());

	useEffect(() => {
		if (placeholder !== 'Select...') {
			setPlaceholder('Select...');
		}
	}, [props.versionId]);

	function onCyclesLoad(versionId, cycles) {
		cyclesCache.current.set(versionId, cycles);
	}

	function onCycleIdChange(value) {
		setSelectedFolderId(value);

		if (value !== FOLDER_TREE_ITEM_ROOT_ID) {
			if (cyclesCache.current.has(props.versionId)) {
				const selectedCycle = cyclesCache.current.get(props.versionId).find((cycle) => cycle.id === value);

				props.onCycleSelect({ id: selectedCycle.id, name: selectedCycle.name });

				if (selectedCycle) {
					setPlaceholder(selectedCycle.name);
				}
			}

			setOpened(false);
		} else {
			props.onCycleSelect({ id: value, name: value });
		}
	}

	function renderTrigger(props) {
		return (
			<div {...props} className="cycle-select-wrapper">
				<div className="cycle-select-head" onClick={() => setOpened(!opened)}>
					<div className={`cycle-select-head-value ${placeholder !== 'Select...' ? 'selected' : ''}`}>{placeholder}</div>
					<div className="cycle-select-head-icon">
						<ChevronDownIcon size="medium" primaryColor="#000000" />
					</div>
				</div>
			</div>
		);
	}

	function renderContent() {
		return (
			<div className={props.customContentStyles ? '' : 'content-wrapper'} style={props.customContentStyles}>
				<TestExecutionVersionCycles
					versionId={props.versionId}
					search={''}
					cycles={cyclesCache.current.get(props.versionId)}
					onCyclesLoad={onCyclesLoad}
					onCycleIdChange={onCycleIdChange}
					onMessageRequest={() => {}}
					message={false}
					dragEnabled={false}
				/>
			</div>
		);
	}

	return (
		<Popup
			className="cycle-select-options"
			isOpen={opened}
			onClose={() => setOpened(false)}
			placement="bottom-start"
			shouldFlip={false}
			trigger={(triggerProps) => renderTrigger(triggerProps)}
			content={() => renderContent()}
		/>
	);
}

CycleSelectInternal.propTypes = {
	versionId: PropTypes.string.isRequired,
	onCycleSelect: PropTypes.func.isRequired,
	customContentStyles: PropTypes.object
};

export const CycleSelect = withLogPath(withErrorBoundaryRoot(CycleSelectInternal), 'CycleSelect');
