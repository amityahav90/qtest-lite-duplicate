import React, { useEffect, useRef, useState } from 'react';
import { useLogHook, withLogPath } from '../../shared/log-service';
import { withErrorBoundary } from '../../shared/error-boundary';
import moment from 'moment';
import Button from '@atlaskit/button';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { SearchTextField } from '../../shared/search-text-field';
import { CustomToggle } from '../../shared/custom-toggle';
import { N90, N500, R400, G300, Y300, N50, N40, P400, N0 } from '../../shared/design-styles';
import './project-page-test-execution.styles.scss';
import VidPlayIcon from '@atlaskit/icon/glyph/vid-play';
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import FilterIcon from '@atlaskit/icon/glyph/filter';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import TableIcon from '@atlaskit/icon/glyph/table';
import { TestCoverageBar } from '../../shared/test-coverage-bar';
import { FOLDER_TREE_ITEM_ROOT_ID, generateFolderTreeItemData } from '../../shared/folder-tree';
import { SimpleTag as Tag } from '@atlaskit/tag';
import { Checkbox } from '@atlaskit/checkbox';
import Lozenge from '@atlaskit/lozenge';
import DynamicTable from '@atlaskit/dynamic-table';
import { TestExecutionEmptyStateIcon } from '../../assets/icons';
import { Modal } from '@forge/bridge';
import i18n from '../../shared/localization/i18n';
import { ExternalCommunicationService } from '../../shared/external-communication';
import Spinner from '@atlaskit/spinner';
import { If } from '../../shared/if';
import { TestExecutionVersionCycles } from './test-execution-version-cycles';
import { SearchTextFieldCollapse } from '../../shared/search-text-field-collapse';
import { range } from '../../../../../shared/tools';
import Pagination from '@atlaskit/pagination';
import { PopupSelect } from '@atlaskit/select';
import { AppSettingsService } from '../../../../../shared/app-settings-service';
import { useNavigate } from 'react-router';

function ProjectPageTestExecutionInternal() {
	const log = useLogHook();
	const externalCommunicationService = new ExternalCommunicationService();
	const releaseFilterOptions = [
		{
			name: 'UNRELEASED',
			value: 'unreleased'
		},
		{
			name: 'RELEASED',
			value: 'released'
		}
	];
	const statusesLegend = [
		{
			name: 'Failed',
			color: R400
		},
		{
			name: 'Passed',
			color: G300
		},
		{
			name: 'Blocked',
			color: Y300
		},
		{
			name: 'Unexecuted',
			color: N50
		}
	];
	const options = [
		{ label: '100', value: 100 },
		{ label: '75', value: 75 },
		{ label: '50', value: 50 },
		{ label: '25', value: 25 },
		{ label: '10', value: 10 }
	];
	const navigate = useNavigate();

	const [versions, setVersions] = useState([]);
	const [filteredVersions, setFilteredVersions] = useState([]);
	const [testRuns, setTestRuns] = useState([]);
	const [search, setSearch] = useState('');
	const [releasesFilter, setReleasesFilter] = useState(releaseFilterOptions[0].value);
	const [selectedCycleId, setSelectedCycleId] = useState(FOLDER_TREE_ITEM_ROOT_ID);
	const [selectedVersionId, setSelectedVersionId] = useState('');
	const [noContent, setNoContent] = useState(false);
	const [leftLoading, setLeftLoading] = useState(false);
	const [rightLoading, setRightLoading] = useState(false);
	const [messages, setMessages] = useState(new Map());
	const [selectedPage, setSelectedPage] = useState(1);
	const [itemsLimit, setItemsLimit] = useState(25);
	const [selectedItems, setSelectedItems] = useState(new Set());
	const [itemsStart, setItemsStart] = useState(0);
	const [itemsCache, setItemsCache] = useState({});
	const [sorting, setSorting] = useState({ key: 'summary', order: 'DESC' });
	const [pages, setPages] = useState([]);
	const [itemsTotal, setItemsTotal] = useState(0);
	const treeLoaded = useRef({});
	const cyclesCache = useRef(new Map());
	const data = useRef({ itemsLimit: undefined });

	useEffect(() => {
		loadTestRuns();
	}, [selectedCycleId, search, sorting, selectedPage, itemsLimit]);

	useEffect(() => {
		setLeftLoading(true);

		externalCommunicationService
			.getProjectVersions()
			.then((projectVersions) => {
				log.debug('Successfully retrieved project versions', projectVersions);

				const formattedVersions = initVersions(projectVersions);

				setVersions(formattedVersions);

				if (!!formattedVersions && formattedVersions.length > 0) {
					setSelectedVersionId(formattedVersions[0].id);
				}

				setLeftLoading(false);
			})
			.catch((e) => {
				log.error('Failed to retrieve project versions', e);
			});
	}, []);

	useEffect(() => {
		const tempFilteredVersions = [];
		const released = releasesFilter === 'released';

		versions.forEach((version) => {
			if (!version.archived && version.released === released) {
				tempFilteredVersions.push(version);
			}
		});

		setFilteredVersions(tempFilteredVersions);
	}, [versions, releasesFilter]);

	function getHead() {
		return {
			cells: [
				{
					key: 'selection',
					content: (
						<div className="select-all-checkbox">
							<Checkbox
								isChecked={selectedItems.size > 0}
								isIndeterminate={selectedItems.size > 0 && selectedItems.size < testRuns.length}
								onChange={onSelectAll}
							/>
						</div>
					)
				},
				{ key: 'key', content: 'ID', isSortable: true },
				{ key: 'summary', content: 'Name', isSortable: true },
				{ key: 'status', content: 'Status', isSortable: true },
				{ key: 'assignee', content: 'Assigned to', isSortable: true },
				{ key: 'planned-start-date', content: 'Planned start date', isSortable: true },
				{ key: 'planned-end-date', content: 'Planned end date', isSortable: true }
			]
		};
	}

	function getRows() {
		const dateFormat = new AppSettingsService().getDateFormat();

		return testRuns.map((value) => {
			const row = {
				key: `row-${value.key}`,
				cells: [
					{
						key: 'selection',
						content: (
							<Checkbox
								isChecked={selectedItems.has(value.key)}
								onChange={() => {
									if (selectedItems.has(value.key)) {
										selectedItems.delete(value.key);
									} else {
										selectedItems.add(value.key);
									}

									setSelectedItems(new Set(selectedItems));
								}}
							/>
						)
					},
					{
						key: 'key',
						content: (
							<Button spacing="none" appearance="link" onClick={() => openTestRun(value.key)}>
								{value.key}
							</Button>
						)
					},
					{ key: 'summary', content: value.summary },
					{
						key: 'status',
						content: (
							<div className={`custom-lozenge-tag ${value.status ? value.status.toLowerCase() : 'incomplete'}`}>
								<Lozenge style={{ backgroundColor: 'transparent', color: getStatusColor(value.status) }}>
									{value.status ? value.status.toUpperCase() : 'INCOMPLETE'}
								</Lozenge>
							</div>
						)
					},
					{ key: 'assignee', content: value.assignee },
					{ key: 'planned-start-date', content: moment(value.plannedStartDate).format(dateFormat) },
					{ key: 'planned-end-date', content: moment(value.plannedEndDate).format(dateFormat) }
				]
			};

			return row;
		});
	}

	function openTestRun(issueKey) {
		const externalCommunicationService = new ExternalCommunicationService();

		externalCommunicationService.openUrl(`/browse/${issueKey}`);
	}

	function getStatusColor(status) {
		const _status = status || 'incomplete';

		switch (_status.toLowerCase()) {
			case 'passed':
				return G300;
			case 'failed':
				return R400;
			case 'blocked':
				return Y300;
			case 'skipped':
				return N40;
			case 'incomplete':
				return P400;
			default:
				return N0;
		}
	}

	function initVersions(projectVersions) {
		return projectVersions.map((version) => ({
			id: version.id,
			name: version.name,
			opened: false,
			archived: version.archived,
			released: version.released,
			releaseDate: version.releaseDate,
			overdue: version.overdue
		}));
	}

	function loadTestRuns() {
		let start = (selectedPage - 1) * itemsLimit;

		setSelectedItems(new Set());

		if (start === itemsStart || data.current.itemsLimit !== itemsLimit) {
			start = 0;
			data.current.itemsLimit = itemsLimit;
			setItemsCache(() => ({}));
			setSelectedPage(() => 1);
		} else {
			if (itemsCache[start]) {
				setTestRuns(itemsCache[start]);
				setItemsStart(start);

				return;
			}
		}

		setRightLoading(true);

		externalCommunicationService
			.getTestRunIssues({
				start,
				limit: itemsLimit,
				jqlOptions: { search: search, sorting: sorting, cycleId: selectedCycleId }
			})
			.then(({ issues, total }) => {
				let pagesLength = (total / itemsLimit) | 0;

				if (total % itemsLimit > 0) {
					pagesLength++;
				}

				setTestRuns(issues);
				setItemsCache((prevItemsCache) => ({ ...prevItemsCache, [start]: issues }));
				setItemsStart(start);
				setItemsTotal(total);

				if (pages.length !== pagesLength) {
					setPages(range(pagesLength, 1));
				}
			})
			.catch((e) => {
				log.error('Failed retrieve test runs issues.', e);
			})
			.finally(() => {
				setRightLoading(false);
			});
	}

	function setVersionIsOpen(version) {
		version.opened = !version.opened;

		if (!version.opened) {
			treeLoaded.current[version.id] = false;
		}

		setVersions([...versions]);
	}

	function onSearch(value) {
		setSearch(value);
	}

	async function addTestCycle() {
		const modal = new Modal({
			resource: 'ql-new-cycle-modal',
			onClose: (payload) => {
				if (payload) {
					log.debug('New cycle data received from the new cycle modal.');

					const { versionId, parentId, cycle } = payload;

					if (versions.filter((v) => v.id === versionId && v.opened).length > 0) {
						const body = {
							parentId: parentId,
							cycle: generateFolderTreeItemData(cycle.id, cycle.children, {
								name: cycle.name,
								description: cycle.description,
								startDate: cycle.startDate,
								endDate: cycle.endDate,
								count: 0
							})
						};

						sendMessage(versionId, { type: 'create', body });
					}

					if (cyclesCache.current.has(versionId)) {
						const versionCyclesCache = cyclesCache.current.get(versionId);
						const parent = versionCyclesCache.filter((v) => v.id === parentId);

						versionCyclesCache.push(cycle);
						parent.children.push(cycle.id);
					}
				} else {
					log.debug('The new cycle modal closed without adding a new cycle.');
				}
			},
			size: 'medium',
			context: {
				versions: versions
			}
		});

		await modal.open();
	}

	function sendMessage(versionId, message) {
		const messagesArray = messages.get(versionId) || [];

		messagesArray.push(message);

		messages.set(versionId, messagesArray);
		setMessages(new Map(messages));
	}

	function onCyclesLoad(versionId, cycles) {
		cyclesCache.current.set(versionId, cycles);
	}

	function requestMessage(versionId) {
		messages.get(versionId).shift();
		setMessages(new Map(messages));
	}

	function onPageChange(evt, page) {
		if (selectedPage === page) {
			return;
		}

		setSelectedPage(page);
	}

	function onSortTestRuns({ key, sortOrder }) {
		setSorting({
			key: key,
			order: sortOrder
		});
	}

	function onOptionChange(option) {
		if (option.value !== itemsLimit) {
			setItemsLimit(option.value);
		}
	}

	function isOptionSelected(option) {
		return option.value === itemsLimit;
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

	function onSelectAll(evt) {
		if (evt.target.checked) {
			setSelectedItems(
				testRuns.reduce((items, item) => {
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

	function onSelectVersion(version) {
		setSelectedVersionId(version.id);
		setSelectedCycleId(FOLDER_TREE_ITEM_ROOT_ID);

		sendMessage(version.id, { type: 'select-root' });
	}

	function getSelectedCycleName() {
		if (selectedCycleId !== FOLDER_TREE_ITEM_ROOT_ID) {
			const versionCycles = cyclesCache.current.get(selectedVersionId) || [];
			const selectedCycle = versionCycles.find((cycle) => cycle.id === selectedCycleId);

			return selectedCycle ? selectedCycle.name : '';
		} else {
			const selectedVersion = versions.find((version) => version.id === selectedVersionId);

			return selectedVersion ? selectedVersion.name : '';
		}
	}

	function onCycleIdChange(versionId, cycleId) {
		if (cycleId !== FOLDER_TREE_ITEM_ROOT_ID) {
			setSelectedCycleId(cycleId);
			setSelectedVersionId(versionId);
		}
	}

	function run() {
		navigate(`/test-pad/${selectedVersionId}/${selectedCycleId}`);
	}

	return (
		<div className="qtest-lite-project-page-test-execution-container">
			<div className={`test-execution-left-container ${leftLoading ? 'disabled' : ''}`}>
				<div className="te-left-container-section">
					<div className="te-left-container-title-wrapper">
						<VidPlayIcon className="te-title-icon" primaryColor={N90} size="small" />
						<div className="te-title-label">{i18n.t('PROJECT_PAGE_TEST_EXECUTION_LEFT_HEADER')}</div>
					</div>
				</div>
				<div className="te-left-container-section">
					<SearchTextField onChange={onSearch} />
				</div>
				<div className="te-left-container-section">
					<Button
						spacing="none"
						className="te-new-cycle"
						appearance="link"
						onClick={() => addTestCycle()}
						iconBefore={<EditorAddIcon size="medium" />}
					>
						{i18n.t('PROJECT_PAGE_TEST_EXECUTION_LEFT_NEW_CYCLE_BTN')}
					</Button>
				</div>
				<div className="te-left-container-splitter" />
				<div className="te-left-container-release-filter">
					<CustomToggle options={releaseFilterOptions} onChange={(selectedOption) => setReleasesFilter(selectedOption)} />
				</div>
				<div className="te-left-container-cycle-folders">
					<div className="te-left-container-cycle-folders-wrapper">
						<If value={filteredVersions.length > 0}>
							{filteredVersions.map((version, i) => (
								<div key={version.id} className="cycle-version-item">
									<div
										className={`cycle-version-item-parent ${
											selectedVersionId === version.id && selectedCycleId === FOLDER_TREE_ITEM_ROOT_ID
												? 'selected'
												: ''
										}`}
										onClick={() => onSelectVersion(version)}
									>
										<div className="cvip-left">
											<div
												className={`cvip-arrow ${version.opened ? 'opened' : ''}`}
												onClick={(e) => {
													setVersionIsOpen(version);
													e.stopPropagation();
												}}
											>
												<ChevronDownIcon size="medium" primaryColor={N500} />
											</div>
											<div className="cvip-name">{version.name}</div>
										</div>
										<div className="cvip-right">
											<div className="cvip-progress-bar">
												<TestCoverageBar statuses={version.statuses || {}} />
											</div>
										</div>
									</div>
									<If value={version.opened}>
										<TestExecutionVersionCycles
											versionId={version.id}
											selectedVersionId={selectedVersionId}
											selectedCycleId={selectedCycleId}
											search={search}
											cycles={cyclesCache.current.get(version.id)}
											onCyclesLoad={onCyclesLoad}
											onCycleIdChange={(cycleId) => onCycleIdChange(version.id, cycleId)}
											onMessageRequest={requestMessage}
											message={
												messages.has(version.id) &&
												messages.get(version.id).length > 0 &&
												messages.get(version.id)[0]
											}
										/>
									</If>
								</div>
							))}
						</If>
						<If value={filteredVersions.length <= 0}>
							<div className="te-left-container-cycle-folders empty">There are no {releasesFilter} versions.</div>
						</If>
					</div>
				</div>
				{leftLoading && (
					<div className="left-loading-overlay">
						<Spinner size="large" />
					</div>
				)}
			</div>
			<div className="test-execution-right-container">
				{noContent ? (
					<div className="test-execution-right-empty-state">
						<div className="empty-state-image">
							<TestExecutionEmptyStateIcon />
						</div>
						<div className="empty-state-text">
							<div className="empty-state-text-header">Get started with Test Runs</div>
							<div className="empty-state-text-content">
								To start testing using Jira, you need to
								<br />
								create a Test Case issue type.
							</div>
						</div>
						<div className="empty-state-create-tr">
							<Button appearance="primary">Create a Test Run</Button>
						</div>
					</div>
				) : (
					<div className={`test-execution-right ${rightLoading ? 'disabled' : ''}`}>
						<div className="test-execution-right-top-header">
							<div className="top-header-cycle-name">{getSelectedCycleName()}</div>
							<div className="top-header-add-test-run">
								<Button appearance="primary">{i18n.t('PROJECT_PAGE_TEST_EXECUTION_RIGHT_ACTIONS_ADD_BTN')}</Button>
							</div>
						</div>
						<div className="test-execution-right-header-stats">
							<div className="terh-stats-wrapper">
								<div className="stat-items">
									<div className="stat-item">
										<div className="stat-item-header">
											{i18n.t('PROJECT_PAGE_TEST_EXECUTION_RIGHT_HEADER_STATS_TOTAL_TEXT')}
										</div>
										<div className="stat-item-content">6</div>
									</div>
									<div className="stat-item">
										<div className="stat-item-header">
											{i18n.t('PROJECT_PAGE_TEST_EXECUTION_RIGHT_HEADER_STATS_EXECUTED_TEXT')}
											<span className="stat-item-header-percentage">
												<Tag appearance="rounded" text={'75%'} />
											</span>
										</div>
										<div className="stat-item-content">4</div>
									</div>
									<div className="stat-item">
										<div className="stat-item-header">
											{i18n.t('PROJECT_PAGE_TEST_EXECUTION_RIGHT_HEADER_STATS_UNEXECUTED_TEXT')}
											<span className="stat-item-header-percentage">
												<Tag appearance="rounded" text={'25%'} />
											</span>
										</div>
										<div className="stat-item-content">2</div>
									</div>
								</div>
								<div className="stat-chart-wrapper">
									<div className="stat-chart">
										<TestCoverageBar
											statuses={{ passed: 1, failed: 2, blocked: 1, unexecuted: 2 }}
											displayCount={true}
										/>
									</div>
									<div className="stat-chart-legend">
										{statusesLegend.map((statusLegend) => (
											<div key={`${statusLegend.name}`} className="stat-chart-legend-item">
												<div className="scli-color" style={{ backgroundColor: statusLegend.color }} />
												<div className="scli-text">{statusLegend.name}</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
						<div className="test-execution-right-separator" />
						<div className="test-execution-right-actions">
							<div className="test-execution-right-actions-wrapper">
								<div className="tera-left">
									<If value={selectedItems.size > 0}>
										<div className="tera-left-item selected-count">{selectedItems.size} selected</div>
										<div className="tera-left-item run">
											<Button className="run-btn" iconBefore={<VidPlayIcon size="small" label="Run" />} onClick={run}>
												{i18n.t('PROJECT_PAGE_TEST_EXECUTION_RIGHT_ACTIONS_RUN_BTN')}
											</Button>
											<div className="quick-run-btn">
												<DropdownMenu
													trigger={({ triggerRef, ...props }) => (
														<Button
															className="quick-run-btn"
															{...props}
															iconAfter={<ChevronDownIcon />}
															ref={triggerRef}
														/>
													)}
												>
													<DropdownItemGroup>
														<DropdownItem>
															{i18n.t(
																'PROJECT_PAGE_TEST_EXECUTION_RIGHT_ACTIONS_RUN_DROPDOWN_ITEM_QUICK_RUN'
															)}
														</DropdownItem>
													</DropdownItemGroup>
												</DropdownMenu>
											</div>
										</div>
										<div className="tera-left-item edit">
											<Button
												className="edit-btn"
												appearance="default"
												iconBefore={<EditFilledIcon size="medium" />}
											/>
										</div>
										<div className="tera-left-item clone">
											<Button className="clone-btn" appearance="default" iconBefore={<CopyIcon size="medium" />} />
										</div>
										<div className="tera-left-item delete">
											<Button className="delete-btn" appearance="default" iconBefore={<TrashIcon size="medium" />} />
										</div>
									</If>
								</div>
								<div className="tera-right">
									<div className="tera-right-cycle-actions">
										<div className="tera-right-cycle-action search">
											<SearchTextFieldCollapse onChange={onSearch} />
										</div>
										<div className="tera-right-cycle-action filters">
											<div className="tera-right-filter-btn">
												<Button appearance="default" iconBefore={<FilterIcon size="medium" />}>
													{i18n.t('PROJECT_PAGE_TEST_EXECUTION_RIGHT_ACTIONS_FILTERS_BTN')}
												</Button>
											</div>
										</div>
										<div className="tera-right-cycle-action columns">
											<Button className="column-btn" iconBefore={<TableIcon size="small" />} />
											<div className="column-arrow">
												<DropdownMenu
													trigger={({ triggerRef, ...props }) => (
														<Button
															className="column-arrow"
															{...props}
															iconAfter={<ChevronDownIcon />}
															ref={triggerRef}
														/>
													)}
												>
													<DropdownItemGroup>
														<DropdownItem>Option 1</DropdownItem>
														<DropdownItem>Option 2</DropdownItem>
														<DropdownItem>Option 3</DropdownItem>
													</DropdownItemGroup>
												</DropdownMenu>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="test-execution-right-tests-table">
							<DynamicTable
								head={getHead()}
								rows={getRows()}
								loadingSpinnerSize="large"
								sortKey={sorting.key}
								sortOrder={sorting.order}
								onSort={onSortTestRuns}
								isLoading={rightLoading}
								emptyView={
									<div>
										<If value={testRuns.length === 0}>
											<div className="test-execution-empty-table">There are no Test Runs in the selected cycle.</div>
										</If>
									</div>
								}
							/>
						</div>
						<div className="test-execution-right-tests-pagination">
							<If value={!rightLoading}>
								<div className="test-execution-right-tests-pagination-items-limit">
									<PopupSelect
										onChange={onOptionChange}
										options={options}
										isOptionSelected={isOptionSelected}
										isSearchable={false}
										minMenuWidth={60}
										target={({ isOpen, ...triggerProps }) => (
											<div {...triggerProps} className="test-execution-items-limit-trigger">
												<span className="test-execution-trigger-container">
													<span className="test-execution-trigger-label">{getOptionsLabel()}</span>
													<span className="test-execution-trigger-arrow">
														<ChevronDownIcon />
													</span>
												</span>
											</div>
										)}
									/>
									<div className="test-execution-items-total">of {itemsTotal}</div>
								</div>
								<Pagination pages={pages} onChange={onPageChange} max={15} selectedIndex={selectedPage - 1} />
							</If>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export const ProjectPageTestExecution = withLogPath(withErrorBoundary(ProjectPageTestExecutionInternal), 'ProjectPageTestExecution');
