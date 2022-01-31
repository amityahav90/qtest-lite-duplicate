import React, { createRef, useEffect, useRef, useState } from 'react';
import { useLogHook, withLogPath } from '../shared/log-service';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import Button from '@atlaskit/button';
import './issue-panel-test-case-expand.styles.scss';
import { IssuePanelTestCaseContent } from '../issue-panel-test-case/issue-panel-test-case-content';
import { view } from '@forge/bridge';
import { ExternalCommunicationService } from '../shared/external-communication';
import Spinner from '@atlaskit/spinner';
import i18n from '../shared/localization/i18n';
import { useRefState } from '../shared/hooks';

function IssuePanelTestCaseExpandInternal() {
	const log = useLogHook();
	const externalCommunicationService = new ExternalCommunicationService();

	const [steps, setSteps] = useState(undefined);
	const [initialStepsState, setInitialStepsState] = useState('');
	const [initialPreconditionState, setInitialPreconditionState] = useState('');
	const [precondition, setPrecondition] = useState(undefined);
	const [context, setContext] = useState({});
	const [loading, setLoading] = useState(false);
	const [disabledContent, setDisabledContent] = useState(false);
	const [initialized, setInitialized] = useState(false);
	const initializedRef = useRef(initialized);
	const initRef = createRef();
	const [contentHeight, setContentHeight] = useRefState(0);
	const [windowHeight, setWindowHeight] = useRefState(0);
	const contentRef = useRef();

	const setInitializedRef = (value) => {
		initializedRef.current = value;
		setInitialized(value);
	};

	const getModalContext = () => {
		view.getContext()
			.then((context) => {
				setSteps(context.extension.modal.steps);
				setInitialStepsState(JSON.stringify(context.extension.modal.steps));

				setPrecondition(context.extension.modal.precondition);
				setInitialPreconditionState(JSON.stringify(context.extension.modal.precondition));

				setContext(context.extension.modal.context);
				setLoading(context.extension.modal.loading);
			})
			.catch((e) => {
				log.error('Failed to get the context of the Test Case expand steps modal.', e);
			});
	};

	const getMaxWindowHeight = () => {
		let initialWindowWidth = window.innerWidth;

		const checkWindowHeight = () => {
			let height = 200;
			let found = false;

			function completed() {
				// 150 is the height of the header & footer together. 48 is the required height to subtract to hide the scroll
				setContentHeight(height - 198);
				setInitializedRef(true);

				getModalContext();

				setWindowHeight(window.outerHeight);
			}

			function handleResize() {
				if (initialWindowWidth === 0) {
					if (window.innerWidth !== 0) {
						initialWindowWidth = window.innerWidth;
					}

					return;
				}

				if (window.innerWidth === initialWindowWidth) {
					if (found) {
						initRef.current.style.height = ``;
						window.removeEventListener('resize', handleResize);
						completed();
					} else {
						height += 10;
						initRef.current.style.height = `${height}px`;
					}
				} else {
					initRef.current.style.height = `${--height}px`;
					found = true;
				}
			}

			window.addEventListener('resize', handleResize);

			handleResize();
		};

		checkWindowHeight();
	};

	useEffect(() => {
		const handleWindowLoad = () => {
			getMaxWindowHeight();
		};
		const handleWindowResize = (e) => {
			if (initializedRef.current) {
				const currentWindowHeight = windowHeight.current;

				if (currentWindowHeight !== window.outerHeight) {
					setWindowHeight(window.outerHeight);
					setContentHeight(contentHeight.current + (window.outerHeight - currentWindowHeight));
				}
			}
		};

		window.addEventListener('load', handleWindowLoad);
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('load', handleWindowLoad);
			window.removeEventListener('resize', handleWindowResize);
		};
	}, []);

	const saveStepsInJira = () => {
		const promise = externalCommunicationService.setIssueSteps(steps);

		promise
			.then(() => {
				log.debug(`Successfully saved the test steps of Test Case [${context.issueKey}] from the expanded modal.`);
				setInitialStepsState(JSON.stringify(steps));
			})
			.catch((e) => {
				log.error(
					`An error occurred while trying to save the test steps of Test Case [${context.issueKey}] in Jira from the expanded modal.`,
					e
				);
			});

		return promise;
	};

	const savePreconditionInJira = () => {
		const promise = externalCommunicationService.setIssuePrecondition(precondition || '');

		promise
			.then(() => {
				log.debug(`Successfully saved the test precondition for Test Case [${context.issueKey}] from the expanded modal.`);
				setInitialPreconditionState(precondition);
			})
			.catch((e) => {
				log.error(
					`An error occurred while trying to save the precondition for Test Case [${context.issueKey}] in Jira from the expanded modal.`,
					e
				);
			});

		return promise;
	};

	const onCancel = () => {
		view.close();
	};

	const onSave = () => {
		setDisabledContent(true);

		const promises = [];
		const finishFn = () => {
			// Closing the modal and passing the new Steps & Precondition values back to the IssuePanelTestCaseContent component
			view.close({
				steps: steps,
				precondition: precondition
			});
		};

		if (JSON.stringify(steps) !== initialStepsState) {
			promises.push(saveStepsInJira());
		}

		if (JSON.stringify(precondition) !== initialPreconditionState) {
			promises.push(savePreconditionInJira());
		}

		if (promises.length > 0) {
			Promise.allSettled(promises)
				.then(() => {
					finishFn();
				})
				.catch(() => {
					setDisabledContent(false);
				});
		} else {
			finishFn();
		}
	};

	function onSaveTrigger() {
		contentRef.current.deactivateEdit();
	}

	if (!initialized) {
		return (
			<div className="initial-modal-loading" ref={initRef}>
				<Spinner size="large" />
			</div>
		);
	}

	return (
		<div className={`issue-panel-test-case-expand ${disabledContent ? 'tc-modal-disabled' : ''}`}>
			<div className="iptc-expand-header">
				<div className="iptc-expand-header-content">{i18n.t('ISSUE_PANEL_TEST_CASE_EXPAND_HEADER_TXT')}</div>
			</div>
			<div className="iptc-expand-content" style={{ height: `${contentHeight.current}px` }}>
				<IssuePanelTestCaseContent
					steps={steps}
					onStepsChange={(steps) => setSteps(steps)}
					precondition={precondition}
					onPreconditionChange={(precondition) => setPrecondition(precondition)}
					context={context}
					saveStepsInJira={() => {}}
					savePreconditionInJira={() => {}}
					loading={loading}
					isModal={true}
					contentRef={contentRef}
					onDeactivateEdit={onSave}
					refresh={0}
				/>
			</div>
			<div className="iptc-expand-footer">
				<div className="iptc-expand-footer-content">
					<div className="iptc-cancel-btn">
						<Button appearance="subtle-link" onClick={() => onCancel()}>
							{i18n.t('ISSUE_PANEL_TEST_CASE_EXPAND_CANCEL_BTN')}
						</Button>
					</div>
					<div className="iptc-save-btn">
						<Button className="new-step-btn" appearance="primary" onClick={() => onSaveTrigger()}>
							{i18n.t('ISSUE_PANEL_TEST_CASE_EXPAND_SAVE_BTN')}
						</Button>
					</div>
				</div>
			</div>
			{disabledContent && (
				<div className="iptc-expand-spinner">
					<Spinner size="xlarge" />
				</div>
			)}
		</div>
	);
}

export const IssuePanelTestCaseExpand = withLogPath(withErrorBoundaryRoot(IssuePanelTestCaseExpandInternal), 'IssuePanelTestCaseExpand');
