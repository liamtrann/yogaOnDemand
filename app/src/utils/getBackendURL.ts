import isTestFlight from "./isTestflight";

let installedThroughTestFlight = false;

// call and check for test flight
isTestFlight().then(v => {
	installedThroughTestFlight = v;
})

/**
 * Replace these values for changing the servers
 */
const remoteProduction = "https://theyogabarondemand.backend.frameonesoftware.com";
const remoteDevelop = "https://theyogabarondemand.backend.frameonesoftware.com";
// const remoteDevelop = "https://theyogabarondemand.develop.backend.frameonesoftware.com";
const localURL = "http://localhost:8080";

/**
 * WARNING!!
 *
 * There is a chance when running through testflight or in a non app store release, that the testflight check hasn't run
 * yet. However on subsequent calls it should work, once isTestFlight is called.
 */
export default function getBackendURL(): string {
	const remoteURL = installedThroughTestFlight ? remoteDevelop : remoteProduction
	return __DEV__ ? localURL : remoteURL;
}
