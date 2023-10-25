import { AnyAction, StoreEnhancer, applyMiddleware, Reducer, combineReducers, createStore, Store } from "redux";
import {persistStore, persistReducer} from "redux-persist";
import promiseMiddleware from "redux-promise";
import storage from "@react-native-community/async-storage";
import MetaReducer from "./meta/MetaReducer";
import defaultStore, {IStore} from "./defaultStore";
import logger from "redux-logger";

const persistMeta = {
	key: "meta",
	storage,
	whitelist: ["token"],
}

const reducers: Reducer<any, any> = combineReducers({
	metaStore: persistReducer(persistMeta, MetaReducer),
});

const middleware: StoreEnhancer = applyMiddleware(promiseMiddleware);

export const store: Store<IStore> = createStore(reducers, defaultStore, middleware);
export const persistor = persistStore(store);

export interface IAction<T = any, P = undefined> extends AnyAction {
	type: T,
	payload?: P,
}
