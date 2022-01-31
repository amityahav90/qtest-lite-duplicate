import { generateGuid22 } from '../tools';

export function generateProjectTestCaseFolderData(id = generateGuid22(), name = '', count = 0, children = []) {
	return { id, name, count, children };
}
