import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import { TestExecutionNewCycleModal } from './test-execution-new-cycle-modal.component';
import '../shared/design-styles/design-styles.typography.scss';

ReactDOM.render(
	<React.StrictMode>
		<TestExecutionNewCycleModal />
	</React.StrictMode>,
	document.getElementById('root')
);
