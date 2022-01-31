import { useRef, useState } from 'react';

export function useRefState(initialState) {
	const [value, setValue] = useState(initialState);
	const ref = useRef(value);

	return [
		ref,
		(value) => {
			ref.current = value;
			setValue(value);
		}
	];
}
