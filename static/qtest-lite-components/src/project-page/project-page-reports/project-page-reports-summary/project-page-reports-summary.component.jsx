import React, { useState } from 'react';
import { withLogPath } from '../../../shared/log-service';
import { withErrorBoundary } from '../../../shared/error-boundary';
import './project-page-reports-summary.styles.scss';
import { N500 } from '../../../shared/design-styles';
import FilterIcon from '@atlaskit/icon/glyph/filter';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import Button from '@atlaskit/button';
import Popup from '@atlaskit/popup';
import { TestExecutionChart, TestCreationChart } from '../../../assets/icons';

function ProjectPageReportsSummaryInternal() {
	const [assignedToOpen, setAssignedToOpen] = useState(false);
	const [priorityOpen, setPriorityOpen] = useState(false);
	const [createdOnOpen, setCratedOnOpen] = useState(false);
	const [coverageOpen, setCoverageOpen] = useState(false);
	const [componentOpen, setComponentOpen] = useState(false);
	const [versionOpen, setVersionOpen] = useState(false);
	const [testCreationOpen, setTestCreationOpen] = useState(false);
	const [testExecutionOpen, setTestExecutionOpen] = useState(false);

	function renderContent() {
		return (
			<div className="popup-content">
				<div className="popup-content-options">
					<div className="popup-content-option">Option 1</div>
					<div className="popup-content-option">Option 2</div>
					<div className="popup-content-option">Option 3</div>
				</div>
			</div>
		);
	}

	return (
		<div className="project-page-reports-summary">
			<div className="project-page-reports-summary-filters">
				<div className="summary-filters-left">
					<div className="summary-filters-left-header">
						<FilterIcon className="summary-filters-left-header-icon" primaryColor={N500} size="medium" />
						<div className="summary-filters-left-header-text">Filters</div>
					</div>
					<div className="summary-filters-left-dropdowns">
						<div className="summary-filters-left-dropdown assigned-to">
							<Popup
								className="summary-filters-popup"
								isOpen={assignedToOpen}
								onClose={() => setAssignedToOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setAssignedToOpen(!assignedToOpen)}
									>
										Assigned to: All
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
						<div className="summary-filters-left-dropdown priority">
							<Popup
								className="summary-filters-popup"
								isOpen={priorityOpen}
								onClose={() => setPriorityOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setPriorityOpen(!priorityOpen)}
									>
										Priority: All
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
						<div className="summary-filters-left-dropdown created-on">
							<Popup
								className="summary-filters-popup"
								isOpen={createdOnOpen}
								onClose={() => setCratedOnOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setCratedOnOpen(!createdOnOpen)}
									>
										Created on: All
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
						<div className="summary-filters-left-dropdown coverage">
							<Popup
								className="summary-filters-popup"
								isOpen={coverageOpen}
								onClose={() => setCoverageOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setCoverageOpen(!coverageOpen)}
									>
										Coverage: All
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
						<div className="summary-filters-left-dropdown component">
							<Popup
								className="summary-filters-popup"
								isOpen={componentOpen}
								onClose={() => setComponentOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setComponentOpen(!componentOpen)}
									>
										Component: All
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
						<div className="summary-filters-left-dropdown version">
							<Popup
								className="summary-filters-popup"
								isOpen={versionOpen}
								onClose={() => setVersionOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setVersionOpen(!versionOpen)}
									>
										Version: All
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
					</div>
				</div>
				<div className="summary-filters-right">
					<div className="summary-filters-right-add-filter">
						<Button appearance="default" iconAfter={<ChevronDownIcon size="small" />}>
							Add filter
						</Button>
					</div>
					<div className="summary-filters-right-save-filter">
						<Button appearance="link">Save filter</Button>
					</div>
				</div>
			</div>
			<div className="project-page-reports-summary-statistics">
				<div className="project-page-reports-summary-statistics-item total-tests">
					<div className="summary-statistics-item">
						<div className="summary-statistics-item-count total-tests">65</div>
						<div className="summary-statistics-item-label">TOTAL TESTS</div>
					</div>
				</div>
				<div className="project-page-reports-summary-statistics-item total-unexecuted">
					<div className="summary-statistics-item">
						<div className="summary-statistics-item-count total-unexecuted">5</div>
						<div className="summary-statistics-item-label">TOTAL UNEXECUTED</div>
					</div>
				</div>
				<div className="project-page-reports-summary-statistics-item total-executed">
					<div className="summary-statistics-item">
						<div className="summary-statistics-item-count total-executed">60</div>
						<div className="summary-statistics-item-label">TOTAL EXECUTED</div>
					</div>
				</div>
			</div>
			<div className="project-page-reports-summary-charts">
				<div className="project-page-reports-summary-chart">
					<div className="summary-chart-header">
						<div className="summary-chart-header-title">Test creation</div>
						<div className="summary-chart-header-filter">
							<Popup
								className="summary-filters-popup"
								isOpen={testCreationOpen}
								onClose={() => setTestCreationOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setTestCreationOpen(!testCreationOpen)}
									>
										Last 30 days
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
					</div>
					<div className="summary-chart-content">
						<div className="summary-chart-content-chart">
							<TestCreationChart />
						</div>
					</div>
					<div className="summary-chart-footer">
						<div className="summary-chart-footer-text">
							<span className="summary-chart-footer-text-tests-count">345</span> tests were covered over the last 30 days
						</div>
					</div>
				</div>
				<div className="project-page-reports-summary-chart">
					<div className="summary-chart-header">
						<div className="summary-chart-header-title">Test execution</div>
						<div className="summary-chart-header-filter">
							<Popup
								className="summary-filters-popup"
								isOpen={testExecutionOpen}
								onClose={() => setTestExecutionOpen(false)}
								placement="bottom-start"
								trigger={(triggerProps) => (
									<Button
										{...triggerProps}
										appearance="subtle"
										iconAfter={<ChevronDownIcon size="small" />}
										onClick={() => setTestExecutionOpen(!testExecutionOpen)}
									>
										Last 30 days
									</Button>
								)}
								content={() => renderContent()}
							/>
						</div>
					</div>
					<div className="summary-chart-content">
						<div className="summary-chart-content-chart">
							<TestExecutionChart />
						</div>
					</div>
					<div className="summary-chart-footer">
						<div className="summary-chart-footer-text">
							<span className="summary-chart-footer-text-tests-count">814</span> tests were executed over the last 30 days
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export const ProjectPageReportsSummary = withLogPath(withErrorBoundary(ProjectPageReportsSummaryInternal), 'ProjectPageReportsSummary');
