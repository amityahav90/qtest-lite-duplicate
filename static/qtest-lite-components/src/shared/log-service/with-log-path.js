import React from 'react';
import { LogContext } from './log-context';

export function withLogPath(WrappedComponent, path) {
	function wrapped(props) {
		return (
			<LogContext.Consumer>
				{(value) => (
					<LogContext.Provider value={value ? `${value}/${path}` : path}>
						<WrappedComponent {...props} />
					</LogContext.Provider>
				)}
			</LogContext.Consumer>
		);
	}

	return wrapped;
}
