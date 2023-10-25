import { NativeModules } from 'react-native';
import { isNil } from 'lodash';

async function isTestFlight(): Promise<boolean> {

	try {
		// grab the function from native modules
		const prodChecker: { isTestflight: () => Promise<string> } | undefined = NativeModules.ProdChecker

		// see if it exists, on android this will never exist
		if (isNil(prodChecker)) {
			return false;
		}

		// get value from native module
		const val = await prodChecker.isTestflight();

		// string of "TESTFLIGHT" will be returned if it is testflight, so check the value and return
		return val === "TESTFLIGHT"

	} catch (err) {
		// if any error occurs assume it is not test flight
		return false
	}

}

export default isTestFlight;