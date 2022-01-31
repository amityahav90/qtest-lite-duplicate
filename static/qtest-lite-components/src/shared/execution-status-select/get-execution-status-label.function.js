import { ExecutionStatus } from '../../../../../shared/enums';

const labelMap = {
	[ExecutionStatus.PASSED]: 'PASSED',
	[ExecutionStatus.FAILED]: 'FAILED',
	[ExecutionStatus.BLOCKED]: 'BLOCKED',
	[ExecutionStatus.IN_PROGRESS]: 'IN PROGRESS',
	[ExecutionStatus.UNEXECUTED]: 'UNEXECUTED'
};

export function getExecutionStatusLabel(status) {
	return labelMap[status];
}
