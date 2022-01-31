export class FetchRequestPath {
	constructor() {
		this.path = '';
	}

	one(path, one) {
		this.path += `/${path}`;

		if (one !== undefined) {
			this.path += `/${one}`;
		}

		return this;
	}

	toString() {
		return this.path;
	}
}
