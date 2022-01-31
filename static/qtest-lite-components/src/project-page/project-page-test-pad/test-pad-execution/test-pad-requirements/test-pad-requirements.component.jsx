import React from 'react';
import './test-pad-requirements.styles.scss';
import { withLogPath } from '../../../../shared/log-service';
import { withErrorBoundary } from '../../../../shared/error-boundary';

function TestPadRequirementsComponent() {
	return 'Requirements';
}

export const TestPadRequirements = withLogPath(withErrorBoundary(TestPadRequirementsComponent), 'TestPadRequirements');
