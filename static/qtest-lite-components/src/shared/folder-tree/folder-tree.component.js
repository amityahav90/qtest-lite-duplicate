import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import './folder-tree.styles.scss';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import Tree, { moveItemOnTree, mutateTree } from '@atlaskit/tree';
import PropTypes from 'prop-types';
import Button from '@atlaskit/button';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import { N500, N90 } from '../design-styles';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import EditorCloseIcon from '@atlaskit/icon/glyph/editor/close';
import DropdownMenu, { DropdownItemGroup } from '@atlaskit/dropdown-menu';
import MoreIcon from '@atlaskit/icon/glyph/more';
import { FOLDER_TREE_ITEM_PADDING_PER_LEVEL, FOLDER_TREE_ITEM_ROOT_ID } from './folder-tree.helpers';
import { DefaultPrevent, isSubString } from '../../../../../shared/tools';
import TextField from '@atlaskit/textfield';
import { If } from '../if';

function FolderTreeInternal(props) {
	const [itemMap, setItemOpenMap] = useState({ opened: new Set() });
	const [editItemId, setEditItemId] = useState();
	const [selectedId, setSelectedId] = useState(FOLDER_TREE_ITEM_ROOT_ID);
	const [tree, setTree] = useState(/** @type any */ undefined);
	const editItemRef = useRef();
	const selectItemPrevent = new DefaultPrevent();
	const hasItems =
		!!tree && tree.items && tree.items[FOLDER_TREE_ITEM_ROOT_ID] && tree.items[FOLDER_TREE_ITEM_ROOT_ID].children.length > 0;

	useImperativeHandle(props.treeRef, () => ({
		setSelectedId: (selectedId) => setSelectedIdHelper(selectedId),
		setSelectedRoot: () => setSelectedIdHelper(FOLDER_TREE_ITEM_ROOT_ID),
		getTree: () => tree,
		setTree: (newTree) => setTree(newTree),
		createItem: (item, parentId, editEnabled) => tree && createItem(item, parentId, editEnabled),
		deleteItem: (itemId) => tree && deleteItem(itemId),
		editItem: (itemId) => tree && editItem(itemId),
		expandAll: (parentId) => tree && expandAll(parentId),
		collapseAll: (parentId) => tree && collapseAll(parentId)
	}));

	useEffect(() => {
		if (props.onItemsChange) {
			props.onItemsChange(tree);
		}
	}, [tree]);

	function setSelectedIdHelper(id) {
		setSelectedId(id);

		if (props.onSelectedIdChange) {
			props.onSelectedIdChange(id);
		}
	}

	function setEditItemIdHelper(itemId) {
		if (editItemRef.current) {
			const value = editItemRef.current.value;

			if (value.trim()) {
				setTree((prevTree) => {
					const item = prevTree.items[editItemId];

					return mutateTree(prevTree, item.id, { data: { ...item.data, name: value } });
				});
			} else {
				const item = tree.items[editItemId];

				if (!item.data.name) {
					deleteItem(item.id);
				}
			}
		}

		setEditItemId(itemId);
	}

	function addItem(item, parentId = selectedId) {
		setTree((prevTree) => {
			const { rootId, items } = prevTree;
			const parentItem = items[parentId];
			const newTree = { rootId, items: { ...items, [item.id]: item } };

			return mutateTree(newTree, parentId, { isExpanded: true, children: [item.id, ...parentItem.children] });
		});
	}

	function createItem(item, parentId, editEnabled = true) {
		addItem(item, parentId);

		if (editEnabled) {
			setEditItemIdHelper(item.id);
		}
	}

	function deleteItem(itemId) {
		setTree((prevTree) => {
			const { rootId, items } = prevTree;
			let parentItem;

			for (const key in items) {
				if (Object.prototype.hasOwnProperty.call(items, key)) {
					if (items[key].children.indexOf(itemId) !== -1) {
						parentItem = items[key];
						break;
					}
				}
			}

			if (parentItem) {
				const newTree = { rootId, items: {} };

				deleteTreeItem(items, itemId);

				newTree.items = { ...items };

				setSelectedIdHelper(parentItem.id);

				return mutateTree(newTree, parentItem.id, { children: parentItem.children.filter((item) => item !== itemId) });
			} else {
				return prevTree;
			}
		});
	}

	function editItem(itemId) {
		setEditItemIdHelper(itemId);
	}

	function expandAll(parentId = FOLDER_TREE_ITEM_ROOT_ID) {
		setTree((prevTree) => expandCollapseHelper(prevTree, parentId, true));
	}

	function collapseAll(parentId = FOLDER_TREE_ITEM_ROOT_ID) {
		setTree((prevTree) => expandCollapseHelper(prevTree, parentId));
	}

	function expandCollapseHelper(newTree, parentId, expanded = false) {
		const parentItem = newTree.items[parentId];

		if (parentItem.children.length > 0) {
			if (parentItem.isExpanded !== expanded) {
				newTree = mutateTree(newTree, parentId, { isExpanded: expanded });
			}

			parentItem.children.forEach((childId) => {
				newTree = expandCollapseHelper(newTree, childId, expanded);
			});
		}

		return newTree;
	}

	function renderItemClass(itemId) {
		let className = 'item-container';

		if (selectedId === itemId) {
			className += ' selected';
		}

		return className;
	}

	function renderItemToggle(item, onExpand, onCollapse) {
		if (!item.children || item.children.length === 0) {
			return <span className="item-empty">&bull;</span>;
		}

		if (item.isExpanded) {
			return (
				<Button
					spacing="none"
					appearance="subtle-link"
					onClick={() => {
						onCollapse(item.id);
						selectItemPrevent.prevent();
					}}
				>
					<ChevronDownIcon label="" size="medium" primaryColor={N500} />
				</Button>
			);
		}

		return (
			<Button
				spacing="none"
				appearance="subtle-link"
				onClick={() => {
					onExpand(item.id);
					selectItemPrevent.prevent();
				}}
			>
				<ChevronRightIcon label="" size="medium" primaryColor={N500} />
			</Button>
		);
	}

	function itemMenuOpenChange(item, isOpen) {
		const opened = itemMap.opened;

		if (isOpen) {
			opened.add(item.id);
		} else {
			opened.delete(item.id);
		}

		setItemOpenMap({ opened });
	}

	function isItemOpened(item) {
		return itemMap.opened.has(item.id);
	}

	function renderItemIcon() {
		const iconProps = { className: 'item-icon', size: 'medium', primaryColor: N500 };

		if (props.renderItemIcon) {
			return props.renderItemIcon(iconProps);
		}

		return <FolderIcon {...iconProps} />;
	}

	function filterItem(items, itemId) {
		const item = items[itemId];

		if (isSubString(item.data.name, props.search)) {
			return true;
		}

		return item.children.some((childId) => filterItem(items, childId));
	}

	function onEditItemBlur() {
		setEditItemIdHelper(undefined);
	}

	function onEditItemKeyUp(e) {
		if (e.key === 'Enter' && e.target) {
			e.target.blur();
		}
	}

	function renderItemMenu(item) {
		if (!props.renderItemMenuItems) {
			return;
		}

		return (
			<div className={`item-menu${isItemOpened(item) ? ' opened' : ''}`} onClick={() => selectItemPrevent.prevent()}>
				<DropdownMenu
					placement="bottom-end"
					onOpenChange={({ isOpen }) => itemMenuOpenChange(item, isOpen)}
					trigger={dropDownTrigger}
				>
					<DropdownItemGroup>{props.renderItemMenuItems(item)}</DropdownItemGroup>
				</DropdownMenu>
			</div>
		);
	}

	function renderItemContent(item) {
		if (item.id === editItemId) {
			return (
				<div className="item-content">
					<div className="item-edit-container" onClick={() => selectItemPrevent.prevent()}>
						<TextField
							ref={editItemRef}
							placeholder="Folder name"
							className="item-edit-input"
							isCompact={true}
							autoFocus={true}
							defaultValue={item.data.name}
							onBlur={onEditItemBlur}
							onKeyUp={onEditItemKeyUp}
						/>
						<div className="item-edit-icon">{renderItemIcon()}</div>
						<div className="item-edit-clear">
							<Button spacing="none" appearance="subtle-link" onClick={() => (editItemRef.current.value = '')}>
								<EditorCloseIcon label="" size="medium" primaryColor={N90} />
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return (
			<>
				<div className="item-content">
					<div className="item-icon">{renderItemIcon()}</div>
					<div className="item-name qtest-text-ellipsis" title={item.data.name}>
						{item.data.name}
					</div>
					<div className="item-count">({item.data.count})</div>
				</div>
				{renderItemMenu(item)}
			</>
		);
	}

	function onItemClick(itemId) {
		if (!selectItemPrevent.isPrevented()) {
			setSelectedIdHelper(itemId);
		}
	}

	function dropDownTrigger({ triggerRef, ...props }) {
		return <Button appearance="subtle-link" {...props} iconBefore={<MoreIcon label="" />} ref={triggerRef} />;
	}

	function renderItem({ item, depth, onExpand, onCollapse, provided, snapshot }) {
		if (props.search) {
			if (!filterItem(tree.items, item.id)) {
				return <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} />;
			}
		}

		return (
			<div
				ref={provided.innerRef}
				{...provided.draggableProps}
				{...provided.dragHandleProps}
				className={renderItemClass(item.id)}
				onClick={() => onItemClick(item.id)}
			>
				{renderItemToggle(item, onExpand, onCollapse)}
				{renderItemContent(item)}
			</div>
		);
	}

	function onItemExpand(itemId) {
		setTree((prevTree) => mutateTree(prevTree, itemId, { isExpanded: true }));
	}

	function onItemCollapse(itemId) {
		setTree((prevTree) => mutateTree(prevTree, itemId, { isExpanded: false }));
	}

	function onItemDragEnd(source, destination) {
		if (!destination) {
			return;
		}

		setTree((prevTree) => moveItemOnTree(prevTree, source, destination));
	}

	function isDragEnabled() {
		const propEnabled = props.dragEnabled === undefined || props.dragEnabled;

		return propEnabled && !props.search && !editItemId;
	}

	return (
		<div className={getComponentClass(props.className)}>
			<If value={!!tree}>
				<If value={hasItems}>
					<Tree
						tree={tree}
						renderItem={renderItem}
						onExpand={onItemExpand}
						onCollapse={onItemCollapse}
						onDragEnd={onItemDragEnd}
						offsetPerLevel={FOLDER_TREE_ITEM_PADDING_PER_LEVEL}
						isDragEnabled={isDragEnabled()}
						isNestingEnabled={true}
					/>
				</If>
				<If value={!hasItems}>
					<div className="no-items">{props.noItemsLabel || 'No folders'}</div>
				</If>
			</If>
		</div>
	);
}

FolderTreeInternal.propTypes = {
	treeRef: PropTypes.any,
	className: PropTypes.string,
	search: PropTypes.string,
	renderItemIcon: PropTypes.func,
	renderItemMenuItems: PropTypes.func,
	onSelectedIdChange: PropTypes.func,
	onItemsChange: PropTypes.func,
	noItemsLabel: PropTypes.string,
	dragEnabled: PropTypes.bool
};

export const FolderTree = withLogPath(withErrorBoundary(FolderTreeInternal), 'FolderTree');

function getComponentClass(additionalClassName) {
	let className = 'folder-tree-component';

	if (additionalClassName) {
		className += ` ${additionalClassName}`;
	}

	return className;
}

/**
 * Delete item and sub-items recursively
 * @param items
 * @param itemId
 */
function deleteTreeItem(items, itemId) {
	const item = items[itemId];

	if (!item) {
		return;
	}

	delete items[itemId];

	item.children.forEach((child) => deleteTreeItem(items, child));
}
