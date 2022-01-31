import React, { useRef } from 'react';
import './search-text-field.styles.scss';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import TextField from '@atlaskit/textfield';
import SearchIcon from '@atlaskit/icon/glyph/search';
import { N200 } from '../../shared/design-styles';
import PropTypes from 'prop-types';
import { useDelayAction } from '../hooks';

function SearchTextFieldInternal({
	textFieldRef,
	className,
	placeholder = 'Search',
	isCompact = true,
	autoFocus = false,
	defaultValue,
	onChange,
	delayTime,
	delayActive,
	handleOnBlur,
	handleOnFocus
}) {
	const inputRef = useRef();
	const [delaySearch] = useDelayAction(delayActive, delayTime);

	function getRef() {
		return textFieldRef || inputRef;
	}

	function getClassName() {
		return `search-input ${className ? className : ''}`;
	}

	function onInputChange(evt) {
		const value = evt.target.value;

		delaySearch({
			fn: () => {
				onChange(value);
			}
		});
	}

	return (
		<div className="search-text-field-component">
			<TextField
				ref={getRef()}
				placeholder={placeholder}
				className={getClassName()}
				isCompact={isCompact}
				autoFocus={autoFocus}
				defaultValue={defaultValue}
				onChange={onInputChange}
				onBlur={handleOnBlur}
				onFocus={handleOnFocus}
			/>
			<div className="search-icon">
				<SearchIcon size="small" primaryColor={N200} />
			</div>
		</div>
	);
}

SearchTextFieldInternal.propTypes = {
	textFieldRef: PropTypes.exact({ current: PropTypes.any }),
	placeholder: PropTypes.any,
	className: PropTypes.string,
	isCompact: PropTypes.bool,
	autoFocus: PropTypes.bool,
	defaultValue: PropTypes.any,
	onChange: PropTypes.func,
	delayTime: PropTypes.number,
	delayActive: PropTypes.bool,
	handleOnBlur: PropTypes.func,
	handleOnFocus: PropTypes.func
};

SearchTextFieldInternal.defaultProps = {};

export const SearchTextField = withLogPath(withErrorBoundary(SearchTextFieldInternal), 'SearchTextField');
