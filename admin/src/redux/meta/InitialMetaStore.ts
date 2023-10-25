export interface IMetaStore {
	token?: string;
	loadingIncrement?: number;
	errors?: Array<any>;
	sidebarVisible: boolean;
	loadingText?: string;
}

export default {
	loadingIncrement: 0,
	errors: [],
	sidebarVisible: false,
} as IMetaStore;
