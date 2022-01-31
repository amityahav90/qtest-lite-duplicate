import React, { useEffect, useState } from 'react';
import './test-pad-execution.styles.scss';
import { withLogPath } from '../../../shared/log-service';
import { withErrorBoundary } from '../../../shared/error-boundary';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Button from '@atlaskit/button';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import { TestPadStepsExecution } from './test-pad-steps-execution';
import { TestPadDetails } from './test-pad-details';
import { TestPadRequirements } from './test-pad-requirements';
import { TestPadBugs } from './test-pad-bugs';
import JiraTestSessionIcon from '@atlaskit/icon/glyph/jira/test-session';
import { ExecutionStatusSelect } from '../../../shared/execution-status-select';
import * as PropTypes from 'prop-types';
import Spinner from '@atlaskit/spinner';
import { ExternalCommunicationService } from '../../../shared/external-communication';

function TestPadExecutionComponent(props) {
	const [loading, setLoading] = useState(true);
	const [issue, setIssue] = useState();
	const [steps, setSteps] = useState([]);

	useEffect(() => {
		(async () => {
			setLoading(true);

			if (props.issueId) {
				const externalCommunicationService = new ExternalCommunicationService();
				const issue = (props.issues || []).find((item) => item.id === props.issueId);

				if (issue) {
					const steps = (await externalCommunicationService.getIssueSteps(issue.id)) || [];

					setSteps(steps);
					setIssue(issue);
					setLoading(false);
				}
			}
		})();
	}, [props.issueId]);

	if (loading) {
		return (
			<div className="project-page-test-pad-component-loading">
				<Spinner size="large" />
			</div>
		);
	}

	return (
		<div className="test-pad-execution-component">
			<div className="execution-breadcrumb-modified">
				<Breadcrumbs>
					<BreadcrumbsItem text={props.projectName || 'Project name'} />
					<BreadcrumbsItem text="Test Execution" />
					<BreadcrumbsItem text="Test Pad" />
					<BreadcrumbsItem text={issue.key} />
				</Breadcrumbs>
			</div>
			<div className="execution-tabs">
				<Tabs shouldUnmountTabPanelOnChange={true} id="project-page-tabs">
					<div className="execution-tabs-header">
						<div className="header-title-container">
							<div className="header-logo">
								<div className="header-title qtest-text-h800">{issue.summary}</div>
								<ExecutionStatusSelect />
							</div>
							<div className="header-buttons">
								<Button className="header-try-qtest-enterprise" iconBefore={<JiraTestSessionIcon />}>
									Submit bug
								</Button>
							</div>
						</div>
						<div className="header-navigation-bar">
							<TabList>
								<Tab>STEPS EXECUTION</Tab>
								<Tab>TEST RUN DETAILS</Tab>
								<Tab>REQUIREMENTS</Tab>
								<Tab>BUGS</Tab>
							</TabList>
						</div>
					</div>
					<TabPanel>
						<TestPadStepsExecution steps={steps} />
					</TabPanel>
					<TabPanel>
						<TestPadDetails />
					</TabPanel>
					<TabPanel>
						<TestPadRequirements />
					</TabPanel>
					<TabPanel>
						<TestPadBugs />
					</TabPanel>
				</Tabs>
			</div>
		</div>
	);
}

TestPadExecutionComponent.propTypes = {
	projectName: PropTypes.string,
	issueId: PropTypes.string,
	issues: PropTypes.array
};

export const TestPadExecution = withLogPath(withErrorBoundary(TestPadExecutionComponent), 'TestPadExecution');
