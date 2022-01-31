import React, { useEffect, useState } from 'react';
import { useLogHook, withLogPath } from '../shared/log-service';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import { requestJira, view } from '@forge/bridge';
import Button from '@atlaskit/button';
import { DZFileUpload } from '../shared/components/dropzone-file-upload';
import './issue-attachments-modal.styles.scss';
import Spinner from '@atlaskit/spinner';
import i18n from '../shared/localization/i18n';
import { generateIssueTestStepAttachmentData } from '../../../../shared/generate-data-structure';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { ExternalCommunicationService } from '../shared/external-communication';

function IssueAttachmentsModalInternal() {
	const log = useLogHook();
	const externalCommunicationService = new ExternalCommunicationService();

	const [displayErrorMsg, setDisplayErrorMsg] = useState(false);
	const [issueKey, setIssueKey] = useState(undefined);
	const [stepIndex, setStepIndex] = useState(-1);
	const [attachments, setAttachments] = useState([]);
	const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
	const [loading, setLoading] = useState(false);
	const [initializing, setInitializing] = useState(true);
	const [sizeLimit, setSizeLimit] = useState(0);
	const [existingAttachments, setExistingAttachments] = useState([]);

	async function onSave() {
		const uploadedAttachments = await uploadAttachmentsToJira();
		const deletedAttachments = await deleteAttachmentsFromJira();

		view.close({
			uploadedAttachments: uploadedAttachments,
			deletedAttachments: deletedAttachments
		});
	}

	function onCancel() {
		view.close();
	}

	async function uploadAttachmentsToJira() {
		if (attachments === null || attachments === undefined || attachments === []) {
			log.debug('There are no attachments to save.');
			return [];
		}

		setLoading(true);

		const form = new FormData();

		attachments.forEach((attachment) => {
			if (!attachment.uploaded) {
				form.append('file', attachment.file, attachment.name);
			}
		});

		if (form.entries().next().done) {
			log.debug(`No attachments to upload for step [${stepIndex}]`);
			return [];
		}

		try {
			const response = await requestJira(`/rest/api/3/issue/${issueKey}/attachments`, {
				method: 'POST',
				body: form,
				headers: {
					Accept: 'application/json',
					'X-Atlassian-Token': 'no-check'
				}
			});

			const resJson = await response.json();

			setLoading(false);

			return resJson.map((att) => generateIssueTestStepAttachmentData(att.id, att.filename, att.size, att.mimeType));
		} catch (e) {
			log.error(`An error occurred while trying to upload the attachment of step number [${stepIndex}].`, e);
			setLoading(false);
			return [];
		}
	}

	async function deleteAttachmentsFromJira() {
		if (attachmentsToDelete === null || attachmentsToDelete === undefined || attachmentsToDelete === []) {
			log.debug('There are no attachments to delete.');
			return [];
		}

		const deleted = [];

		for (const attachment of attachmentsToDelete) {
			try {
				const response = await externalCommunicationService.deleteStepAttachment(attachment.id);

				if (response.isOk) {
					log.debug(`Successfully deleted attachment [${attachment.id}]`);
					deleted.push(attachment.id);
				} else {
					log.debug(`Attachment [${attachment.id}] was not deleted [status: ${response.status}]`);
				}
			} catch (e) {
				log.error(`Failed to delete attachment [${attachment.id}]`, e);
			}
		}

		return deleted;
	}

	function onDeleteAttachment(attachment) {
		const tempAttachmentsToDelete = [...attachmentsToDelete];
		tempAttachmentsToDelete.push(attachment);
		setAttachmentsToDelete(tempAttachmentsToDelete);
	}

	function formatBytes(bytes, decimals = 2) {
		if (bytes === 0) {
			return '0';
		}

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	useEffect(() => {
		view.getContext()
			.then((context) => {
				setIssueKey(context.extension.modal.issueKey);
				setStepIndex(context.extension.modal.stepIndex);

				const stepAttachments = context.extension.modal.existingAttachments;

				if (stepAttachments) {
					setExistingAttachments(stepAttachments);
				}
			})
			.catch((e) => {
				log.error('Failed to get the context of the issue attachments modal.', e);
			})
			.finally(() => {
				setInitializing(false);
			});
	}, []);

	if (initializing) {
		return (
			<div className="issue-attachments-modal">
				<div className="iam-spinner">
					<Spinner size="xlarge" />
				</div>
			</div>
		);
	}

	return (
		<div className={`issue-attachments-modal ${loading ? 'attachment-modal-disabled' : ''}`}>
			<div className="iam-header">
				<div className="iam-header-text">{i18n.t('ISSUE_ATTACHMENTS_MODAL_HEADER_TXT')}</div>
			</div>
			<div className="iam-content">
				<DZFileUpload
					setAttachments={(attachments) => setAttachments(attachments)}
					setErrorMsg={(value) => setDisplayErrorMsg(value)}
					sizeLimit={(value) => setSizeLimit(value)}
					existingAttachments={existingAttachments}
					onDeleteAttachment={(value) => onDeleteAttachment(value)}
				/>
			</div>
			<div className="iam-footer">
				<div className={`iam-footer-error ${displayErrorMsg ? 'enable' : ''}`}>
					<div className="iam-error-icon">
						<ErrorIcon primaryColor="#DE350B" />
					</div>
					<div className="iam-error-content">
						<div className="iam-error-header">{i18n.t('ISSUE_ATTACHMENT_MODAL_ERROR_HEADER')}</div>
						<div className="iam-error-message">
							{i18n.t('ISSUE_ATTACHMENT_MODAL_ERROR_MESSAGE', { value: formatBytes(sizeLimit) })}
						</div>
					</div>
				</div>
				<div className="iam-footer-buttons">
					<div className="iam-footer-button">
						<Button appearance="subtle" onClick={() => onCancel()}>
							{i18n.t('ISSUE_ATTACHMENTS_MODAL_CANCEL_BTN')}
						</Button>
					</div>
					<div className="iam-footer-button">
						<Button
							appearance="primary"
							isDisabled={(attachments.length === 0 && attachmentsToDelete.length === 0) || displayErrorMsg}
							onClick={() => onSave()}
						>
							{i18n.t('ISSUE_ATTACHMENTS_MODAL_UPLOAD_BTN')}
						</Button>
					</div>
				</div>
			</div>
			{loading && (
				<div className="iam-spinner">
					<Spinner size="xlarge" />
				</div>
			)}
		</div>
	);
}

export const IssueAttachmentsModal = withLogPath(withErrorBoundaryRoot(IssueAttachmentsModalInternal), 'IssueAttachmentsModal');
