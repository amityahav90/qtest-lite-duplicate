import { useEffect, useRef } from 'react';

export function useWindowEvent(eventName, eventFn, eventOptions) {
	const eventFnRef = useRef();

	useEffect(() => {
		eventFnRef.current = eventFn;
	});

	useEffect(() => {
		function fn(evt) {
			eventFnRef.current(evt);
		}

		window.addEventListener(eventName, fn, eventOptions);

		return () => {
			window.removeEventListener(eventName, fn, eventOptions);
		};
	}, [eventName, eventOptions]);
}
