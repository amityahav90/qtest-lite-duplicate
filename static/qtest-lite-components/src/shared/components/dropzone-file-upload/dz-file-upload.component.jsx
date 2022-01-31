import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadIcon from '@atlaskit/icon/glyph/upload';
import { withLogPath } from '../../log-service';
import { withErrorBoundary } from '../../error-boundary';
import PropTypes from 'prop-types';
import './dz-file-upload.styles.scss';
import 'react-dropzone/examples/theme.css';
import Audio48Icon from '@atlaskit/icon-file-type/glyph/audio/48';
import ExcelSpreadsheet48Icon from '@atlaskit/icon-file-type/glyph/excel-spreadsheet/48';
import PdfDocument48Icon from '@atlaskit/icon-file-type/glyph/pdf-document/48';
import PowerpointPresentation48Icon from '@atlaskit/icon-file-type/glyph/powerpoint-presentation/48';
import WordDocument48Icon from '@atlaskit/icon-file-type/glyph/word-document/48';
import Video48Icon from '@atlaskit/icon-file-type/glyph/video/48';
import Archive48Icon from '@atlaskit/icon-file-type/glyph/archive/48';
import Generic48Icon from '@atlaskit/icon-file-type/glyph/generic/48';
import EditorRemoveIcon from '@atlaskit/icon/glyph/editor/remove';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import Button from '@atlaskit/button';
import { ExternalCommunicationService } from '../../external-communication';
import { generateGuid22 } from '../../../../../../shared/tools';

function DZFileUploadInternal(props) {
	const externalCommunicationService = new ExternalCommunicationService();

	const [files, setFiles] = useState([]);
	const [fileSizeLimit, setFileSizeLimit] = useState(-1);
	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (newFiles) => {
			const newFilesObjs = newFiles.map((file) => {
				const filePreview = URL.createObjectURL(file);

				const attachmentFile = {
					id: generateGuid22(),
					name: file.name,
					preview: filePreview,
					downloadLink: filePreview,
					file: file,
					uploaded: false,
					mimeType: file.type
				};

				if (file.size > fileSizeLimit) {
					attachmentFile.exceeded = true;
					props.setErrorMsg(true);
				}

				return attachmentFile;
			});

			newFilesObjs.push(...files);

			setFiles(newFilesObjs);
		}
	});

	function getFileIcon(file) {
		if (!file.mimeType) {
			return <Generic48Icon />;
		}

		const splitType = file.mimeType.split('/');
		const mainType = splitType[0];
		const subType = splitType[1];

		if (mainType === 'application') {
			if (subType.includes('vnd.openxmlformats-officedocument.presentationml') || subType.includes('vnd.ms-powerpoint')) {
				return <PowerpointPresentation48Icon />;
			} else if (subType.includes('vnd.openxmlformats-officedocument.spreadsheetml') || subType.includes('vnd.ms-excel')) {
				return <ExcelSpreadsheet48Icon />;
			} else if (subType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document') || subType.includes('msword')) {
				return <WordDocument48Icon />;
			} else if (subType.includes('pdf')) {
				return <PdfDocument48Icon />;
			} else if (subType.includes('x-zip-compressed') || subType.includes('x-rar-compressed') || subType.includes('zip')) {
				return <Archive48Icon />;
			} else {
				return <Generic48Icon />;
			}
		} else if (mainType === 'video') {
			return <Video48Icon />;
		} else if (mainType === 'image') {
			return <img src={file.preview} className="dz-image" />;
		} else if (mainType === 'audio') {
			return <Audio48Icon />;
		} else {
			return <Generic48Icon />;
		}
	}

	function removeAttachment(file) {
		if (file.uploaded) {
			props.onDeleteAttachment(file);
		}

		const index = files.findIndex((f) => {
			return f.id === file.id;
		});

		const tempFiles = [...files];

		tempFiles.splice(index, 1);
		setFiles(tempFiles);

		checkAttachmentsErrors(tempFiles);
	}

	function downloadAttachment(file) {
		externalCommunicationService.openUrl(file.downloadLink);
	}

	function checkAttachmentsErrors(_files) {
		const index = _files.findIndex((file) => file.exceeded);

		if (index === -1) {
			props.setErrorMsg(false);
		}
	}

	const thumbs = files.map((file) => (
		<div className={`thumb ${file.exceeded ? 'exceeded' : ''}`} key={file.id}>
			<div className="thumb-inner">
				<div className="dz-button-wrapper remove">
					<Button
						className="dz-button"
						appearance="subtle"
						onClick={(e) => {
							removeAttachment(file);
							e.stopPropagation();
						}}
					>
						<EditorRemoveIcon primaryColor="#C1C7D0" />
					</Button>
				</div>
				{file.uploaded && (
					<div className="dz-button-wrapper download">
						<Button
							className="dz-button"
							appearance="subtle"
							onClick={(e) => {
								downloadAttachment(file);
								e.stopPropagation();
							}}
						>
							<DownloadIcon primaryColor="#C1C7D0" size="small" />
						</Button>
					</div>
				)}
				<div className="dz-file">{getFileIcon(file)}</div>
				<div className="dz-image-name">{file.name}</div>
			</div>
		</div>
	));

	useEffect(() => {
		setFiles(
			props.existingAttachments.map((attachment) => {
				return {
					id: attachment.id,
					name: attachment.filename,
					preview: `/jira/secure/thumbnail/${attachment.id}/${attachment.filename}`,
					downloadLink: `/rest/api/3/attachment/content/${attachment.id}`,
					uploaded: true,
					mimeType: attachment.mimeType
				};
			})
		);

		async function getFileSizeLimit() {
			const limit = await externalCommunicationService.getAttachmentFileSizeLimit();
			setFileSizeLimit(limit);
		}

		getFileSizeLimit();
	}, []);

	useEffect(() => {
		// Make sure to revoke the data uris to avoid memory leaks
		files.forEach((file) => {
			if (!file.uploaded) {
				URL.revokeObjectURL(file.preview);
			}
		});

		props.setAttachments(files);
		props.sizeLimit(fileSizeLimit);
	}, [files]);

	return (
		<section className="container dz-container">
			<div {...getRootProps({ className: 'dropzone' })}>
				<div className="dropzone-header">
					<input {...getInputProps()} />
					<p>
						<span className="dz-upload-icon">
							<UploadIcon />
						</span>{' '}
						Drop files to attach, or <span className="dz-upload-icon-text">browse.</span>
					</p>
				</div>
				<div className="dropzone-content">
					<aside className="thumbs-container">{thumbs}</aside>
				</div>
			</div>
		</section>
	);
}

DZFileUploadInternal.propTypes = {
	setAttachments: PropTypes.func.isRequired,
	setErrorMsg: PropTypes.func.isRequired,
	sizeLimit: PropTypes.func.isRequired,
	existingAttachments: PropTypes.array,
	onDeleteAttachment: PropTypes.func.isRequired
};

export const DZFileUpload = withLogPath(withErrorBoundary(DZFileUploadInternal), 'DZFileUpload');
