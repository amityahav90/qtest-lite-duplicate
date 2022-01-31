import React from 'react';
import { withLogPath } from '../../../shared/log-service';
import { withErrorBoundary } from '../../../shared/error-boundary';
import './project-page-reports-matrix.styles.scss';

function ProjectPageReportsMatrixInternal() {
	return <div className="project-page-reports-matrix">Traceability Matrix</div>;
}

export const ProjectPageReportsMatrix = withLogPath(withErrorBoundary(ProjectPageReportsMatrixInternal), 'ProjectPageReportsMatrix');
