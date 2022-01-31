import React, { useEffect, useRef, useState } from 'react';
import { useLogHook, withLogPath } from '../../../shared/log-service';
import { withErrorBoundary } from '../../../shared/error-boundary';
import * as PropTypes from 'prop-types';
import { FOLDER_TREE_ITEM_ROOT_ID, FolderTree, generateFolderTreeItemData } from '../../../shared/folder-tree';
import i18n from '../../../shared/localization/i18n';
import { If } from '../../../shared/if';
import Spinner from '@atlaskit/spinner';
import { ExternalCommunicationService } from '../../../shared/external-communication';
import './test-execution-version-cycles.styles.scss';
import { CycleFolderIcon } from '../../../assets/icons';
import { generateVersionCycleData } from '../../../../../../shared/generate-data-structure';

function TestExecutionVersionCyclesInternal(props) {
	const log = useLogHook();
	const [loading, setLoading] = useState(false);
	const [initialized, setInitialized] = useState(false);
	const treeRef = useRef();

	useEffect(() => {
		setLoading(true);

		(async () => {
			const externalCommunicationService = new ExternalCommunicationService();
			const cycles = props.cycles || (await getCycles());
			const testCyclesLinkMap = await externalCommunicationService.getProjectTestCyclesLinkMap();
			const cyclesMap = cycles.reduce((obj, cycle) => {
				obj[cycle.id] = generateFolderTreeItemData(cycle.id, cycle.children, {
					name: cycle.name,
					count: (testCyclesLinkMap[cycle.id] && testCyclesLinkMap[cycle.id].length) || 0
				});

				return obj;
			}, {});
			const rootItem = cyclesMap[FOLDER_TREE_ITEM_ROOT_ID];

			treeRef.current.setTree({ rootId: rootItem.id, items: { [rootItem.id]: rootItem, ...cyclesMap } });
			setLoading(false);
			setInitialized(true);

			if (props.selectedCycleId && cyclesMap[props.selectedCycleId]) {
				treeRef.current.setSelectedId(props.selectedCycleId);
			}

			if (!props.cycles) {
				props.onCyclesLoad(props.versionId, cycles);
			}
		})();
	}, []);

	useEffect(() => {
		if (props.message) {
			const { type, body } = props.message;

			switch (type) {
				case 'create':
					treeRef.current.createItem(body.cycle, body.parentId, false);

					break;
				case 'select-root':
					treeRef.current.setSelectedRoot();

					break;
				default:
					break;
			}

			props.onMessageRequest(props.versionId);
		}
	}, [props.message]);

	useEffect(() => {
		if (props.versionId !== props.selectedVersionId && treeRef.current) {
			treeRef.current.setSelectedRoot();
		}
	}, [props.selectedVersionId]);

	async function getCycles() {
		const externalCommunicationService = new ExternalCommunicationService();
		return await externalCommunicationService.getProjectTestCycles(props.versionId);
	}

	function onCyclesChange(tree) {
		if (!tree) {
			return;
		}

		const items = tree.items;
		const cycles = [];
		let preventSave = false;

		for (const key in items) {
			if (Object.prototype.hasOwnProperty.call(items, key)) {
				const item = items[key];

				if (item.id !== FOLDER_TREE_ITEM_ROOT_ID && !item.data.name) {
					preventSave = true;

					break;
				}

				cycles.push(
					generateVersionCycleData(
						item.id,
						item.data.name,
						item.data.description,
						item.data.startDate,
						item.data.endDate,
						item.children
					)
				);
			}
		}

		if (!preventSave) {
			const externalCommunicationService = new ExternalCommunicationService();
			externalCommunicationService.setProjectTestCycles(props.versionId, cycles).catch((e) => {
				log.error('Failed to save test case folders.', e);
			});
		}
	}

	return (
		<div className="test-execution-version-cycles-component">
			<If value={loading}>
				<div className="version-cycles-loading">
					<Spinner size="medium" />
				</div>
			</If>
			<FolderTree
				className="version-cycles"
				onSelectedIdChange={props.onCycleIdChange}
				onItemsChange={onCyclesChange}
				treeRef={treeRef}
				search={props.search}
				dragEnabled={props.dragEnabled}
				renderItemIcon={() => <CycleFolderIcon className="version-cycles-icon" />}
				noItemsLabel={i18n.t('PROJECT_PAGE_TEST_EXECUTION_LEFT_NO_FOLDERS_TEXT')}
			/>
		</div>
	);
}

TestExecutionVersionCyclesInternal.propTypes = {
	versionId: PropTypes.string.isRequired,
	search: PropTypes.string.isRequired,
	selectedVersionId: PropTypes.string.isRequired,
	selectedCycleId: PropTypes.string.isRequired,
	cycles: PropTypes.array,
	onCycleIdChange: PropTypes.func.isRequired,
	onCyclesLoad: PropTypes.func.isRequired,
	onMessageRequest: PropTypes.func.isRequired,
	message: PropTypes.any.isRequired,
	dragEnabled: PropTypes.bool
};

export const TestExecutionVersionCycles = withLogPath(withErrorBoundary(TestExecutionVersionCyclesInternal), 'TestExecutionVersionCycles');
