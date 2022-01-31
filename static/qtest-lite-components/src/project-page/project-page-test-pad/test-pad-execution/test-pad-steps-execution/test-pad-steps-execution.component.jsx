import React, { useState } from 'react';
import './test-pad-steps-execution.styles.scss';
import { withLogPath } from '../../../../shared/log-service';
import { withErrorBoundary } from '../../../../shared/error-boundary';
import { Checkbox } from '@atlaskit/checkbox';
import { RichTextbox } from '../../../../shared/rich-textbox';
import Button from '@atlaskit/button';
import { useScrollRef } from '../../../../shared/hooks';
import { RichTextboxView } from '../../../../shared/rich-textbox-view';
import JiraTestSessionIcon from '@atlaskit/icon/glyph/jira/test-session';
import MediaServicesAddCommentIcon from '@atlaskit/icon/glyph/media-services/add-comment';
import AttachmentIcon from '@atlaskit/icon/glyph/attachment';
import { ExecutionStatusSelect } from '../../../../shared/execution-status-select';
import * as PropTypes from 'prop-types';

function TestPadStepsExecutionComponent(props) {
	const [activeStepId, setActiveStepId] = useState();
	const scrollRef = useScrollRef();

	function isStepActive(step) {
		return step.id === activeStepId;
	}

	function onActiveStepChange(step, value) {
		if (value) {
			setActiveStepId(step.id);
		}
	}

	return (
		<div className="test-pad-steps-execution-component">
			<div className="steps-execution-header">
				<div className="header-container">
					<div className="header-checkbox">
						<Checkbox />
					</div>
					<div className="header-description">Step description</div>
					<div className="header-expected">Expected result</div>
					<div className="header-actual">Actual result</div>
				</div>
			</div>
			<div className="steps-execution-body" ref={scrollRef}>
				{props.steps.map((step) => (
					<div key={step.id} className="step-container">
						<div className="step-checkbox">
							<Checkbox />
							<div className="step-order-splitter" />
							<div className="step-order qtest-text-h500">{step.index}</div>
						</div>
						<div className="step-description">
							<div className="step-rich-textbox-view">
								<RichTextboxView defaultValue={step.description} />
							</div>
						</div>
						<div className="step-expected">
							<div className="step-rich-textbox-view">
								<RichTextboxView defaultValue={step.expectedResult} />
							</div>
						</div>
						<div className="step-actual">
							<RichTextbox
								active={isStepActive(step)}
								onActiveChange={(value) => onActiveStepChange(step, value)}
								expanded={true}
								noHeightLimit={true}
								defaultValue={step.actualResult}
								editorPlaceholder="Type actual result"
							/>
							<div className="step-actual-actions">
								<div className="actual-actions">
									<div className="action-wrapper">
										<Button className="action-btn" iconBefore={<JiraTestSessionIcon />} />
									</div>
									<div className="action-wrapper">
										<Button className="action-btn" iconBefore={<MediaServicesAddCommentIcon />} />
									</div>
									<div className="action-wrapper actual-actions-attachments">
										<Button className="action-btn" iconBefore={<AttachmentIcon />} />
									</div>
								</div>
								<div className="actual-status">
									<ExecutionStatusSelect />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

TestPadStepsExecutionComponent.propTypes = {
	steps: PropTypes.array
};

export const TestPadStepsExecution = withLogPath(withErrorBoundary(TestPadStepsExecutionComponent), 'TestPadStepsExecution');
