import React from 'react';
import ReactDOM from 'react-dom';
import { IssuePanelTestCase } from './issue-panel-test-case.component';
import '@atlaskit/css-reset';
import { IntlProvider } from 'react-intl-next';

ReactDOM.render(
	<React.StrictMode>
		<IntlProvider locale="en">
			<IssuePanelTestCase />
		</IntlProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
