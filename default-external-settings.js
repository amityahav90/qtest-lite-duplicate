export const defaultExternalSettings = {
	protocol: 1,
	issuePanels: {
		testRun: {
			stepStatuses: [
				{
					name: 'Passed',
					color: 'success'
				},
				{
					name: 'Failed',
					color: 'error'
				},
				{
					name: 'Skipped',
					color: 'warning'
				},
				{
					name: 'None',
					color: 'default'
				}
			]
		}
	}
};
