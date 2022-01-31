import React, { useEffect, useRef, useState } from 'react';
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add';
import EditorEditIcon from '@atlaskit/icon/glyph/editor/edit';
import EditorRemoveIcon from '@atlaskit/icon/glyph/editor/remove';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';
import MediaServicesFitToPageIcon from '@atlaskit/icon/glyph/media-services/fit-to-page';
import { useLogHook, withLogPath } from '../../shared/log-service';
import { withErrorBoundary } from '../../shared/error-boundary';
import './project-page-test-design.styles.scss';
import Button from '@atlaskit/button';
import { CallTestIcon } from '../../assets/icons';
import VidPlayIcon from '@atlaskit/icon/glyph/vid-play';
import { N500 } from '../../shared/design-styles';
import { generateProjectTestCaseFolderData } from '../../../../../shared/generate-data-structure';
import { FOLDER_TREE_ITEM_ROOT_ID, FolderTree, generateFolderTreeItemData, generateFolderTreeRootItemData } from '../../shared/folder-tree';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import MoreIcon from '@atlaskit/icon/glyph/more';
import { SearchTextField } from '../../shared/search-text-field';
import { ExternalCommunicationService } from '../../shared/external-communication';
import Spinner from '@atlaskit/spinner';
import { TestDesignTestCases } from './test-design-test-cases';
import { If } from '../../shared/if';

function ProjectPageTestDesignInternal() {
	const log = useLogHook();
	const [selectedFolderId, setSelectedFolderId] = useState(FOLDER_TREE_ITEM_ROOT_ID);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [folders, setFolders] = useState([]);
	const [foldersLinkMap, setFoldersLinkMap] = useState({});
	const folderTreeRef = useRef();

	useEffect(() => {
		(async () => {
			await getFolders();
		})();
	}, []);

	async function getFolders(foldersCache) {
		setLoading(true);

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
		setFolders(testFolders);
		setFoldersLinkMap(testFoldersLinkMap);

		setLoading(false);
	}

	function addFolder() {
		const newFolder = generateProjectTestCaseFolderData();
		const newTreeFolder = generateFolderTreeItemData(newFolder.id, newFolder.children, {
			name: newFolder.name,
			count: newFolder.count
		});

		folderTreeRef.current.createItem(newTreeFolder);
	}

	function onSearch(value) {
		setSearch(value);
	}

	function rootDropDownTrigger({ triggerRef, ...props }) {
		return <Button appearance="subtle-link" {...props} iconBefore={<MoreIcon label="" />} ref={triggerRef} />;
	}

	function addSubfolder(item) {
		const newFolder = generateProjectTestCaseFolderData();
		const newTreeFolder = generateFolderTreeItemData(newFolder.id, newFolder.children, {
			name: newFolder.name,
			count: newFolder.count
		});

		folderTreeRef.current.createItem(newTreeFolder, item.id);
	}

	function renameFolder(item) {
		folderTreeRef.current.editItem(item.id);
	}

	function deleteFolder(item) {
		folderTreeRef.current.deleteItem(item.id);

		const externalCommunicationService = new ExternalCommunicationService();
		externalCommunicationService.unlinkTestCasesFromFolder(item);
	}

	function expandAllFolders(item) {
		folderTreeRef.current.expandAll(item.id);
	}

	function collapseAllFolders(item) {
		folderTreeRef.current.collapseAll(item.id);
	}

	function createTestRun(item) {}

	function setSelectedRootFolder() {
		folderTreeRef.current.setSelectedRoot();
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

			setFolders(folders);

			externalCommunicationService.setProjectTestFolders(folders).catch((e) => {
				log.error('Failed to save test case folders.', e);
			});
		}
	}

	function triggerReload() {
		(async () => {
			await getFolders(folders);
		})();
	}

	return (
		<div className="qtest-lite-project-page-test-design-container">
			<div className={`test-design-left-container ${loading ? 'loading' : ''}`}>
				<div className="left-container-section">
					<div className="left-container-title-wrapper">
						<CallTestIcon className="title-icon" />
						<div className="title-label">TEST CASE FOLDERS</div>
					</div>
				</div>
				<div className="left-container-section">
					<SearchTextField onChange={onSearch} />
				</div>
				<div className="left-container-section">
					<Button
						spacing="none"
						className="left-container-new-folder"
						appearance="link"
						onClick={addFolder}
						iconBefore={<EditorAddIcon size="medium" />}
					>
						New folder
					</Button>
				</div>
				<div className="left-container-folders">
					<div
						className={`folder-item-container${selectedFolderId === FOLDER_TREE_ITEM_ROOT_ID ? ' selected' : ''}`}
						onClick={setSelectedRootFolder}
					>
						<div className="folder-item-space" />
						<div className="folder-item-content">
							<div className="folder-item-name">
								<b>All Test cases</b>
							</div>
						</div>
						<div className="folder-item-menu">
							<DropdownMenu placement="bottom-end" trigger={rootDropDownTrigger}>
								<DropdownItemGroup>
									<DropdownItem
										elemBefore={<MediaServicesActualSizeIcon size="medium" primaryColor={N500} />}
										onClick={() => expandAllFolders({})}
									>
										Expand all
									</DropdownItem>
									<DropdownItem
										elemBefore={<MediaServicesFitToPageIcon size="medium" primaryColor={N500} />}
										onClick={() => collapseAllFolders({})}
									>
										Collapse all
									</DropdownItem>
								</DropdownItemGroup>
							</DropdownMenu>
						</div>
					</div>
					<FolderTree
						className="folders-wrapper"
						onSelectedIdChange={setSelectedFolderId}
						onItemsChange={onFoldersChange}
						treeRef={folderTreeRef}
						renderItemMenuItems={(item) => (
							<>
								<DropdownItem
									elemBefore={<EditorAddIcon size="medium" primaryColor={N500} />}
									onClick={() => addSubfolder(item)}
								>
									Add subfolder
								</DropdownItem>
								<DropdownItem
									elemBefore={<EditorEditIcon size="medium" primaryColor={N500} />}
									onClick={() => renameFolder(item)}
								>
									Rename
								</DropdownItem>
								<DropdownItem
									elemBefore={<EditorRemoveIcon size="medium" primaryColor={N500} />}
									onClick={() => deleteFolder(item)}
								>
									Delete
								</DropdownItem>
								<DropdownItem
									elemBefore={<MediaServicesActualSizeIcon size="medium" primaryColor={N500} />}
									onClick={() => expandAllFolders(item)}
								>
									Expand all
								</DropdownItem>
								<DropdownItem
									elemBefore={<MediaServicesFitToPageIcon size="medium" primaryColor={N500} />}
									onClick={() => collapseAllFolders(item)}
								>
									Collapse all
								</DropdownItem>
								<DropdownItem
									isDisabled={true}
									elemBefore={<VidPlayIcon size="medium" primaryColor={N500} />}
									onClick={() => createTestRun(item)}
								>
									Create test run
								</DropdownItem>
							</>
						)}
						search={search}
					/>
				</div>
				<If value={loading}>
					<div className="loading-overlay">
						<Spinner size="large" />
					</div>
				</If>
			</div>
			<div className="test-design-right-container">
				<If value={!loading}>
					<TestDesignTestCases
						selectedFolderId={selectedFolderId}
						folders={folders}
						foldersLinkMap={foldersLinkMap}
						onReload={triggerReload}
					/>
				</If>
			</div>
		</div>
	);
}

export const ProjectPageTestDesign = withLogPath(withErrorBoundary(ProjectPageTestDesignInternal), 'ProjectPageTestDesign');
