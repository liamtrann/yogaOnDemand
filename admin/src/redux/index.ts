import {applyMiddleware, combineReducers, createStore, Reducer, Store, StoreEnhancer} from "redux";
import logger from "redux-logger";
import promiseMiddleware from "redux-promise";
import storage from "redux-persist/lib/storage";
import {persistReducer, persistStore} from "redux-persist";
import defaultStore, {IStore} from "./defaultStore";
import MetaReducer from "./meta/MetaReducer";

const metaPersistConfig = {
	key: "meta",
	storage,
	whitelist: ["token"],
};

const reducers: Reducer<any, any> = combineReducers({
	metaStore: persistReducer(metaPersistConfig, MetaReducer),
});

const middleware: StoreEnhancer = applyMiddleware(logger, promiseMiddleware);

export const store: Store<IStore> = createStore(reducers, defaultStore, middleware);
export const persistor = persistStore(store);
