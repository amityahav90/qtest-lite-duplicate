import React from 'react';
import { withLogPath } from '../shared/log-service';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import './issue-panel-test-run.styles.scss';

function IssuePanelTestRunInternal() {
	return (
		<div className="issue-panel-test-run">
			<h1>Test Run Issue Panel</h1>
		</div>
	);
}

export const IssuePanelTestRun = withLogPath(withErrorBoundaryRoot(IssuePanelTestRunInternal), 'IssuePanelTestRun');
