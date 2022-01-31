import React, { useEffect, useState } from 'react';
import './table-columns-popup-menu.styles.scss';
import { withLogPath } from '../../../../shared/log-service';
import { withErrorBoundary } from '../../../../shared/error-boundary';
import Button from '@atlaskit/button';
import TableIcon from '@atlaskit/icon/glyph/table';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import { Popup } from '@atlaskit/popup';
import PropTypes from 'prop-types';
import { Checkbox } from '@atlaskit/checkbox';
import i18n from '../../../../shared/localization/i18n';

const columnsMap = {
	priority: 'Priority',
	id: 'ID',
	summary: 'Name',
	creator: 'Created by',
	created: 'Created on',
	assignee: 'Assigned to',
	updated: 'Modified on'
};

function TableColumnsPopupMenuComponent(props) {
	const [isOpen, setIsOpen] = useState(false);
	const [columns, changed, setColumns] = useColumnsState();

	useEffect(() => {
		if (!props.items) {
			return;
		}

		setColumns(readItems(props.items), true);
	}, [props.items]);

	function popupOnClose() {
		setIsOpen(false);
	}

	function handleItemChange(column) {
		column.enabled = !column.enabled;

		setColumns([...columns]);
	}

	function restoreDefaults() {
		setColumns(readItems(props.defaultItems));
	}

	function readItems(items) {
		return Object.keys(items).reduce((arr, key) => {
			const name = columnsMap[key];

			if (name) {
				arr.push({ key, enabled: items[key], name });
			}

			return arr;
		}, []);
	}

	function writeItems() {
		return columns.reduce((obj, item) => {
			obj[item.key] = item.enabled;

			return obj;
		}, {});
	}

	function handleCancel() {
		setIsOpen(false);
	}

	function renderContent() {
		return (
			<div className="table-columns-popup-menu-content">
				<div className="popup-menu-items">
					<div className="items-restore-defaults">
						<Button appearance="link" spacing="none" onClick={restoreDefaults}>
							{i18n.t('TABLE_COLUMNS_POPUP_MENU_COMPONENT_RESTORE_DEFAULTS')}
						</Button>
					</div>
					{columns.map((column) => (
						<div key={column.key} className="items-item">
							<Checkbox isChecked={column.enabled} label={column.name} onChange={() => handleItemChange(column)} />
						</div>
					))}
					<div className="items-space" />
				</div>
				<div className="popup-menu-actions">
					<Button appearance="subtle-link" onClick={handleCancel}>
						{i18n.t('TABLE_COLUMNS_POPUP_MENU_COMPONENT_CANCEL')}
					</Button>
					<Button appearance="primary" onClick={handleDone} isDisabled={!changed}>
						{i18n.t('TABLE_COLUMNS_POPUP_MENU_COMPONENT_DONE')}
					</Button>
				</div>
			</div>
		);
	}

	function triggerOnClick() {
		setIsOpen(!isOpen);
	}

	function renderTrigger(triggerProps) {
		return (
			<Button
				className="table-columns-popup-menu-trigger"
				spacing="none"
				{...triggerProps}
				isSelected={isOpen}
				onClick={triggerOnClick}
				isDisabled={!props.items}
			>
				<div className="menu-trigger-container">
					<TableIcon />
					<div className="trigger-splitter" />
					<ChevronDownIcon />
				</div>
			</Button>
		);
	}

	function handleDone() {
		setIsOpen(false);

		if (props.onDone) {
			props.onDone(writeItems());
		}
	}

	return <Popup isOpen={isOpen} onClose={popupOnClose} placement="bottom-end" content={renderContent} trigger={renderTrigger} />;
}

function useColumnsState() {
	const [columns, setColumns] = useState([]);
	const [changedCache, setChangedCache] = useState('');
	const [changed, setChanged] = useState(false);

	function getChangedCache(items) {
		return items.reduce((str, item) => {
			if (item.enabled) {
				str += item.key;
			}

			return str;
		}, '');
	}

	return [
		columns,
		changed,
		function (items, init = false) {
			setColumns(items);

			if (init) {
				setChangedCache(getChangedCache(items));
				setChanged(false);
			} else {
				setChanged(changedCache !== getChangedCache(items));
			}
		}
	];
}

TableColumnsPopupMenuComponent.propTypes = {
	items: PropTypes.object,
	defaultItems: PropTypes.object.isRequired,
	onDone: PropTypes.func
};

export const TableColumnsPopupMenu = withLogPath(withErrorBoundary(TableColumnsPopupMenuComponent), 'TableColumnsPopupMenu');
