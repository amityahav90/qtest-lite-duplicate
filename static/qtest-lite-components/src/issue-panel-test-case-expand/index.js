import React from 'react';
import ReactDOM from 'react-dom';
import { IssuePanelTestCaseExpand } from './issue-panel-test-case-expand.component';
import '@atlaskit/css-reset';
import { IntlProvider } from 'react-intl-next';

ReactDOM.render(
	<React.StrictMode>
		<IntlProvider locale="en">
			<IssuePanelTestCaseExpand />
		</IntlProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
