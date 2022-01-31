import { IssueHistoryOperation, IssueHistoryType } from '../../../shared/enums';
import { IssuePropertyManager } from '../issue-property-manager';

export class IssueHistoryManager {
	constructor(userId, issueKey) {
		this.userId = userId;
		this.issueKey = issueKey;
	}

	async saveIssueTestCaseChanges(oldSteps, newSteps) {
		const changes = generateHistoryChanges(oldSteps, newSteps);

		if (changes.length === 0) {
			return;
		}

		await this.saveHistory({
			userId: this.userId,
			type: IssueHistoryType.TEST_CASE,
			operation: IssueHistoryOperation.UPDATE,
			date: new Date().toISOString(),
			changes: changes
		});
	}

	async saveIssuePreconditionChanges(oldPrecondition, newPrecondition) {
		const changes = generateHistoryChanges([{ precondition: oldPrecondition }], [{ precondition: newPrecondition }]);

		if (changes.length === 0) {
			return;
		}

		await this.saveHistory({
			userId: this.userId,
			type: IssueHistoryType.TEST_CASE,
			operation: IssueHistoryOperation.UPDATE,
			date: new Date().toISOString(),
			changes: changes
		});
	}

	async saveHistory(historyItem) {
		const issuePropertyManager = new IssuePropertyManager(this.issueKey);
		const history = await issuePropertyManager.getHistory();

		history.unshift(historyItem);

		await issuePropertyManager.setHistory(history);
	}
}

function generateHistoryChanges(oldValue = [], newValue = [], keyProperty = 'id') {
	const newValueMap = generateMapByKey(newValue, keyProperty);
	const historyChanges = [];

	oldValue.forEach((oldValueItem) => {
		const newValueItem = newValueMap.get(oldValueItem[keyProperty]);

		newValueMap.delete(oldValueItem[keyProperty]);

		if (!newValueItem) {
			// handle delete value
			historyChanges.push({
				oldValue: oldValueItem,
				newValue: undefined
			});
		} else if (!isObjectsEqual(oldValueItem, newValueItem)) {
			// handle update value
			historyChanges.push({
				oldValue: oldValueItem,
				newValue: newValueItem
			});
		}
	});

	if (newValueMap.size > 0) {
		// handle add value
		for (const [key, value] of newValueMap) {
			historyChanges.push({
				oldValue: undefined,
				newValue: value
			});
		}
	}

	return historyChanges;
}

function generateMapByKey(arr = [], keyProperty) {
	return arr.reduce((map, valueItem) => {
		map.set(valueItem[keyProperty], valueItem);

		return map;
	}, new Map());
}

function isObjectsEqual(objectOne, objectTwo) {
	const objectOneKeys = Object.keys(objectOne);
	const objectTwoKeys = Object.keys(objectTwo);

	return (
		objectOneKeys.length === objectTwoKeys.length &&
		objectOneKeys.every((key) => JSON.stringify(objectOne[key]) === JSON.stringify(objectTwo[key]))
	);
}
