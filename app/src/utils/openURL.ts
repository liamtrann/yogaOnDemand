import {Linking} from "react-native";

function createOpenURLOnClick(url: string): () => Promise<void> {
	return async () => {
		// check if linking is supported
		const supported = Linking.canOpenURL(url);

		// if so open the url
		if (supported) {
			await Linking.openURL(url);
		}

		// if not then display an alert with the URL
		else {
			alert(`Cannot open the url. Please visit '${url}' in your browser`);
		}
	}
}

export {createOpenURLOnClick};