import { generateGuid22 } from '../tools';

export function generateVersionCycleData(id = generateGuid22(), name = '', description = '', startDate = '', endDate = '', children = []) {
	return { id, name, description, startDate, endDate, children };
}
