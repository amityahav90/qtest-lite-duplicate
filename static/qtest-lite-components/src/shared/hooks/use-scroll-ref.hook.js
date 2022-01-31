import { useEffect, useRef } from 'react';
import { useWindowEvent } from './use-window-event.hook';

const VERTICAL_SCROLL_CLASS = 'qtest-has-vertical-scroll';
const HORIZONTAL_SCROLL_CLASS = 'qtest-has-horizontal-scroll';

export function useScrollRef() {
	const ref = useRef();

	useWindowEvent('resize', (evt) => {
		toggleHasScroll();
	});

	useEffect(() => {
		toggleHasScroll();
	});

	function toggleHasScroll() {
		const element = /** @type HTMLElement */ ref.current;

		if (element) {
			if (element.scrollHeight > element.clientHeight) {
				element.classList.add(VERTICAL_SCROLL_CLASS);
			} else {
				element.classList.remove(VERTICAL_SCROLL_CLASS);
			}

			if (element.scrollWidth > element.clientWidth) {
				element.classList.add(HORIZONTAL_SCROLL_CLASS);
			} else {
				element.classList.remove(HORIZONTAL_SCROLL_CLASS);
			}
		}
	}

	return ref;
}
