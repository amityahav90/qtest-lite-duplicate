import React from 'react';
import PropTypes from 'prop-types';
import { CustomUiLogService } from '../log-service';

export class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { error: false };
		this.log = new CustomUiLogService(props.logPath);
	}

	static getDerivedStateFromError() {
		return { error: true };
	}

	componentDidCatch(error, info) {
		this.log.error(error.message, info.componentStack);
		this.setState({ error: true });
	}

	reset() {
		this.setState({ error: false });
	}

	render() {
		const { error } = this.state;
		const { fallbackRender } = this.props;

		if (error) {
			if (fallbackRender) {
				return fallbackRender(this.props, () => {
					this.reset();
				});
			}
		}

		return this.props.children;
	}
}

ErrorBoundary.propTypes = {
	children: PropTypes.any.isRequired,
	logPath: PropTypes.string.isRequired,
	fallbackRender: PropTypes.func
};
