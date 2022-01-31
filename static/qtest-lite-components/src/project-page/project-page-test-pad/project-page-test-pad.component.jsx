import React, { useEffect, useState } from 'react';
import './project-page-test-pad.styles.scss';
import { withLogPath } from '../../shared/log-service';
import { withErrorBoundaryRoot } from '../../shared/error-boundary-root';
import { TestPadExecution } from './test-pad-execution';
import { SearchTextField } from '../../shared/search-text-field';
import Button from '@atlaskit/button';
import { CycleFolderIcon, TestPadIcon } from '../../assets/icons';
import { useScrollRef } from '../../shared/hooks';
import { N500 } from '../../shared/design-styles';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import Avatar from '@atlaskit/avatar';
import Spinner from '@atlaskit/spinner';
import { useNavigate, useParams } from 'react-router';
import { ExternalCommunicationService } from '../../shared/external-communication';
import { view } from '@forge/bridge';

function ProjectPageTestPadComponent() {
	const [issues, setIssues] = useState([]);
	const [selectedIssueId, setSelectedIssueId] = useState();
	const [loading, setLoading] = useState(true);
	const [cycleName, setCycleName] = useState('Cycle name');
	const [projectName, setProjectName] = useState('');
	const scrollRef = useScrollRef();
	const params = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const context = await view.getContext();

				setProjectName(context.extension.project.key);
			} catch (e) {
				setProjectName('Project name');
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			const externalCommunicationService = new ExternalCommunicationService();
			const cycles = (await externalCommunicationService.getProjectTestCycles(params.versionId)) || [];
			const cycle = cycles.find((item) => item.id === params.cycleId);

			if (cycle) {
				setCycleName(cycle.name);

				const { issues } = await externalCommunicationService.getTestRunIssues({
					start: 0,
					limit: 10,
					jqlOptions: { search: '', cycleId: params.cycleId }
				});

				if (issues.length > 0) {
					setSelectedIssueId(issues[0].id);
				}

				setIssues(issues || []);
			}

			setLoading(false);
		})();
	}, []);

	function renderBackButtonIcon() {
		return (
			<div className="left-back-icon">
				<ChevronDownIcon size="medium" />
			</div>
		);
	}

	function getTestRunClass(issue, index) {
		let className = 'left-test-run';

		if (issue.id === selectedIssueId) {
			className += ' selected';
		} else if (index + 1 < issues.length && issues[index + 1] && issues[index + 1].id === selectedIssueId) {
			className += ' preselected';
		}

		return className;
	}

	function selectIssue(issue) {
		setSelectedIssueId(issue.id);
	}

	function back() {
		navigate('/');
	}

	if (loading) {
		return (
			<div className="project-page-test-pad-component-loading">
				<Spinner size="large" />
			</div>
		);
	}

	return (
		<div className="project-page-test-pad-component">
			<div className="test-pad-left">
				<div className="left-back">
					<Button
						spacing="compact"
						className="left-back-btn"
						appearance="subtle-link"
						iconBefore={renderBackButtonIcon()}
						onClick={back}
					>
						Back
					</Button>
				</div>
				<div className="left-header">
					<TestPadIcon className="header-icon" />
					<span className="qtest-text-h500">TEST PAD</span>
				</div>
				<div className="left-search">
					<SearchTextField />
				</div>
				<div className="left-cycle">
					<Button spacing="none" appearance="subtle-link">
						<ChevronDownIcon label="" size="medium" primaryColor={N500} />
					</Button>
					<CycleFolderIcon className="cycle-icon" />
					<span className="cycle-name qtest-text-ellipsis qtest-text-h500" title="Cycle name">
						{cycleName}
					</span>
				</div>
				<div className="left-test-runs-scroll" ref={scrollRef}>
					<div className="test-runs-wrapper">
						<div className="test-runs">
							{issues.map((issue, index) => (
								<div key={issue.id} className={getTestRunClass(issue, index)} onClick={() => selectIssue(issue)}>
									<div className="test-run-content">
										<div className="run-status" />
										<div className="run-content-container">
											<div className="run-key-name">
												<div className="run-key qtest-text-h400">{issue.key}</div>
												<div className="run-name qtest-text-ellipsis">{issue.summary}</div>
											</div>
											<div className="run-user-priority">
												<div className="run-user">
													<Avatar size="small" src={issue.avatar} />
													<div className="user-label qtest-text-ellipsis">{issue.assignee}</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="test-pad-right">
				<TestPadExecution issueId={selectedIssueId} issues={issues} projectName={projectName} />
			</div>
		</div>
	);
}

export const ProjectPageTestPad = withLogPath(withErrorBoundaryRoot(ProjectPageTestPadComponent), 'ProjectPageTestPad');
