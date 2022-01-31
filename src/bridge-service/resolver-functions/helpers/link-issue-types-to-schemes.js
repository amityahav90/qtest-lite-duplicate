import { LogService } from '../../../../shared/log-service';
import { getIssueTypeSchemes } from './get-issue-type-schemes';
import { linkIssueTypesToScheme } from './link-issue-types-to-scheme';

export async function linkIssueTypesToSchemes(issueTypeIds) {
	const log = new LogService('linkIssueTypeToSchemes');
	const schemes = await getIssueTypeSchemes();

	const unresolved = schemes.map(async (scheme) => {
		await linkIssueTypesToScheme(scheme.id, issueTypeIds);
		log.debug(`Added issue type [${issueTypeIds}] to issue scheme type [${scheme.id}]`);
	});

	await Promise.all(unresolved);
}
