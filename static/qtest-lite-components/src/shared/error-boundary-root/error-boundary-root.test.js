import React from 'react';
import renderer from 'react-test-renderer';
import { ErrorBoundaryRoot } from './error-boundary-root.component';

describe('Test ErrorBoundaryRoot component', () => {
	beforeAll(() => {
		jest.mock('@forge/bridge');
	});

	test('Component rendered correctly', async () => {
		const component = renderer.create(
			<ErrorBoundaryRoot logPath="test">
				<div>test</div>
			</ErrorBoundaryRoot>
		);

		expect(component.toJSON()).toMatchSnapshot();
	});

	test('"fallbackRender" functionality rendered correctly', async () => {
		function ThrowError() {
			throw new Error('fallbackRender functionality');
		}

		function FallbackRender() {
			return <div>fallbackRender functionality worked</div>;
		}

		const component = renderer.create(
			<ErrorBoundaryRoot logPath="test" fallbackRender={() => <FallbackRender />}>
				<ThrowError />
			</ErrorBoundaryRoot>
		);

		expect(component.toJSON()).toMatchSnapshot();
	});
});
