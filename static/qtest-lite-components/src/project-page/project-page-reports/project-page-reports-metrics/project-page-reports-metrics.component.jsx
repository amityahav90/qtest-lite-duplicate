import React from 'react';
import { withLogPath } from '../../../shared/log-service';
import { withErrorBoundary } from '../../../shared/error-boundary';
import './project-page-reports-metrics.styles.scss';

function ProjectPageReportsMetricsInternal() {
	return <div className="project-page-reports-metrics">Test Metrics</div>;
}

export const ProjectPageReportsMetrics = withLogPath(withErrorBoundary(ProjectPageReportsMetricsInternal), 'ProjectPageReportsMetrics');
