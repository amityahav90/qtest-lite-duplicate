import React, { useState } from 'react';
import './move-to-folder-popup-menu.styles.scss';
import PropTypes from 'prop-types';
import { withLogPath } from '../../../../shared/log-service';
import { withErrorBoundary } from '../../../../shared/error-boundary';
import { Popup } from '@atlaskit/popup';
import Button from '@atlaskit/button';
import MediaServicesArrowIcon from '@atlaskit/icon/glyph/media-services/arrow';
import FolderFilledIcon from '@atlaskit/icon/glyph/folder-filled';
import { N300 } from '../../../../shared/design-styles';
import { SearchTextField } from '../../../../shared/search-text-field';
import {
	FOLDER_TREE_ITEM_ROOT_ID,
	FolderTree,
	generateFolderTreeItemData,
	generateFolderTreeRootItemData
} from '../../../../shared/folder-tree';
import Tooltip from '@atlaskit/tooltip';

function MoveToFolderPopupMenuComponent(props) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [loaded, setLoaded] = useState(false);

	function setIsOpenHelper(opened) {
		setIsOpen(opened);

		if (!opened) {
			setLoaded(false);
		}
	}

	function popupOnClose() {
		setIsOpenHelper(false);
	}

	function popupOnFolderSelection(folderId) {
		setIsOpenHelper(false);

		if (props.onSelectFolder) {
			props.onSelectFolder(folderId);
		}
	}

	function popupOnRootClick() {
		popupOnFolderSelection(FOLDER_TREE_ITEM_ROOT_ID);
	}

	function renderContent() {
		return (
			<div className="move-to-folder-popup-menu-component-content">
				<div className="popup-menu-search">
					<SearchTextField onChange={setSearch} />
				</div>
				<div className="popup-menu-folders">
					<div className="all-items" onClick={popupOnRootClick}>
						<div className="all-items-label qtest-text-h400">All Test cases</div>
					</div>
					<FolderTree
						className="folders-wrapper"
						onSelectedIdChange={popupOnFolderSelection}
						dragEnabled={false}
						treeRef={(ref) => {
							if (ref && !loaded) {
								const testFoldersMap =
									props.folders.length > 0
										? props.folders.reduce((obj, folder) => {
												obj[folder.id] = generateFolderTreeItemData(folder.id, folder.children, {
													name: folder.name,
													count: (props.foldersLinkMap[folder.id] && props.foldersLinkMap[folder.id].length) || 0
												});

												return obj;
										  }, {})
										: { [FOLDER_TREE_ITEM_ROOT_ID]: generateFolderTreeRootItemData() };
								const rootItem = testFoldersMap[FOLDER_TREE_ITEM_ROOT_ID];

								ref.setTree({ rootId: rootItem.id, items: { [rootItem.id]: rootItem, ...testFoldersMap } });

								setLoaded(true);
							}
						}}
						search={search}
					/>
				</div>
			</div>
		);
	}

	function triggerOnClick() {
		setIsOpenHelper(!isOpen);
	}

	function getIconBefore() {
		return (
			<div className="action-button-icon action-button-move-to">
				<FolderFilledIcon size="medium" primaryColor={N300} />
				<div className="action-button-move-to-absolute">
					<MediaServicesArrowIcon size="small" primaryColor="#fff" />
				</div>
			</div>
		);
	}

	function renderTrigger(triggerProps) {
		return (
			<Tooltip content="Move to folder">
				<Button
					className={props.className}
					{...triggerProps}
					isSelected={isOpen}
					onClick={triggerOnClick}
					iconBefore={getIconBefore()}
				/>
			</Tooltip>
		);
	}

	return <Popup isOpen={isOpen} onClose={popupOnClose} placement="bottom-end" content={renderContent} trigger={renderTrigger} />;
}

MoveToFolderPopupMenuComponent.propTypes = {
	className: PropTypes.string,
	selectedId: PropTypes.string,
	onSelectFolder: PropTypes.func,
	folders: PropTypes.any,
	foldersLinkMap: PropTypes.any
};

export const MoveToFolderPopupMenu = withLogPath(withErrorBoundary(MoveToFolderPopupMenuComponent), 'MoveToFolderPopupMenu');
