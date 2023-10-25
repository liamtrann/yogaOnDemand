import InitialMetaStore, {IMetaStore} from "./meta/InitialMetaStore";

export interface IStore {
	metaStore: IMetaStore;
}

export default {
	metaStore: InitialMetaStore,
} as IStore;
