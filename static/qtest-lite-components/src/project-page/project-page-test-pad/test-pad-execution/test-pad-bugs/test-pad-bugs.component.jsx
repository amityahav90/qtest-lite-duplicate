import React from 'react';
import './test-pad-bugs.styles.scss';
import { withLogPath } from '../../../../shared/log-service';
import { withErrorBoundary } from '../../../../shared/error-boundary';

function TestPadBugsComponent() {
	return 'Bugs';
}

export const TestPadBugs = withLogPath(withErrorBoundary(TestPadBugsComponent), 'TestPadBugs');
