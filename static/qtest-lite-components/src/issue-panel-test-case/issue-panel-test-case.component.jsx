import React, { useEffect, useState } from 'react';
import { useLogHook, withLogPath } from '../shared/log-service';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import { IssuePanelTestCaseContent } from './issue-panel-test-case-content';
import { view } from '@forge/bridge';
import { ExternalCommunicationService } from '../shared/external-communication';

function IssuePanelTestCaseInternal() {
	const log = useLogHook();
	const externalCommunicationService = new ExternalCommunicationService();

	const [steps, setSteps] = useState(undefined);
	const [precondition, setPrecondition] = useState(undefined);
	const [context, setContext] = useState({});
	const [loading, setLoading] = useState(true);
	const [refresh, setRefresh] = useState(0);

	const getStepsFromJira = () => {
		externalCommunicationService
			.getIssueSteps()
			.then((steps) => {
				setSteps(steps);
				setLoading(false);
			})
			.catch((e) => {
				log.error('Failed to get the issue steps list', e);
				setLoading(false);
			});
	};

	const getPreconditionFromJira = () => {
		externalCommunicationService
			.getIssuePrecondition()
			.then((precondition) => {
				if (precondition) {
					setPrecondition(precondition);
				}

				log.debug(`Successfully get the test precondition for Test Case [${context.issueKey}].`);
			})
			.catch((e) => {
				log.error(`Failed to get the precondition for Test Case [${context.issueKey}]`, e);
			});
	};

	const saveStepsInJira = (newSteps) => {
		externalCommunicationService
			.setIssueSteps(newSteps)
			.then(() => {
				log.debug(`Successfully saved the test steps of Test Case [${context.issueKey}].`);
			})
			.catch((e) => {
				log.error(`An error occurred while trying to save the test steps of Test Case [${context.issueKey}] in Jira.`, e);
			});
	};

	const savePreconditionInJira = (newPrecondition) => {
		externalCommunicationService
			.setIssuePrecondition(newPrecondition)
			.then(() => {
				log.debug(`Successfully saved the test precondition for Test Case [${context.issueKey}].`);
				setPrecondition(newPrecondition === '' ? undefined : newPrecondition);
				setRefresh(refresh + 1);
			})
			.catch((e) => {
				log.error(`An error occurred while trying to save the precondition for Test Case [${context.issueKey}] in Jira.`, e);
				setPrecondition(precondition);
				setRefresh(refresh + 1);
			});
	};

	useEffect(() => {
		view.getContext()
			.then((context) => {
				setContext({ issueKey: context.extension.issue.key });
			})
			.catch((e) => {
				log.error('Failed to fetch the view context of the current module.', e);
			});
	}, []);

	useEffect(() => {
		if (JSON.stringify(context) !== '{}') {
			getStepsFromJira();
			getPreconditionFromJira();
		}
	}, [context]);

	return (
		<IssuePanelTestCaseContent
			steps={steps}
			onStepsChange={(steps) => setSteps(steps)}
			precondition={precondition}
			onPreconditionChange={(precondition) => setPrecondition(precondition)}
			context={context}
			saveStepsInJira={(steps) => saveStepsInJira(steps)}
			savePreconditionInJira={(newPrecondition) => savePreconditionInJira(newPrecondition)}
			loading={loading}
			refresh={refresh}
		/>
	);
}

export const IssuePanelTestCase = withLogPath(withErrorBoundaryRoot(IssuePanelTestCaseInternal), 'IssuePanelTestCase');
