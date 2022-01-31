import { generateProjectTestCaseFolderData } from '../../../shared/generate-data-structure';
import { TREE_ITEM_ROOT_ID } from '../../../shared/constants';

export function generateProjectTestCaseFolders({ payload }) {
	const items = {
		[TREE_ITEM_ROOT_ID]: {
			id: TREE_ITEM_ROOT_ID,
			children: []
		}
	};

	if (payload) {
		generateTree(items, items[TREE_ITEM_ROOT_ID], payload);
	}

	return Object.keys(items).map((key) => items[key]);
}

function generateTree(map, parentItem, items = []) {
	items.forEach((item) => {
		const child = generateProjectTestCaseFolderData(undefined, item.name, item.count);

		map[child.id] = child;
		parentItem.children.push(generateTree(map, child, item.children));
	});

	return parentItem.id;
}
