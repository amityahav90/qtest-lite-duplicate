import React from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from '../error-boundary';

export class ErrorBoundaryRoot extends ErrorBoundary {
	constructor(props) {
		super(props);

		this.boundWindowErrorFn = this.handleWindowError.bind(this);
		this.boundWindowUEFn = this.handleWindowUnhandledException.bind(this);
	}

	componentDidMount() {
		window.addEventListener('error', this.boundWindowErrorFn);
		window.addEventListener('unhandledrejection', this.boundWindowUEFn);
	}

	componentWillUnmount() {
		window.removeEventListener('error', this.boundWindowErrorFn);
		window.removeEventListener('unhandledrejection', this.boundWindowUEFn);
	}

	handleWindowError(e) {
		const error = e ? (e.error ? e.error.stack : e.error) : e;

		this.log.error('Unhandled exception', error);

		// Prevent log error to console
		e.preventDefault();
	}

	handleWindowUnhandledException(e) {
		const error = e ? (e.reason ? e.reason.stack : e.reason) : e;

		this.log.error('Unhandled promise rejection', error);

		// Prevent log error to console
		e.preventDefault();
	}
}

ErrorBoundaryRoot.propTypes = {
	children: PropTypes.any.isRequired,
	logPath: PropTypes.string.isRequired,
	fallbackRender: PropTypes.func
};
