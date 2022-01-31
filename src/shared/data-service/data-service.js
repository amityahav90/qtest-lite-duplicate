import { FetchRequest, FetchRequestPath } from '../fetch-request';
import { EnvironmentVariables } from '../environment-variables';

export class DataService {
	constructor() {
		this.fetchRequest = new FetchRequest(EnvironmentVariables.DATA_SERVICE_URL);
	}
}
