import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { IssueActivityHistory } from './issue-activity-history.component';
import { ExternalCommunicationService } from '../shared/external-communication';

describe('Test IssueActivityHistory component', () => {
	beforeAll(() => {
		jest.mock('@forge/bridge');
	});

	test('Component rendered correctly', async () => {
		let component;

		await act(async () => {
			component = renderer.create(<IssueActivityHistory />);
		});

		expect(component.toJSON()).toMatchSnapshot();
	});

	test('Component rendered no changes message correctly', async () => {
		let component;

		const spy = jest.spyOn(ExternalCommunicationService.prototype, 'getIssueHistory').mockImplementation(() => Promise.resolve([]));

		await act(async () => {
			component = renderer.create(<IssueActivityHistory />);
		});

		expect(component.toJSON()).toMatchSnapshot();
		spy.mockRestore();
	});

	test('Component rendered error message correctly', async () => {
		let component;

		const spy = jest.spyOn(ExternalCommunicationService.prototype, 'getIssueHistory').mockImplementation(() => Promise.reject());

		await act(async () => {
			component = renderer.create(<IssueActivityHistory />);
		});

		expect(component.toJSON()).toMatchSnapshot();
		spy.mockRestore();
	});
});
