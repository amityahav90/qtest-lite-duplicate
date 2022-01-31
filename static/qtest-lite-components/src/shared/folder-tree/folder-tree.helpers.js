import { TREE_ITEM_ROOT_ID } from '../../../../../shared/constants';

export const FOLDER_TREE_ITEM_ROOT_ID = TREE_ITEM_ROOT_ID;
export const FOLDER_TREE_ITEM_PADDING_PER_LEVEL = 8;

export function generateFolderTreeItemData(id, children = [], data, isExpanded = false, isChildrenLoading = false) {
	return { id, children, hasChildren: children.length > 0, isExpanded, isChildrenLoading, data };
}

export function generateFolderTreeRootItemData(children = []) {
	return generateFolderTreeItemData(FOLDER_TREE_ITEM_ROOT_ID, children, {}, true);
}
