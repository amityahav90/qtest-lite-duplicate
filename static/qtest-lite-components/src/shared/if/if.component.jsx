import PropTypes from 'prop-types';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';

function IfComponent(props) {
	if (props.value) {
		return props.children;
	}

	return '';
}

IfComponent.propTypes = {
	children: PropTypes.any.isRequired,
	value: PropTypes.bool.isRequired
};

export const If = withLogPath(withErrorBoundary(IfComponent), 'If');
