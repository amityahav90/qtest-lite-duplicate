import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button';
import './admin-page.styles.scss';
import { useLogHook, withLogPath } from '../shared/log-service';
import i18n from '../shared/localization/i18n';
import { withErrorBoundaryRoot } from '../shared/error-boundary-root';
import { ExternalCommunicationService } from '../shared/external-communication';
import Spinner from '@atlaskit/spinner';

function AdminPageInternal() {
	const log = useLogHook();
	const [appInitialized, setAppInitialized] = useState(false);
	const externalCommunicationService = new ExternalCommunicationService();
	const [initializationDisabled, setInitializationDisabled] = useState(false);
	const [internalVersion, setInternalVersion] = useState('');

	useEffect(() => {
		externalCommunicationService
			.getInternalSettings()
			.then((internalSettings) => {
				setAppInitialized(internalSettings.initializedApp);
			})
			.catch((e) => {});

		externalCommunicationService
			.getApplicationInternalVersion()
			.then((version) => {
				setInternalVersion(version);
			})
			.catch((e) => {});
	}, []);

	const initializeApp = () => {
		setInitializationDisabled(true);

		log.debug('Initializing the storage service.');

		// Calling the app initialization function
		externalCommunicationService
			.initializeApp()
			.then(() => {
				log.info('App initialization has finished successfully.');
				setAppInitialized(true);
			})
			.catch((e) => {
				log.error('Failed to complete the app initialization' + e);
			});
	};

	const resetInitializedApp = () => {
		externalCommunicationService
			.resetInitializeApp()
			.then(() => {
				log.debug('App initialized flag was reset successfully');
				setAppInitialized(false);
				setInitializationDisabled(false);
			})
			.catch((e) => {
				log.error('Failed to reset the app initialization flag.', e);
			});
	};

	return (
		<div className="admin-page">
			<div className="admin-page-actions">
				{internalVersion && (
					<div className="admin-page-internal-version">{internalVersion}</div>
				)}
				<div className="admin-page-initialize">
					{!appInitialized ? (
						<div className="app-not-initialized">
							<Button
								id="initialize-app-btn"
								appearance="primary"
								isDisabled={initializationDisabled}
								onClick={() => initializeApp()}
							>
								{i18n.t('ADMIN_PAGE_INITIALIZE_APP_BTN')}
							</Button>
							{initializationDisabled && (
								<div className="initializing-app-spinner">
									<Spinner size="large" />
								</div>
							)}
						</div>
					) : (
						<div className="app-initialized">
							<div className="app-initialized-txt">App is already initialized.</div>
							<Button id="reset-btn" appearance="primary" onClick={() => resetInitializedApp()}>
								Reset
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export const AdminPage = withLogPath(withErrorBoundaryRoot(AdminPageInternal), 'AdminPage');
