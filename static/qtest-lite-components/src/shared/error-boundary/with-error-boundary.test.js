import React from 'react';
import renderer from 'react-test-renderer';
import { withErrorBoundary } from './with-error-boundary';

describe('Test "withErrorBoundary" wrapper component', () => {
	beforeAll(() => {
		jest.mock('@forge/bridge');
	});

	test('Component rendered correctly', async () => {
		function TestComponent() {
			return <div>test</div>;
		}

		const TestComponentWithEB = withErrorBoundary(TestComponent);
		const component = renderer.create(<TestComponentWithEB />);

		expect(component.toJSON()).toMatchSnapshot();
	});

	test('"fallbackRender" functionality rendered correctly', async () => {
		function ThrowError() {
			throw new Error('fallbackRender functionality');
		}

		function FallbackRender() {
			return <div>fallbackRender functionality worked</div>;
		}

		const TestComponentWithEB = withErrorBoundary(ThrowError, () => <FallbackRender />);
		const component = renderer.create(<TestComponentWithEB />);

		expect(component.toJSON()).toMatchSnapshot();
	});
});
