import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLogHook, withLogPath } from '../shared/log-service';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import { view } from '@forge/bridge';
import { Radio } from '@atlaskit/radio';
import Button from '@atlaskit/button';
import Spinner from '@atlaskit/spinner';
import i18n from '../shared/localization/i18n';
import './issue-call-to-test-modal.styles.scss';
import '../shared/common-styles/common-styles.scss';
import { CallTestIcon } from '../assets/icons';
import FilterIcon from '@atlaskit/icon/glyph/filter';
import DynamicTable from '@atlaskit/dynamic-table';
import { ExternalCommunicationService } from '../shared/external-communication';
import { FOLDER_TREE_ITEM_ROOT_ID, FolderTree, generateFolderTreeItemData, generateFolderTreeRootItemData } from '../shared/folder-tree';
import { generateProjectTestCaseFolderData } from '../../../../shared/generate-data-structure';
import { SearchTextField } from '../shared/search-text-field';
import { If } from '../shared/if';
import Pagination from '@atlaskit/pagination';
import { range } from '../../../../shared/tools';

function IssueCallToTestModalInternal() {
	const log = useLogHook();
	const externalCommunicationService = new ExternalCommunicationService();

	const [testCases, setTestCases] = useState([]);
	const [selectedTestCase, setSelectedTestCase] = useState('');
	const [leftLoading, setLeftLoading] = useState(true);
	const [rightLoading, setRightLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [allowSave, setAllowSave] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState(FOLDER_TREE_ITEM_ROOT_ID);
	const [folderSearch, setFolderSearch] = useState('');
	const [testSearch, setTestSearch] = useState('');
	const [sorting, setSorting] = useState({ key: 'created', order: 'DESC' });
	const [pages, setPages] = useState([]);
	const [selectedPage, setSelectedPage] = useState(1);
	const [itemsStart, setItemsStart] = useState(0);
	const [itemsCache, setItemsCache] = useState({});
	const [itemsLimit] = useState(11);
	const folderTreeRef = useRef();

	useEffect(() => {
		(async () => {
			await getFolders();
		})();
	}, []);

	useEffect(() => {
		(async () => {
			await getTestCasesFromJira();
		})();
	}, [selectedFolderId, testSearch, sorting, selectedPage]);

	const onChange = useCallback(
		({ currentTarget: { value } }) => {
			setSelectedTestCase(value);
			setAllowSave(true);
		},
		[setSelectedTestCase]
	);

	const head = {
		cells: [
			{ key: 'selection', content: '', isSortable: false },
			{ key: 'priority', content: 'P', isSortable: true },
			{ key: 'key', content: 'ID', isSortable: true },
			{ key: 'summary', content: 'Name', isSortable: true },
			{ key: 'creator', content: 'Created by', isSortable: true },
			{ key: 'created', content: 'Created on', isSortable: true },
			{ key: 'assignee', content: 'Assigned to', isSortable: true },
			{ key: 'updated', content: 'Modified on', isSortable: true }
		]
	};
	const rows = testCases.map((issue) => ({
		key: `row-${issue.key}`,
		cells: [
			{
				key: 'selection',
				content: (
					<Radio
						isChecked={`${issue.key}-radio` === selectedTestCase}
						onChange={onChange}
						name="test-case"
						value={`${issue.key}-radio`}
					/>
				)
			},
			{ key: 'priority', content: <img style={{ width: '24px', height: '24px' }} src={issue.priority.url} /> },
			{ key: 'key', content: issue.key },
			{ key: 'summary', content: issue.summary },
			{ key: 'creator', content: issue.creator },
			{ key: 'created', content: formatDate(issue.created) },
			{ key: 'assignee', content: issue.assignee },
			{ key: 'updated', content: formatDate(issue.updated) }
		]
	}));

	function onCancel() {
		view.close();
	}

	function onSave() {
		if (setSelectedTestCase) {
			setDisabled(true);

			const issueKey = selectedTestCase.split('-radio')[0];
			const issue = testCases.find((issue) => issue.key === issueKey);

			if (issue === undefined) {
				log.debug('Failed to get the selected test case.');
				setDisabled(false);
				return;
			}

			externalCommunicationService
				.getIssueSteps(issueKey)
				.then((steps) => {
					setDisabled(false);

					view.close({
						issueKey: issue.key,
						summary: issue.summary,
						stepsCount: steps.length
					});
				})
				.catch((e) => {
					log.debug(`Failed to get the steps of Test Case [${issueKey}]. Perhaps there are no steps for this Test Case?`, e);
					setDisabled(false);

					view.close({
						issueKey: issue.key,
						summary: issue.summary,
						stepsCount: 0
					});
				});
		}
	}

	async function getFolders(foldersCache) {
		setLeftLoading(true);

		const externalCommunicationService = new ExternalCommunicationService();
		const testFolders = foldersCache || (await externalCommunicationService.getProjectTestFolders());
		const testFoldersLinkMap = await externalCommunicationService.getProjectTestFoldersLinkMap();
		const testFoldersMap =
			testFolders.length > 0
				? testFolders.reduce((obj, folder) => {
						obj[folder.id] = generateFolderTreeItemData(folder.id, folder.children, {
							name: folder.name,
							count: (testFoldersLinkMap[folder.id] && testFoldersLinkMap[folder.id].length) || 0
						});

						return obj;
				  }, {})
				: { [FOLDER_TREE_ITEM_ROOT_ID]: generateFolderTreeRootItemData() };
		const rootItem = testFoldersMap[FOLDER_TREE_ITEM_ROOT_ID];

		folderTreeRef.current.setTree({ rootId: rootItem.id, items: { [rootItem.id]: rootItem, ...testFoldersMap } });

		setLeftLoading(false);
	}

	async function getTestCasesFromJira() {
		setRightLoading(true);

		const folderId = selectedFolderId === FOLDER_TREE_ITEM_ROOT_ID ? undefined : selectedFolderId;
		let start = (selectedPage - 1) * itemsLimit;

		if (start === itemsStart) {
			start = 0;
			setItemsCache(() => ({}));
			setSelectedPage(() => 1);
		} else {
			if (itemsCache[start]) {
				setTestCases(itemsCache[start]);
				setItemsStart(start);

				return;
			}
		}

		externalCommunicationService
			.getTestCaseIssues({
				start: start,
				limit: itemsLimit,
				jqlOptions: { folderId: folderId, search: testSearch, sorting: sorting },
				excludeCurrentTestCase: true
			})
			.then(({ issues, total }) => {
				let pagesLength = (total / itemsLimit) | 0;

				if (total % itemsLimit > 0) {
					pagesLength++;
				}

				setTestCases(issues);

				if (pages.length !== pagesLength) {
					setPages(range(pagesLength, 1));
				}
			})
			.catch((e) => {
				log.error('Failed retrieve test case issues.', e);
			})
			.finally(() => {
				setRightLoading(false);
			});
	}

	function onFoldersChange(tree) {
		if (!tree) {
			return;
		}

		const items = tree.items;
		const folders = [];
		let preventSave = false;

		for (const key in items) {
			if (Object.prototype.hasOwnProperty.call(items, key)) {
				const item = items[key];

				if (item.id !== FOLDER_TREE_ITEM_ROOT_ID && !item.data.name) {
					preventSave = true;

					break;
				}

				folders.push(generateProjectTestCaseFolderData(item.id, item.data.name, item.data.count, item.children));
			}
		}

		if (!preventSave) {
			const externalCommunicationService = new ExternalCommunicationService();

			externalCommunicationService.setProjectTestFolders(folders).catch((e) => {
				log.error('Failed to save test case folders.', e);
			});
		}
	}

	function formatDate(date) {
		const d = new Date(date);
		return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear().toString().substr(2)}`;
	}

	function setSelectedRootFolder() {
		folderTreeRef.current.setSelectedRoot();
	}

	function onSortTestCases({ key, sortOrder }) {
		setSorting({
			key: key,
			order: sortOrder
		});
	}

	function onPageChange(evt, page) {
		if (selectedPage === page) {
			return;
		}

		setSelectedPage(page);
	}

	return (
		<div className={`call-to-test-modal ${disabled ? 'disabled' : ''}`}>
			<div className="cttm-header">
				<div className="cttm-header-txt">{i18n.t('ISSUE_CALL_TO_TEST_MODAL_HEADER')}</div>
			</div>
			<div className="cttm-content">
				<div className="cttm-content-left-container">
					<div className="cttm-content-left-container-section">
						<div className="cttm-content-left-container-title-wrapper">
							<CallTestIcon className="cttm-content-title-icon" />
							<div className="cttm-content-title-label">{i18n.t('ISSUE_CALL_TO_TEST_MODAL_CONTENT_LEFT_LABEL')}</div>
						</div>
					</div>
					<div className="cttm-content-left-container-section">
						<SearchTextField onChange={setFolderSearch} />
					</div>
					<div className="cttm-content-left-container-folders">
						<div
							className={`cttm-content-folder-item-container ${
								selectedFolderId === FOLDER_TREE_ITEM_ROOT_ID ? ' selected' : ''
							}`}
							onClick={setSelectedRootFolder}
						>
							<div className="cttm-content-folder-item-space" />
							<div className="cttm-content-folder-item-content">
								<div className="cttm-content-folder-item-name">
									<b>{i18n.t('ISSUE_CALL_TO_TEST_MODAL_CONTENT_LEFT_FOLDERS_ROOT')}</b>
								</div>
							</div>
						</div>
						<If value={leftLoading}>
							<div className="cttm-content-left-container-folders-loading">
								<Spinner size="large" />
							</div>
						</If>
						<FolderTree
							className="cttm-content-folders-wrapper"
							onSelectedIdChange={setSelectedFolderId}
							onItemsChange={onFoldersChange}
							treeRef={folderTreeRef}
							dragEnabled={false}
							search={folderSearch}
						/>
					</div>
				</div>
				<div className="cttm-content-right-container">
					<div className="cttm-content-test-cases-actions">
						<div className="cttm-content-test-cases-actions-right">
							<SearchTextField className="cttm-content-action-search" onChange={setTestSearch} />
							<Button className="cttm-content-action-filter" appearance="default">
								<FilterIcon size="medium" />
							</Button>
						</div>
					</div>
					<div className={`cttm-content-test-cases ${rightLoading ? 'loading' : ''}`}>
						<div className="cttm-content-test-cases-table">
							<DynamicTable
								head={head}
								rows={rows}
								loadingSpinnerSize="large"
								sortKey={sorting.key}
								sortOrder={sorting.order}
								onSort={onSortTestCases}
								isLoading={rightLoading}
								emptyView={
									<div>
										<If value={!!testSearch}>
											<div className="cttm-content-test-cases-table-empty">
												{i18n.t('ISSUE_CALL_TO_TEST_MODAL_CONTENT_RIGHT_TABLE_EMPTY_SEARCH')}{' '}
												<span className="search-term">{testSearch}</span>.
											</div>
										</If>
										<If value={!testSearch}>
											<div className="cttm-content-test-cases-table-empty">
												{i18n.t('ISSUE_CALL_TO_TEST_MODAL_CONTENT_RIGHT_TABLE_EMPTY_TESTS')}
											</div>
										</If>
									</div>
								}
							/>
						</div>
						<div className={`cttm-content-test-cases-pagination ${testCases.length === 0 ? 'hidden' : ''}`}>
							<Pagination pages={pages} onChange={onPageChange} max={15} selectedIndex={selectedPage - 1} />
						</div>
					</div>
				</div>
			</div>
			<div className="cttm-footer">
				<div className="cttm-footer-buttons">
					<div className="cttm-footer-button">
						<Button appearance="subtle" onClick={() => onCancel()}>
							{i18n.t('ISSUE_CALL_TO_TEST_MODAL_CANCEL_BTN')}
						</Button>
					</div>
					<div className="iam-footer-button">
						<Button isDisabled={!allowSave} appearance="primary" onClick={() => onSave()}>
							{i18n.t('ISSUE_CALL_TO_TEST_MODAL_ADD_BTN')}
						</Button>
					</div>
				</div>
			</div>
			<If value={disabled}>
				<div className="call-to-test-modal-loading">
					<Spinner size="xlarge" />
				</div>
			</If>
		</div>
	);
}

export const IssueCallToTestModal = withLogPath(withErrorBoundaryRoot(IssueCallToTestModalInternal), 'IssueCallToTestModal');
