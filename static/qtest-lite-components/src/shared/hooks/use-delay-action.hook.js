import { useEffect, useRef } from 'react';

export function useDelayAction(defaultActive = false, defaultTime = 500, defaultFn = () => {}) {
	const timeoutRef = useRef(undefined);

	useEffect(() => {
		return () => {
			clear();
		};
	});

	return [
		(override = {}) => {
			const active = override.active !== undefined ? override.active : defaultActive;
			const time = override.time !== undefined ? override.time : defaultTime;
			const fn = override.fn !== undefined ? override.fn : defaultFn;

			if (active) {
				clear();

				timeoutRef.current = setTimeout(() => {
					fn();
				}, time);
			} else {
				fn();
			}
		},
		() => {
			clear();
		}
	];

	function clear() {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	}
}
