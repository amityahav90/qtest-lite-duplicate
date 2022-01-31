import React, { useEffect, useRef, useState } from 'react';
import './test-design-test-cases.styles.scss';
import { useLogHook, withLogPath } from '../../../shared/log-service';
import { withErrorBoundary } from '../../../shared/error-boundary';
import Button from '@atlaskit/button';
import { N300 } from '../../../shared/design-styles';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import FilterIcon from '@atlaskit/icon/glyph/filter';
import DynamicTable from '@atlaskit/dynamic-table';
import { Checkbox } from '@atlaskit/checkbox';
import PropTypes from 'prop-types';
import { ExternalCommunicationService } from '../../../shared/external-communication';
import { SearchTextField } from '../../../shared/search-text-field';
import { FOLDER_TREE_ITEM_ROOT_ID } from '../../../shared/folder-tree';
import Pagination from '@atlaskit/pagination';
import { deepCopyJson, range } from '../../../../../../shared/tools';
import { If } from '../../../shared/if';
import { MoveToFolderPopupMenu } from './move-to-folder-popup-menu';
import { PopupSelect } from '@atlaskit/select';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import Tooltip from '@atlaskit/tooltip';
import { defaultTestCaseColumnsConstant, TableColumnsPopupMenu } from './table-columns-popup-menu';
import i18n from '../../../shared/localization/i18n';
import { CycleFolderFilledIcon } from '../../../assets/icons';
import { Modal } from '@forge/bridge';

function TestDesignTestCasesComponent(props) {
	const [loading, setLoading] = useState(true);
	const [testCases, setTestCases] = useState([]);
	const [sorting, setSorting] = useState({ key: 'created', order: 'DESC' });
	const [search, setSearch] = useState('');
	const [selectedPage, setSelectedPage] = useState(1);
	const [itemsStart, setItemsStart] = useState(0);
	const [itemsLimit, setItemsLimit] = useState(25);
	const [itemsTotal, setItemsTotal] = useState(0);
	const [itemsCache, setItemsCache] = useState({});
	const [pages, setPages] = useState([]);
	const [selectedItems, setSelectedItems] = useState(new Set());
	const [reload, setReload] = useState(false);
	const [folderNamesMap, setFolderNamesMap] = useState(new Map());
	const [columns, setColumns] = useState({
		priority: true,
		id: true,
		summary: true,
		creator: true,
		created: true,
		assignee: true,
		updated: true
	});
	const data = useRef({ itemsLimit: undefined });
	const log = useLogHook();
	const options = [
		{ label: '100', value: 100 },
		{ label: '75', value: 75 },
		{ label: '50', value: 50 },
		{ label: '25', value: 25 },
		{ label: '10', value: 10 }
	];

	useEffect(() => {
		loadTestCases();
	}, [props.selectedFolderId, search, sorting, selectedPage, reload, itemsLimit]);

	useEffect(() => {
		setFolderNamesMap(
			(props.folders || []).reduce((map, folder) => {
				map.set(folder.id, folder.name);

				return map;
			}, new Map())
		);
	}, [props.folders]);

	function getHead() {
		const head = { cells: /** @type any */ [] };

		head.cells.push({
			key: 'selection',
			content: (
				<div className="select-all-checkbox">
					<Checkbox
						isChecked={selectedItems.size > 0}
						isIndeterminate={selectedItems.size > 0 && selectedItems.size < testCases.length}
						onChange={onSelectAll}
					/>
				</div>
			)
		});

		if (columns.priority) {
			head.cells.push({ key: 'priority', content: 'P', isSortable: true });
		}

		if (columns.id) {
			head.cells.push({ key: 'key', content: 'ID', isSortable: true });
		}

		if (columns.summary) {
			head.cells.push({ key: 'summary', content: 'Name', isSortable: true });
		}

		if (columns.creator) {
			head.cells.push({ key: 'creator', content: 'Created by', isSortable: true });
		}

		if (columns.created) {
			head.cells.push({ key: 'created', content: 'Created on', isSortable: true });
		}

		if (columns.assignee) {
			head.cells.push({ key: 'assignee', content: 'Assigned to', isSortable: true });
		}

		if (columns.updated) {
			head.cells.push({ key: 'updated', content: 'Modified on', isSortable: true });
		}

		if (props.selectedFolderId === FOLDER_TREE_ITEM_ROOT_ID) {
			head.cells.push({ key: 'folder', content: 'Folder', width: 5 });
		}

		return head;
	}

	/**
	 * @returns any
	 */
	function getRows() {
		return testCases.map((issue) => {
			const row = { key: `row-${issue.key}`, cells: [] };

			row.cells.push({
				key: 'selection',
				content: (
					<Checkbox
						isChecked={selectedItems.has(issue.key)}
						onChange={() => {
							if (selectedItems.has(issue.key)) {
								selectedItems.delete(issue.key);
							} else {
								selectedItems.add(issue.key);
							}

							setSelectedItems(new Set(selectedItems));
						}}
					/>
				)
			});

			if (columns.priority) {
				row.cells.push({
					key: 'priority',
					content: <img style={{ width: '24px', height: '24px' }} src={issue.priority.url} alt={issue.priority.name} />
				});
			}

			if (columns.id) {
				row.cells.push({
					key: 'key',
					content: (
						<Button spacing="none" appearance="link" onClick={() => openTestCase(issue.key)}>
							{issue.key}
						</Button>
					)
				});
			}

			if (columns.summary) {
				row.cells.push({ key: 'summary', content: issue.summary });
			}

			if (columns.creator) {
				row.cells.push({ key: 'creator', content: issue.creator });
			}

			if (columns.created) {
				row.cells.push({ key: 'created', content: formatDate(issue.created) });
			}

			if (columns.assignee) {
				row.cells.push({ key: 'assignee', content: issue.assignee });
			}

			if (columns.updated) {
				row.cells.push({ key: 'updated', content: formatDate(issue.updated) });
			}

			if (props.selectedFolderId === FOLDER_TREE_ITEM_ROOT_ID) {
				row.cells.push({
					key: 'folder',
					content: (
						<div className="folder-header qtest-text-ellipsis" title={folderNamesMap.get(issue.folderId)}>
							{folderNamesMap.get(issue.folderId)}
						</div>
					)
				});
			}

			return row;
		});
	}

	function isOptionSelected(option) {
		return option.value === itemsLimit;
	}

	function onOptionChange(option) {
		if (option.value !== itemsLimit) {
			setItemsLimit(option.value);
		}
	}

	function getOptionsLabel() {
		let startNum = (selectedPage - 1) * itemsLimit;
		let endNum = selectedPage * itemsLimit;

		if (endNum > itemsTotal) {
			endNum = itemsTotal;
		}

		if (startNum === 0 && endNum > 0) {
			startNum = 1;
		}

		return `${startNum} - ${endNum}`;
	}

	function getHeaderLabel() {
		return folderNamesMap.get(props.selectedFolderId) || i18n.t('TEST_DESIGN_TEST_CASES_COMPONENT_ALL_TEST_CASES');
	}

	function renderCreateTestRunIcon() {
		return (
			<div className="action-button-icon">
				<CycleFolderFilledIcon className="action-button-icon-cycle" />
			</div>
		);
	}

	function renderCloneIcon() {
		return (
			<div className="action-button-icon">
				<CopyIcon size="medium" primaryColor={N300} />
			</div>
		);
	}

	function renderDeleteIcon() {
		return (
			<div className="action-button-icon">
				<TrashIcon size="medium" primaryColor={N300} />
			</div>
		);
	}

	function handleColumnsDone(items) {
		setColumns(items);
	}

	return (
		<div className={'test-design-test-cases-component' + (loading ? ' loading' : '')}>
			<div className="test-cases-header">
				<div className="header-label qtest-text-h600">{getHeaderLabel()}</div>
				<Button appearance="primary" isDisabled={true}>
					{i18n.t('TEST_DESIGN_TEST_CASES_COMPONENT_NEW_TEST_CASE')}
				</Button>
			</div>
			<div className="test-design-test-cases-actions">
				<div className="test-cases-actions-left">
					<If value={selectedItems.size > 0}>
						<div className="test-cases-selected">{selectedItems.size} selected</div>
						<Tooltip content="Create Test Run">
							<Button className="action-button create-cycle" iconBefore={renderCreateTestRunIcon()} onClick={createTestRun}>
								Create cycle
							</Button>
						</Tooltip>
						<div className="action-space" />
						<MoveToFolderPopupMenu
							className="action-button"
							folders={props.folders}
							foldersLinkMap={props.foldersLinkMap}
							selectedId={props.selectedFolderId}
							onSelectFolder={onMoveToFolder}
						/>
						<div className="action-space" />
						<Tooltip content="Clone">
							<Button className="action-button" isDisabled={true} iconBefore={renderCloneIcon()} />
						</Tooltip>
						<div className="action-space" />
						<Tooltip content="Delete">
							<Button className="action-button" isDisabled={true} iconBefore={renderDeleteIcon()} />
						</Tooltip>
					</If>
				</div>
				<div className="test-cases-actions-right">
					<SearchTextField className="action-search" onChange={onSearchChange} delayActive={true} />
					<Button className="action-filter" iconBefore={<FilterIcon size="medium" />} isDisabled={true}>
						{i18n.t('TEST_DESIGN_TEST_CASES_COMPONENT_FILTERS')}
					</Button>
					<div className="action-space" />
					<TableColumnsPopupMenu
						items={columns}
						defaultItems={deepCopyJson(defaultTestCaseColumnsConstant)}
						onDone={handleColumnsDone}
					/>
				</div>
			</div>
			<div className="test-design-test-cases">
				<DynamicTable
					head={getHead()}
					rows={getRows()}
					loadingSpinnerSize="large"
					sortKey={sorting.key}
					sortOrder={sorting.order}
					onSort={onSortTestCases}
					isLoading={loading}
				/>
			</div>
			<div className="test-design-pagination">
				<If value={!loading}>
					<div className="pagination-items-limit">
						<PopupSelect
							onChange={onOptionChange}
							options={options}
							isOptionSelected={isOptionSelected}
							isSearchable={false}
							minMenuWidth={60}
							target={({ isOpen, ...triggerProps }) => (
								<div {...triggerProps} className="items-limit-trigger">
									<span className="trigger-container">
										<span className="trigger-label">{getOptionsLabel()}</span>
										<span className="trigger-arrow">
											<ChevronDownIcon />
										</span>
									</span>
								</div>
							)}
						/>
						<div className="items-total">of {itemsTotal}</div>
					</div>
					<Pagination pages={pages} onChange={onPageChange} max={15} selectedIndex={selectedPage - 1} />
				</If>
			</div>
		</div>
	);

	async function createTestRun() {
		const selectedTestCases = testCases.reduce((arr, testCase) => {
			if (selectedItems.has(testCase.key)) {
				arr.push({
					id: testCase.id,
					key: testCase.key,
					name: testCase.summary,
					priority: testCase.priority
				});
			}

			return arr;
		}, []);

		const modal = new Modal({
			resource: 'ql-test-run-modal',
			onClose: (payload) => {},
			size: 'medium',
			context: {
				testCases: selectedTestCases
			}
		});

		await modal.open();
	}

	async function onMoveToFolder(folderId) {
		const externalCommunicationService = new ExternalCommunicationService();
		let needReload = true;

		setLoading(true);

		try {
			const toFolderId = folderId !== FOLDER_TREE_ITEM_ROOT_ID ? folderId : undefined;
			const fromToMap = testCases.reduce((arr, testCase) => {
				if (selectedItems.has(testCase.key) && testCase.folderId !== toFolderId) {
					arr.push({
						id: testCase.id,
						folderId: testCase.folderId
					});
				}

				return arr;
			}, []);

			if (fromToMap.length > 0) {
				const folder = props.folders.filter((f) => f.id === toFolderId)[0];

				await externalCommunicationService.moveTestCasesToFolder(fromToMap, folder);

				if (props.onReload) {
					props.onReload();
				}
			} else {
				needReload = false;
				deselectAll();
			}
		} catch (e) {
			log.error('Failed move the test cases to a folder', e);
		}

		setLoading(false);

		if (needReload) {
			setReload(!reload);
		}
	}

	function onSelectAll(evt) {
		if (evt.target.checked) {
			setSelectedItems(
				testCases.reduce((items, item) => {
					items.add(item.key);

					return items;
				}, new Set())
			);
		} else {
			deselectAll();
		}
	}

	function deselectAll() {
		setSelectedItems(new Set());
	}

	function onPageChange(evt, page) {
		if (selectedPage === page) {
			return;
		}

		setSelectedPage(page);
	}

	function onSearchChange(value) {
		setSearch(value);
	}

	function onSortTestCases({ key, sortOrder }) {
		setSorting({
			key: key,
			order: sortOrder
		});
	}

	function loadTestCases() {
		const externalCommunicationService = new ExternalCommunicationService();
		const folderId = props.selectedFolderId === FOLDER_TREE_ITEM_ROOT_ID ? undefined : props.selectedFolderId;
		let start = (selectedPage - 1) * itemsLimit;

		setSelectedItems(new Set());

		if (start === itemsStart || data.current.itemsLimit !== itemsLimit) {
			start = 0;
			data.current.itemsLimit = itemsLimit;
			setItemsCache(() => ({}));
			setSelectedPage(() => 1);
		} else {
			if (itemsCache[start]) {
				setTestCases(itemsCache[start]);
				setItemsStart(start);

				return;
			}
		}

		setLoading(true);

		externalCommunicationService
			.getTestCaseIssues({
				start,
				limit: itemsLimit,
				jqlOptions: { folderId, search, sorting }
			})
			.then(({ issues, total }) => {
				let pagesLength = (total / itemsLimit) | 0;

				if (total % itemsLimit > 0) {
					pagesLength++;
				}

				setTestCases(issues);
				setItemsCache((prevItemsCache) => ({ ...prevItemsCache, [start]: issues }));
				setItemsStart(start);
				setItemsTotal(total);

				if (pages.length !== pagesLength) {
					setPages(range(pagesLength, 1));
				}
			})
			.catch((e) => {
				log.error('Failed retrieve test case issues.', e);
			})
			.finally(() => {
				setLoading(false);
			});
	}

	function formatDate(date) {
		const d = new Date(date);
		return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
	}

	function openTestCase(issueKey) {
		const externalCommunicationService = new ExternalCommunicationService();

		externalCommunicationService.openUrl(`/browse/${issueKey}`);
	}
}

TestDesignTestCasesComponent.propTypes = {
	selectedFolderId: PropTypes.string,
	folders: PropTypes.any,
	foldersLinkMap: PropTypes.any,
	onReload: PropTypes.func
};

export const TestDesignTestCases = withLogPath(withErrorBoundary(TestDesignTestCasesComponent), 'TestDesignTestCases');
