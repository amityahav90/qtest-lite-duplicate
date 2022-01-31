import { withLogPath } from '../log-service';
import { withErrorBoundary } from '../error-boundary';
import { Editor } from '@atlaskit/editor-core';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import EditorTextStyleIcon from '@atlaskit/icon/glyph/editor/text-style';
import { B400, N500 } from '../design-styles';
import './rich-textbox.styles.scss';
import PropTypes from 'prop-types';
import { JIRATransformer } from '@atlaskit/editor-jira-transformer';

/**
 * @typedef {'comment' | 'full-page' | 'full-width' | 'chromeless' | 'mobile'} EditorAppearance
 */

const MIN_HEIGHT_DEFAULT = 40;
const MAX_HEIGHT_DEFAULT = 150;

function RichTextboxInternal(props) {
	const [editorAppearance, setEditorAppearance] = useState(/** @type EditorAppearance */ 'chromeless');
	const editor = useRef();

	useImperativeHandle(props.editorRef, () => ({
		getValue: () => {
			if (editor.current) {
				return getValue(editor.current);
			} else {
				return props.defaultValue;
			}
		}
	}));

	useEffect(() => {
		// When Rich textbox collapsed
		if (!props.active) {
			// Switch back to chromeless editor appearance if not chromeless.
			if (isCommentAppearance()) {
				handleToggleClick();
			}

			// Remove the focus from the element, otherwise in some cases the focus continues and
			// there was a problem expanding the Rich textbox again.
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		}
	}, [props.active]);

	function onActiveChange(value) {
		if (props.onActiveChange) {
			props.onActiveChange(value);
		}
	}

	function getMinHeight() {
		return props.minHeight !== undefined ? props.minHeight : MIN_HEIGHT_DEFAULT;
	}

	function getMaxHeight() {
		return props.maxHeight !== undefined ? props.maxHeight : MAX_HEIGHT_DEFAULT;
	}

	function editorMaxHeight() {
		let height = getMinHeight();

		if (props.noHeightLimit) {
			if (props.active || props.expanded) {
				return undefined;
			}
		}

		if (props.active) {
			if (editorAppearance === 'comment') {
				height = getMaxHeight() - 80;
			} else {
				height = getMaxHeight();
			}
		} else {
			if (props.expanded) {
				height = getMaxHeight();
			}
		}

		return height - 2;
	}

	function isCommentAppearance() {
		return editorAppearance === 'comment';
	}

	function handleToggleClick() {
		setEditorAppearance(isCommentAppearance() ? 'chromeless' : 'comment');
	}

	function handleComponentFocus() {
		onActiveChange(true);
	}

	function getComponentClass() {
		let className = 'rich-textbox-component';

		if (!isCommentAppearance()) {
			className += ' textbox-chromeless';

			if (!props.active) {
				className += ' textbox-collapsed';
			}
		}

		return className;
	}

	function getComponentStyle() {
		const styles = {};

		if (props.noHeightLimit) {
			return styles;
		}

		if (props.active) {
			if (editorAppearance === 'comment') {
				styles.height = `${getMaxHeight()}px`;
			} else {
				styles.height = `${getMaxHeight() - 2}px`;
			}
		} else {
			if (props.expanded) {
				styles.height = `${getMaxHeight() - 2}px`;
			}
		}

		return styles;
	}

	function editorOnReady({ editorView }) {
		editor.current = editorView;
	}

	function editorOnDestroy() {
		editor.current = undefined;
	}

	function getEditorView() {
		return (
			<Editor
				placeholder={props.editorPlaceholder}
				onEditorReady={editorOnReady}
				appearance={editorAppearance}
				allowTextColor={true}
				allowTables={true}
				allowRule={true}
				allowExpand={true}
				defaultValue={props.defaultValue}
				contentTransformerProvider={(schema) => new JIRATransformer(schema)}
				maxHeight={editorMaxHeight()}
				onDestroy={editorOnDestroy}
			/>
		);
	}

	function getToggleClassName() {
		let className = 'rich-textbox-toggle';

		if (isCommentAppearance()) {
			className += ' enabled';
		}

		return className;
	}

	function getToggleIconColor() {
		return isCommentAppearance() ? B400 : N500;
	}

	function getToggleView() {
		if (!props.active && !isCommentAppearance()) {
			return;
		}

		return (
			<div className={getToggleClassName()} onClick={handleToggleClick}>
				<EditorTextStyleIcon size="medium" primaryColor={getToggleIconColor()} />
			</div>
		);
	}

	return (
		<div className={getComponentClass()} style={getComponentStyle()} onFocus={handleComponentFocus}>
			{getEditorView()}
			{getToggleView()}
		</div>
	);
}

function getValue(editorView) {
	const { schema, doc } = editorView.state;

	return new JIRATransformer(schema).encode(doc);
}

RichTextboxInternal.propTypes = {
	minHeight: PropTypes.number,
	maxHeight: PropTypes.number,
	active: PropTypes.bool,
	expanded: PropTypes.bool,
	onActiveChange: PropTypes.func,
	defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	editorRef: PropTypes.any,
	editorPlaceholder: PropTypes.string,
	noHeightLimit: PropTypes.bool
};

export const RichTextbox = withLogPath(withErrorBoundary(RichTextboxInternal), 'RichTextbox');
