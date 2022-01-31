import React from 'react';
import './test-pad-details.styles.scss';
import { withLogPath } from '../../../../shared/log-service';
import { withErrorBoundary } from '../../../../shared/error-boundary';

function TestPadDetailsComponent() {
	return 'Test Run details';
}

export const TestPadDetails = withLogPath(withErrorBoundary(TestPadDetailsComponent), 'TestPadDetails');
