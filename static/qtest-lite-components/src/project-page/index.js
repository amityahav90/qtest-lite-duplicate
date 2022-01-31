import React from 'react';
import ReactDOM from 'react-dom';
import { ProjectPageRouter } from './project-page-router';
import '@atlaskit/css-reset';
import '../shared/common-styles/common-styles.scss';
import '../shared/design-styles/design-styles.typography.scss';
import { IntlProvider } from 'react-intl-next';

ReactDOM.render(
	<React.StrictMode>
		<IntlProvider locale="en">
			<ProjectPageRouter />
		</IntlProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
