import React, { useState } from 'react';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import { SearchTextField } from '../search-text-field';
import PropTypes from 'prop-types';
import { If } from '../if';
import Button from '@atlaskit/button';
import SearchIcon from '@atlaskit/icon/glyph/search';
import './search-text-field-collapse.styles.scss';

function SearchTextFieldCollapseInternal(props) {
	const [value, setValue] = useState('');
	const [searchExpanded, setSearchExpanded] = useState(false);

	function handleOnChange(value) {
		setValue(value);
		props.onChange(value);
	}

	function isOpen() {
		return searchExpanded || !!value;
	}

	return (
		<div className="search-text-field-collapse">
			<If value={isOpen()}>
				<div className="search-field-element expanded">
					<SearchTextField
						onChange={handleOnChange}
						autoFocus={true}
						handleOnBlur={() => setSearchExpanded(false)}
						handleOnFocus={() => setSearchExpanded(true)}
					/>
				</div>
			</If>
			<If value={!isOpen()}>
				<div className="search-field-element collapsed">
					<Button
						onClick={() => setSearchExpanded(!searchExpanded)}
						appearance="default"
						iconBefore={<SearchIcon size="small" />}
					>
						Search
					</Button>
				</div>
			</If>
		</div>
	);
}

SearchTextFieldCollapseInternal.propTypes = {
	onChange: PropTypes.func.isRequired
};

export const SearchTextFieldCollapse = withLogPath(withErrorBoundary(SearchTextFieldCollapseInternal), 'SearchTextFieldCollapse');
