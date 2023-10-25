import {Configuration} from "client";

export default function getConfig(token?: string): Configuration {
	const headers = token ? {headers: {authorization: `Bearer ${token}`}} : {};
	return new Configuration({
		...headers,
	});
}
