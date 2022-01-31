import React, { useState } from 'react';
import { withLogPath } from '../../shared/log-service';
import { withErrorBoundary } from '../../shared/error-boundary';
import './project-page-reports.styles.scss';
import { N90 } from '../../shared/design-styles';
import MediaServicesPresentationIcon from '@atlaskit/icon/glyph/media-services/presentation';
import { ProjectPageReportsSummary } from './project-page-reports-summary';
import { ProjectPageReportsMetrics } from './project-page-reports-metrics';
import { ProjectPageReportsMatrix } from './project-page-reports-matrix';

function ProjectPageReportsInternal() {
	const reportsOptions = [
		{
			name: 'Test Summary',
			value: 'summary'
		},
		{
			name: 'Test Metrics',
			value: 'metrics'
		},
		{
			name: 'Traceability Matrix',
			value: 'matrix'
		}
	];

	const [selectedOption, setSelectedOption] = useState(reportsOptions[0].value);

	function renderReportOption() {
		switch (selectedOption) {
			case 'summary':
				return <ProjectPageReportsSummary />;
			case 'metrics':
				return <ProjectPageReportsMetrics />;
			case 'matrix':
				return <ProjectPageReportsMatrix />;
			default:
				return <ProjectPageReportsSummary />;
		}
	}

	return (
		<div className="qtest-lite-project-page-reports">
			<div className="reports-left-container">
				<div className="reports-left-container-section header">
					<div className="reports-left-container-section-title-wrapper">
						<MediaServicesPresentationIcon
							className="reports-left-container-section-title-icon"
							primaryColor={N90}
							size="medium"
						/>
						<div className="reports-left-container-section-title-text">ANALYTICS</div>
					</div>
				</div>
				<div className="reports-left-container-section menu">
					<div className="reports-left-container-section-menu-wrapper">
						{reportsOptions.map((option, i) => (
							<div
								key={i}
								className={`reports-left-container-section-menu-item ${selectedOption === option.value ? 'selected' : ''}`}
								onClick={() => setSelectedOption(option.value)}
							>
								<div className="reports-left-container-section-menu-item-name">{option.name}</div>
								<div className="selected-item-right-border" />
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="reports-right-container">{renderReportOption()}</div>
		</div>
	);
}

export const ProjectPageReports = withLogPath(withErrorBoundary(ProjectPageReportsInternal), 'ProjectPageReports');
