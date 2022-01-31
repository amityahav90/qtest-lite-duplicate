import React from 'react';
import renderer from 'react-test-renderer';
import { ErrorBoundary } from './error-boundary.component';

describe('Test ErrorBoundary component', () => {
	beforeAll(() => {
		jest.mock('@forge/bridge');
	});

	test('Component rendered correctly', async () => {
		const component = renderer.create(
			<ErrorBoundary logPath="test">
				<div>test</div>
			</ErrorBoundary>
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
			<ErrorBoundary logPath="test" fallbackRender={() => <FallbackRender />}>
				<ThrowError />
			</ErrorBoundary>
		);

		expect(component.toJSON()).toMatchSnapshot();
	});
});
