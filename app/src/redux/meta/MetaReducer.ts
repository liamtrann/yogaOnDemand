import InitialMetaStore, {IMetaStore} from "./InitialMetaStore";
import {IAction} from "../index";
import {cloneDeep} from "lodash"

export enum MetaAction {
	LOGIN = "LOGIN",
	LOGOUT = "LOGOUT",
	LOADING = "LOADING",
	ADD_ERROR = "ADD_ERROR",
	CLEAR_ERROR = "CLEAR_ERROR",
	CLEAR_ALL_ERRORS = "CLEAR_ALL_ERRORS",
	SUBSCRIPTION_MODAL = "SUBSCRIPTION_MODAL",
}

export default function(metaStore: IMetaStore = InitialMetaStore, action: IAction<MetaAction, any>): IMetaStore {

	const newMetaStore: IMetaStore = cloneDeep(metaStore);

	switch(action.type) {
		case MetaAction.LOGIN:
			newMetaStore.token = action.payload;
			break;
		case MetaAction.LOGOUT:
			delete newMetaStore.token;
			break;
		case MetaAction.LOADING:
			if (newMetaStore.loadingCount + action.payload >= 0) {
				newMetaStore.loadingCount += action.payload;
			} else {
				newMetaStore.loadingCount = 0;
			}
			break;
		case MetaAction.ADD_ERROR:
			newMetaStore.errors.push(action.payload);
			break;
		case MetaAction.CLEAR_ERROR:
			newMetaStore.errors.splice(action.payload, 1);
			break;
		case MetaAction.CLEAR_ALL_ERRORS:
			newMetaStore.errors = [];
			break;
		case MetaAction.SUBSCRIPTION_MODAL:
			newMetaStore.showSubscriptionModal = action.payload;
	}

	return newMetaStore;
}
