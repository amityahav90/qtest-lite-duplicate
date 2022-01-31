import { generateGuidMax } from './generate-guid-max';

/**
 * Generate a random GUID with exactly 22 characters.
 * @returns {string}
 */
export function generateGuid22() {
	return generateGuidMax() + generateGuidMax() + generateGuidMax(6);
}
