import {Configuration} from "client";
import getBackendURL from "./getBackendURL";

export default function getConfig(token?: string): Configuration {
	const headers = token ? {headers: {authorization: `Bearer ${token}`}} : {};
	return new Configuration({
		...headers,
		basePath: getBackendURL(),
	});
}
