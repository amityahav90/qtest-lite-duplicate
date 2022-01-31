import React, { Fragment } from 'react';
import './rich-textbox-view.styles.scss';
import PropTypes from 'prop-types';
import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import { Editor } from '@atlaskit/editor-core';
import { JIRATransformer } from '@atlaskit/editor-jira-transformer';

function RichTextboxViewInternal(props) {
	function getEditorView() {
		return (
			<Fragment key={props.defaultValue}>
				<Editor
					appearance="chromeless"
					allowTextColor={true}
					allowTables={true}
					allowRule={true}
					allowExpand={true}
					defaultValue={props.defaultValue}
					contentTransformerProvider={(schema) => new JIRATransformer(schema)}
					disabled="true"
				/>
			</Fragment>
		);
	}

	return <div className="rich-textbox-view-component">{getEditorView()}</div>;
}

RichTextboxViewInternal.propTypes = {
	defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export const RichTextboxView = withLogPath(withErrorBoundary(RichTextboxViewInternal), 'RichTextboxView');
