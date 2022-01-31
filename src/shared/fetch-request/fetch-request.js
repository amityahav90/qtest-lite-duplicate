import { FetchRequestType } from './fetch-request-type.enum';
import { FetchRequestReason } from './fetch-request-reason.enum';

export class FetchRequest {
	constructor(base = '', transformHeaders = (headers) => headers, transformErrorResponse = (errorResponse) => errorResponse) {
		this.base = base;
		this.headers = {
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json;charset=UTF-8'
		};
		this.transformHeaders = transformHeaders;
		this.transformErrorResponse = transformErrorResponse;
		this.bodyJsonStringify = true;
	}

	setBodyJsonStringify(value) {
		this.bodyJsonStringify = value;

		return this;
	}

	head(path, parameters) {
		return this.common({
			type: FetchRequestType.HEAD,
			path,
			parameters
		});
	}

	get(path, parameters) {
		return this.common({
			type: FetchRequestType.GET,
			path,
			parameters
		});
	}

	patch(path, parameters, body) {
		return this.common({
			type: FetchRequestType.PATCH,
			path,
			parameters,
			body: this.objectToJsonPatch(body)
		});
	}

	patchMultiple(path, parameters, body = { ids: [], patchDocument: {} }) {
		const payload = {
			ids: body.ids,
			patchDocument: this.objectToJsonPatch(body.patchDocument)
		};

		return this.common({
			type: FetchRequestType.PATCH,
			path,
			parameters,
			body: payload
		});
	}

	post(path, parameters, body) {
		return this.common({
			type: FetchRequestType.POST,
			path,
			parameters,
			body: body
		});
	}

	put(path, parameters, body) {
		return this.common({
			type: FetchRequestType.PUT,
			path,
			parameters,
			body: body
		});
	}

	remove(path, parameters, body) {
		return this.common({
			type: FetchRequestType.REMOVE,
			path,
			parameters,
			body: body
		});
	}

	common({ type, path, parameters, body }) {
		return new Promise((resolve, reject) => {
			fetch(`${this.base}${path}${this.getQueryString(parameters)}`, {
				method: type,
				headers: this.transformHeaders(this.headers),
				body: body && (this.bodyJsonStringify ? JSON.stringify(body) : body)
			})
				.then((response) => {
					response
						.text()
						.then((text) => {
							let data;

							try {
								data = JSON.parse(text);
							} catch (e) {
								data = text;
							}

							if (response.ok) {
								resolve({
									status: response.status,
									statusText: response.statusText,
									headers: this.transformResponseHeaders(response.headers),
									data
								});
							} else {
								reject(
									this.transformErrorResponse({
										reason: FetchRequestReason.FAILED,
										status: response.status,
										statusText: response.statusText,
										headers: this.transformResponseHeaders(response.headers),
										data
									})
								);
							}
						})
						.catch((e) => {
							reject({
								reason: FetchRequestReason.TYPE_ERROR,
								status: '(failed)',
								statusText: 'Request has been failed to convert to text',
								headers: {},
								data: e
							});
						});
				})
				.catch((e) => {
					reject({
						reason: FetchRequestReason.NETWORK_ERROR,
						status: '(failed)',
						statusText: 'Request has been failed',
						headers: {},
						data: e
					});
				});
		});
	}

	objectToJsonPatch(obj) {
		const commands = [];

		if (obj instanceof Object) {
			Object.keys(obj).forEach((key) => {
				commands.push({ value: obj[key], path: '/' + key, op: 'replace' });
			});
		}

		return commands;
	}

	transformResponseHeaders(headers) {
		const transformed = {};

		headers.forEach((value, key) => {
			transformed[key] = value;
		});

		return transformed;
	}

	getQueryString(params) {
		let query = '';

		if (params) {
			const keys = [];

			Object.keys(params).forEach((key) => {
				if (params[key] instanceof Array) {
					params[key].forEach((param) => {
						keys.push(`${key}=${param}`);
					});
				} else {
					keys.push(`${key}=${params[key]}`);
				}
			});

			query = `?${keys.join('&')}`;
		}

		return query;
	}
}
