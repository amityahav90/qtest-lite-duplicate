import React from 'react';
import renderer from 'react-test-renderer';
import { AdminPage } from './admin-page.component';

/**
 * Set of unit tests performed on the AdminPage component
 */
describe('Test AdminPage component', () => {
	let component;

	/**
	 * Runs before all tests are executed and prepare the testing environment.
	 */
	beforeAll(() => {
		jest.mock('@forge/bridge');
		component = renderer.create(<AdminPage />);
	});

	/**
	 * Snapshot test of the AdminPage component.
	 */
	test('App is rendered correctly', async () => {
		expect(component.toJSON()).toMatchSnapshot();
	});
});
