import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';
import { Route, Router, Routes } from 'react-router';
import { withLogPath } from '../../shared/log-service';
import { withErrorBoundaryRoot } from '../../shared/error-boundary-root';
import { ProjectPage } from '../project-page.component';
import { ProjectPageTestPad } from '../project-page-test-pad';
import Spinner from '@atlaskit/spinner';

function ProjectPageRouterComponent() {
	const [history, setHistory] = useState(undefined);
	const [historyState, setHistoryState] = useState(undefined);

	useEffect(() => {
		view.createHistory().then((newHistory) => {
			setHistory(newHistory);
		});
	}, []);

	useEffect(() => {
		if (!historyState && history) {
			setHistoryState({
				action: history.action,
				location: history.location
			});
		}
	}, [history, historyState]);

	useEffect(() => {
		if (history) {
			history.listen((location, action) => {
				setHistoryState({
					action,
					location
				});
			});
		}
	}, [history]);

	function isLoaded() {
		return !!(history && historyState);
	}

	if (!isLoaded()) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
				<Spinner size="large" />
			</div>
		);
	}

	return (
		<Router navigator={history} navigationType={historyState.action} location={historyState.location}>
			<Routes>
				<Route path="/test-pad/:versionId/:cycleId" element={<ProjectPageTestPad />} />
				<Route path="/" element={<ProjectPage />} />
			</Routes>
		</Router>
	);
}

export const ProjectPageRouter = withLogPath(withErrorBoundaryRoot(ProjectPageRouterComponent), 'ProjectPageRouter');
