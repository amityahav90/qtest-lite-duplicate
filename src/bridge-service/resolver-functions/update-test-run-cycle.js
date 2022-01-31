import { LogService } from '../../../shared/log-service';
import { ForgeApiManager } from '../../shared/forge-api-manager';
import { getTestCyclesLinkMap } from './get-test-cycles-link-map';
import { setTestCyclesLinkMap } from './set-test-cycles-link-map';

export async function updateTestRunCycle(request) {
	const log = new LogService('updateTestRunCycle');
	const {
		payload: { testRun, cycle, cycleFieldKey }
	} = request;
	const testCyclesLinkMap = await getTestCyclesLinkMap(request);

	try {
		const responseStatus = await ForgeApiManager.updateIssueCustomField(cycleFieldKey, testRun.id, cycle);

		if (testRun.cycleId && testCyclesLinkMap[testRun.cycleId]) {
			testCyclesLinkMap[testRun.cycleId] = testCyclesLinkMap[testRun.cycleId].filter((testRunId) => testRunId !== testRun.id);
		}

		if (cycle) {
			if (testCyclesLinkMap[cycle.id]) {
				if (testCyclesLinkMap[cycle.id].indexOf(testRun.id) === -1) {
					testCyclesLinkMap[cycle.id].push(testRun.id);
				}
			} else {
				testCyclesLinkMap[cycle.id] = [testRun.id];
			}
		}

		await setTestCyclesLinkMap({ context: request.context, payload: testCyclesLinkMap });

		return responseStatus === 204;
	} catch (e) {
		log.error(`Failed to set cycle [${(cycle && cycle.id) || 'None'}] to Test Run [${testRun.id}]`, e);
	}
}
