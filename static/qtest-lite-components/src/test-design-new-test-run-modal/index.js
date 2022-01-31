import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import { TestDesignNewTestRunModal } from './test-design-new-test-run-modal.component';
import '../shared/design-styles/design-styles.typography.scss';

ReactDOM.render(
	<React.StrictMode>
		<TestDesignNewTestRunModal />
	</React.StrictMode>,
	document.getElementById('root')
);
