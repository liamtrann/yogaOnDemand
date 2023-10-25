import {APIError} from "client";

export interface IMetaStore {
	token?: string;
	loadingCount: number;
	showSubscriptionModal: boolean;
	errors: APIError[];
}

export default {
	loadingCount: 0,
	errors: [],
	showSubscriptionModal: false,
} as IMetaStore;
