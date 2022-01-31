export class DefaultPrevent {
	constructor() {
		this.prevented = false;
	}

	isPrevented() {
		return this.prevented;
	}

	prevent() {
		this.prevented = true;

		Promise.resolve().finally(() => {
			this.prevented = false;
		});
	}
}
