import React, { Fragment, useEffect, useState } from 'react';
import { useLogHook, withLogPath } from '../shared/log-service';
import { ExternalCommunicationService } from '../shared/external-communication';
import Avatar from '@atlaskit/avatar';
import moment from 'moment';
import Spinner from '@atlaskit/spinner';
import './issue-activity-history.styles.scss';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import DynamicTable from '@atlaskit/dynamic-table';
import i18n from '../shared/localization/i18n';
import { AppSettingsService } from '../../../../shared/app-settings-service';
import { RichTextboxView } from '../shared/rich-textbox-view';
import { camelToSentenceCase } from '../../../../shared/tools';

const externalCommunicationService = new ExternalCommunicationService();

function IssueActivityHistoryInternal() {
	const log = useLogHook();
	const [history, setHistory] = useState(undefined);
	const [error, setError] = useState(false);
	const head = {
		cells: [
			{
				key: 'step-description',
				content: 'Step Description'
			},
			{
				key: 'changed',
				content: 'Changed'
			},
			{
				key: 'original-value',
				content: 'Original Value'
			},
			{
				key: 'new-value',
				content: 'New Value'
			}
		]
	};
	const dateFormat = new AppSettingsService().getDateFormat();

	function getRelevantView(key, value) {
		if (key === 'attachments') {
			return value && value.map((item) => item.filename).join(', ');
		} else {
			return <RichTextboxView defaultValue={value.toString()} />;
		}
	}

	function readHistoryItemChangeColumn(key, stepDescription = '', changed, originalValue = '', newValue = '') {
		return {
			key,
			cells: [
				{ key: 'step-description', content: getRelevantView('', stepDescription) },
				{ key: 'changed', content: camelToSentenceCase(changed) },
				{ key: 'original-value', content: getRelevantView(changed, originalValue) },
				{ key: 'new-value', content: getRelevantView(changed, newValue) }
			]
		};
	}

	function readHistoryItemChange(change, index) {
		const changes = [];

		if (change.oldValue === undefined) {
			changes.push(
				readHistoryItemChangeColumn(`row-${index}-created`, change.newValue.summary || change.newValue.description, 'Created')
			);
		} else if (change.newValue === undefined) {
			changes.push(
				readHistoryItemChangeColumn(`row-${index}-deleted`, change.oldValue.summary || change.oldValue.description, 'Deleted')
			);
		} else {
			Object.keys(change.newValue).forEach((newValueKey) => {
				if (JSON.stringify(change.newValue[newValueKey]) !== JSON.stringify(change.oldValue[newValueKey])) {
					changes.push(
						readHistoryItemChangeColumn(
							`row-${index}-changed-${newValueKey.toLowerCase()}`,
							change.oldValue.description,
							newValueKey,
							change.oldValue[newValueKey],
							change.newValue[newValueKey]
						)
					);
				}
			});
		}

		return changes;
	}

	function readHistory(history) {
		return history.map((historyItem, index) => ({
			user: historyItem.user,
			type: historyItem.type,
			operation: historyItem.operation,
			date: historyItem.date,
			changes: historyItem.changes
				.map((change, changeIndex) => readHistoryItemChange(change, changeIndex))
				.reduce((arr, item) => {
					arr.push(...item);

					return arr;
				}, [])
		}));
	}

	useEffect(() => {
		externalCommunicationService
			.getIssueHistory()
			.then((history) => {
				setHistory(readHistory(history));
			})
			.catch((e) => {
				setError(true);
				log.error('Failed to retrieve Issue History', e);
			});
	}, []);

	if (error) {
		return <div>{i18n.t('ISSUE_ACTIVITY_HISTORY_OPERATION_FAILED')}</div>;
	}

	if (!history) {
		return (
			<div className="issue-activity-history-spinner">
				<Spinner size="xlarge" />
			</div>
		);
	}

	if (history.length === 0) {
		return i18n.t('ISSUE_ACTIVITY_HISTORY_NO_CHANGES');
	}

	return (
		<div className="issue-activity-history-container">
			{history.map((historyItem, index) => (
				<Fragment key={index}>
					<div className="history-item">
						<Avatar src={historyItem.user.avatarUrl} />
						<span className="history-item-ml5">
							<b>{historyItem.user.name}</b>
						</span>
						<span className="history-item-ml5">made changes on</span>
						<span className="history-item-ml5">{moment(historyItem.date).format(dateFormat)}</span>
					</div>
					<div className="history-item-changes">
						<DynamicTable head={head} rows={historyItem.changes} isFixedSize={true} />
					</div>
				</Fragment>
			))}
		</div>
	);
}

export const IssueActivityHistory = withLogPath(withErrorBoundaryRoot(IssueActivityHistoryInternal), 'IssueActivityHistory');
