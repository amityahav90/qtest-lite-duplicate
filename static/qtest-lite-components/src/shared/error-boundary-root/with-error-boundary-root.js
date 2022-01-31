import React from 'react';
import { LogContext } from '../log-service';
import { ErrorBoundaryRoot } from './error-boundary-root.component';

export function withErrorBoundaryRoot(WrappedComponent, fallbackRender) {
	function wrapped(props) {
		return (
			<LogContext.Consumer>
				{(value) => (
					<ErrorBoundaryRoot logPath={value} fallbackRender={fallbackRender}>
						<WrappedComponent {...props} />
					</ErrorBoundaryRoot>
				)}
			</LogContext.Consumer>
		);
	}

	return wrapped;
}
