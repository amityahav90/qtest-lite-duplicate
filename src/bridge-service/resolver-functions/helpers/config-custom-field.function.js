import { ForgeApiManager } from '../../../shared/forge-api-manager';

export async function configCustomField(customFieldId, options, issueTypes) {
	// Getting the default context of the new custom field.
	const fieldDefaultContext = await ForgeApiManager.getCustomFieldDefaultContext(customFieldId);

	// If there are options, it means that the new custom field is of type 'Select' and we need to add options to it.
	if (options !== undefined) {
		// Add options to a custom field of type 'Select'.
		await ForgeApiManager.createIssueCustomFieldOptions(customFieldId, fieldDefaultContext.id, options);
	}

	// Defines in which issue types this custom field will be displayed. (according to the 'issueTypes' list).
	await ForgeApiManager.addIssueTypesToFieldContext(customFieldId, fieldDefaultContext.id, issueTypes);

	// Get a list of all the screens in the user's Jira account.
	const screens = await ForgeApiManager.getAllScreens();
	await Promise.all(
		screens
			.filter((m) => !m.scope) // If the screen has a 'scope' property it means that it's a team-managed project.
			.map((screen) =>
				// Getting all the tabs of the current screen.
				ForgeApiManager.getScreenTabs(screen.id).then((screenTabs) =>
					Promise.all(
						screenTabs.map((screenTab) =>
							// Iterate through all the tabs of the current screen and adding the new custom field to them.
							ForgeApiManager.assignCustomFieldToScreen(screen.id, screenTab.id, customFieldId)
						)
					)
				)
			)
	);
}
