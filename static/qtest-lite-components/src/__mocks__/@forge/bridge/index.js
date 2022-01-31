import { BridgeServiceFunction } from '../../../../../../shared/enums';

function pipe(functionKey, payload) {
	return (...fns) =>
		fns.reduce((result, fn) => {
			if (!result) {
				result = fn(functionKey, payload);
			}

			return result;
		}, undefined);
}

function bridgeService(functionKey, payload) {
	switch (functionKey) {
		case BridgeServiceFunction.GET_ISSUE_STEPS:
			return [];
		case BridgeServiceFunction.SET_ISSUE_STEPS:
			return '';
		case BridgeServiceFunction.GET_ISSUE_HISTORY:
			return [
				{
					user: { id: '6180debaa9897aaa70c5701b', name: 'John Smith' },
					type: 'test-case',
					operation: 'update',
					date: '2021-11-29T09:33:30.654',
					changes: [
						{
							oldValue: { id: '23655ea1a07e34f7ab15ca', index: 3, description: 'Step Six', expectedResult: 'ER Six' },
							newValue: { id: '23655ea1a07e34f7ab15ca', index: 4, description: 'Step Six', expectedResult: 'ER Six' }
						},
						{
							oldValue: { id: 'fefb854b2917d0bbd4d2b4', index: 4, description: 'Step 4', expectedResult: 'ER 5' },
							newValue: { id: 'fefb854b2917d0bbd4d2b4', index: 5, description: 'Step 4', expectedResult: 'ER 5' }
						},
						{
							oldValue: { id: '6f3a93ea3976bd373f124e', index: 5, description: 'Step Seven', expectedResult: 'ER Seven (7)' },
							newValue: { id: '6f3a93ea3976bd373f124e', index: 3, description: 'Step Seven', expectedResult: 'ER Seven (7)' }
						}
					]
				}
			];
		default:
			return undefined;
	}
}

/**
 * Mocks the functionality of the 'invoke' method from '@forge/bridge' library.
 * @param functionKey: The key of the function to invoke.
 * @param payload: The payload sent to the invoke function.
 */
export function invoke(functionKey, payload) {
	return Promise.resolve(pipe(functionKey, payload)(bridgeService));
}
