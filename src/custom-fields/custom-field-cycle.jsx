// noinspection ES6UnusedImports
import ForgeUI, { CustomField, render, Text, useProductContext } from '@forge/ui';

const View = () => {
	const context = useProductContext();

	return (
		<CustomField>
			<Text>{(context.extensionContext.fieldValue && context.extensionContext.fieldValue.name) || 'Root'}</Text>
		</CustomField>
	);
};

export const customFieldCycle = render(<View />);
