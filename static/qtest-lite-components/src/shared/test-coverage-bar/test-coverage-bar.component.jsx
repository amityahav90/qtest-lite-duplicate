import React, { useEffect, useState } from 'react';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import * as PropTypes from 'prop-types';
import './test-coverage-bar.styles.scss';

function TestCoverageBarInternal(props) {
	const [totalItems, setTotalItems] = useState(0);

	useEffect(() => {
		setTotalItems(calculateTotalItems());
	}, []);

	function calculateTotalItems() {
		let total = 0;

		(Object.values(props.statuses) || []).forEach((item) => {
			total += item;
		});

		return total;
	}

	function getStatusPercentage(status = 0) {
		const total = totalItems > 0 ? totalItems : calculateTotalItems();

		return (100 * status) / total;
	}

	function getPercentageAsInteger(value = 0) {
		return (value / 100).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 0 });
	}

	function getDisplayValue(status) {
		return getPercentageAsInteger(getStatusPercentage(status));
	}

	function calculateTotalExecuted(value) {
		const displayValue = getDisplayValue(value);
		const percentage = displayValue.split('%')[0];

		return `${100 - +percentage}%`;
	}

	return (
		<div className="test-coverage-bar">
			{JSON.stringify(props.statuses) !== '{}' ? (
				<div className="test-coverage-bar-graph">
					<div className="test-coverage-bar-status passed" style={{ width: `${getDisplayValue(props.statuses.passed)}` }}>
						{props.displayCount && <div className="status-tests-count">{props.statuses.passed}</div>}
					</div>
					<div className="test-coverage-bar-status failed" style={{ width: `${getDisplayValue(props.statuses.failed)}` }}>
						{props.displayCount && <div className="status-tests-count">{props.statuses.failed}</div>}
					</div>
					<div className="test-coverage-bar-status blocked" style={{ width: `${getDisplayValue(props.statuses.blocked)}` }}>
						{props.displayCount && <div className="status-tests-count">{props.statuses.blocked}</div>}
					</div>
					<div className="test-coverage-bar-status unexecuted" style={{ width: `${getDisplayValue(props.statuses.unexecuted)}` }}>
						{props.displayCount && <div className="status-tests-count">{props.statuses.unexecuted}</div>}
					</div>
				</div>
			) : (
				<div className="test-coverage-bar-graph" />
			)}
			<div className="test-coverage-bar-percentage">
				{JSON.stringify(props.statuses) !== '{}' ? calculateTotalExecuted(props.statuses.unexecuted) : '0%'}
			</div>
		</div>
	);
}

TestCoverageBarInternal.propTypes = {
	statuses: PropTypes.exact({
		passed: PropTypes.number,
		failed: PropTypes.number,
		blocked: PropTypes.number,
		unexecuted: PropTypes.number
	}),
	displayCount: PropTypes.bool
};

export const TestCoverageBar = withLogPath(withErrorBoundary(TestCoverageBarInternal), 'TestCoverageBar');
