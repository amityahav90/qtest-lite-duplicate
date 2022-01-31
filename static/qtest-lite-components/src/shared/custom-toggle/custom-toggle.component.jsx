import React, { useEffect, useState } from 'react';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import PropTypes from 'prop-types';
import './custom-toggle.styles.scss';

function CustomToggleInternal(props) {
	const [selectedOption, setSelectedOption] = useState(undefined);

	useEffect(() => {
		setSelectedOption(props.options[0].value);
	}, []);

	useEffect(() => {
		props.onChange(selectedOption);
	}, [selectedOption]);

	return (
		<div className="custom-toggle">
			{props.options.map((option, i) => (
				<div key={`${option.value}-${i}`} className="custom-toggle-option-wrapper" onClick={() => setSelectedOption(option.value)}>
					<div className={`custom-toggle-option ${selectedOption === option.value ? 'selected' : ''}`}>
						<div className="option-text">{option.name}</div>
					</div>
				</div>
			))}
		</div>
	);
}

CustomToggleInternal.propTypes = {
	options: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired
};

export const CustomToggle = withLogPath(withErrorBoundary(CustomToggleInternal), 'CustomToggle');
