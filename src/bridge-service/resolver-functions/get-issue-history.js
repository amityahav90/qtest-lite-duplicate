import { IssuePropertyManager } from '../../shared/issue-property-manager';
import { getUserDateTimeZoneTransformer, getUsers } from './helpers';

export async function getIssueHistory(request) {
	const issuePropertyManager = new IssuePropertyManager(request.context.extension.issue.key);
	const history = await issuePropertyManager.getHistory();
	const userIds = [
		...history.reduce((userIdsInternal, historyItem) => {
			userIdsInternal.add(historyItem.userId);

			return userIdsInternal;
		}, new Set())
	];
	const users = await getUsers(userIds);
	const usersMap = users.reduce((usersMapInternal, user) => {
		usersMapInternal.set(user.accountId, user);

		return usersMapInternal;
	}, new Map());
	const transformUserDateTimeZone = await getUserDateTimeZoneTransformer();

	return history.reduce((historyInternal, historyItem) => {
		const user = usersMap.get(historyItem.userId);

		historyInternal.push({
			user: {
				id: user.accountId,
				name: user.displayName,
				avatarUrl: user.avatarUrls['48x48']
			},
			type: historyItem.type,
			operation: historyItem.operation,
			date: transformUserDateTimeZone(historyItem.date),
			changes: historyItem.changes
		});

		return historyInternal;
	}, []);
}
