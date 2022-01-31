import React from 'react';
import { ExternalCommunicationService } from './external-communication-service';

describe('Test ExternalCommunicationService', () => {
	let externalCommunicationService;

	beforeAll(() => {
		jest.mock('@forge/bridge');

		externalCommunicationService = new ExternalCommunicationService();
	});

	test('Is Singleton', async () => {
		expect(externalCommunicationService === new ExternalCommunicationService()).toBeTruthy();
	});
});
