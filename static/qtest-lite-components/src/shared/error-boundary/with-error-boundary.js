import React from 'react';
import { LogContext } from '../log-service';
import { ErrorBoundary } from './error-boundary.component';

export function withErrorBoundary(WrappedComponent, fallbackRender) {
	function wrapped(props) {
		return (
			<LogContext.Consumer>
				{(value) => (
					<ErrorBoundary logPath={value} fallbackRender={fallbackRender}>
						<WrappedComponent {...props} />
					</ErrorBoundary>
				)}
			</LogContext.Consumer>
		);
	}

	return wrapped;
}
