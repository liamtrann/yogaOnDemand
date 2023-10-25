import InitialMetaStore, {IMetaStore} from "./InitialMetaStore";
import {IAction} from "../IAction";
import {cloneDeep} from "lodash";
import {setLoadingText} from "./MetaActions";

export enum MetaAction {
	LOGIN = "LOGIN",
	LOGOUT = "LOGOUT",
	LOADING = "LOADING",
	LOADING_TEXT = "LOADING_TEXT",
	ADD_ERROR = "ADD_ERROR",
	REMOVE_ERROR = "REMOVE_ERROR",
	SIDEBAR = "SIDEBAR",
}

export default function(store: IMetaStore = InitialMetaStore, a: IAction<MetaAction, any>): IMetaStore {

	const n: IMetaStore = cloneDeep(store);

	switch(a.type) {
		case MetaAction.LOGIN:
			n.token = a.payload;
			break;
		case MetaAction.LOGOUT:
			delete n.token;
			break;
		case MetaAction.LOADING:
			if (n.loadingIncrement + a.payload >= 0) {
				n.loadingIncrement += a.payload;
			} else {
				n.loadingIncrement = 0;
			}

			if (n.loadingIncrement < 1) {
				delete n.loadingText
			}
			break;
		case MetaAction.LOADING_TEXT:
			n.loadingText = a.payload;
			break;
		case MetaAction.ADD_ERROR:
			n.errors.push(a.payload);
			break;
		case MetaAction.REMOVE_ERROR:
			n.errors.splice(a.payload, 1);
			break;
		case MetaAction.SIDEBAR:
			n.sidebarVisible = a.payload;
			break;
		default:
			break;
	}

	return n;
}
