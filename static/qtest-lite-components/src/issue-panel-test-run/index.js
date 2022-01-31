import React from 'react';
import ReactDOM from 'react-dom';
import { IssuePanelTestRun } from './issue-panel-test-run.component';
import '@atlaskit/css-reset';
import { IntlProvider } from 'react-intl-next';

ReactDOM.render(
	<React.StrictMode>
		<IntlProvider locale="en">
			<IssuePanelTestRun />
		</IntlProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
