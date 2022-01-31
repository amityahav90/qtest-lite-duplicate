import React from 'react';
import ReactDOM from 'react-dom';
import { IssueActivityHistory } from './issue-activity-history.component';
import '@atlaskit/css-reset';
import { IntlProvider } from 'react-intl-next';

ReactDOM.render(
	<React.StrictMode>
		<IntlProvider locale="en">
			<IssueActivityHistory />
		</IntlProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
