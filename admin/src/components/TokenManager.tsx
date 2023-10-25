import React, {useEffect} from "react";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {logout} from "../redux/meta/MetaActions";
import {UtilsApi} from "client";
import getConfig from "../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
}

const tokenCheckInterval: number = 60000;

const TokenManager: React.FC<IProps> = (props: IProps) => {

	useEffect(() => {
		checkTokenValid().then().catch();
		const interval = setInterval(checkTokenValid, tokenCheckInterval);
		return () => clearInterval(interval);
	}, [props.token]);

	async function checkTokenValid(): Promise<void> {
		// don't need to check if token doesn't exist
		if (!props.token) {
			return;
		}

		try {
			const res = await new UtilsApi(getConfig(props.token)).checkTokenExpiration({tokenBody: {token: props.token}});

			if (res.expired === true) {
				props.dispatch(logout());
			}
		} catch (e) {

		}
	}

	return null;
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
	}
})(TokenManager);
