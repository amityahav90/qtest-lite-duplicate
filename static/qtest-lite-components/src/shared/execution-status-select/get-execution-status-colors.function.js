import { ExecutionStatus } from '../../../../../shared/enums';
import { G400, G75, N40, N90, P300, R400, R75, Y400 } from '../design-styles';

const labelMap = {
	[ExecutionStatus.PASSED]: {
		backgroundColor: G75,
		color: G400
	},
	[ExecutionStatus.FAILED]: {
		backgroundColor: R75,
		color: R400
	},
	[ExecutionStatus.BLOCKED]: {
		backgroundColor: '#FFF0B3',
		color: Y400
	},
	[ExecutionStatus.IN_PROGRESS]: {
		backgroundColor: '#C0B6F2',
		color: P300
	},
	[ExecutionStatus.UNEXECUTED]: {
		backgroundColor: N40,
		color: N90
	}
};

export function getExecutionStatusColors(status) {
	return labelMap[status];
}
