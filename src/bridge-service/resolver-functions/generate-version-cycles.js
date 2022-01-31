import { generateVersionCycleData } from '../../../shared/generate-data-structure';
import { TREE_ITEM_ROOT_ID } from '../../../shared/constants';

export function generateVersionCycles({ payload }) {
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
		const child = generateVersionCycleData(undefined, item.name, item.description, item.startDate, item.endDate);

		map[child.id] = child;
		parentItem.children.push(generateTree(map, child, item.children));
	});

	return parentItem.id;
}
