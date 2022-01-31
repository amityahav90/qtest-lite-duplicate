import React from 'react';
import { withLogPath } from '../shared/log-service';
import { withErrorBoundary } from '../shared/error-boundary';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import Button from '@atlaskit/button';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import './project-page.styles.scss';
import { ProjectPageTestDesign } from './project-page-test-design';
import { ProjectPageTestExecution } from './project-page-test-execution';
import { ProjectPageReports } from './project-page-reports';
import { QTestLiteIcon } from '../assets/icons';
import { router } from '@forge/bridge';

function ProjectPageInternal() {
	async function tryQTestEnterprise() {
		await router.open('https://www.tricentis.com/software-testing-tool-trial-demo/qtest-trial/');
	}

	return (
		<div className="qtest-lite-project-page-container">
			<Tabs shouldUnmountTabPanelOnChange={true} id="project-page-tabs">
				<div className="qtest-lite-project-page-header">
					<div className="header-title-container">
						<div className="header-logo">
							<QTestLiteIcon className="header-icon" />
							<div className="header-title qtest-text-h800">qTest Lite</div>
						</div>
						<div className="header-buttons">
							<Button className="header-try-qtest-enterprise" appearance="primary" onClick={() => tryQTestEnterprise()}>
								Try qTest Enterprise
							</Button>
							<Button className="header-settings-button" appearance="default">
								<SettingsIcon size="medium" />
							</Button>
						</div>
					</div>
					<div className="header-navigation-bar">
						<TabList>
							<Tab>TEST DESIGN</Tab>
							<Tab>TEST EXECUTION</Tab>
							<Tab>REPORTS</Tab>
						</TabList>
					</div>
				</div>
				<TabPanel>
					<ProjectPageTestDesign />
				</TabPanel>
				<TabPanel>
					<ProjectPageTestExecution />
				</TabPanel>
				<TabPanel>
					<ProjectPageReports />
				</TabPanel>
			</Tabs>
		</div>
	);
}

export const ProjectPage = withLogPath(withErrorBoundary(ProjectPageInternal), 'ProjectPage');
