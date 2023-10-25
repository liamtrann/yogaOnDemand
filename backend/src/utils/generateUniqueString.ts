import {assetModel} from "@/models/Asset";
import * as crypto from "crypto";

export function generateUniqueString() {
	// import in here to save load time for starting the server
	const { uniqueNamesGenerator, adjectives, colors, animals, NumberDictionary } = require("unique-names-generator")

	return uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		separator: "_",
		length: 3,
		style: "lowercase"
	})
		.toLowerCase()
		.replace(" ", "_");
}

export async function getUniqueAssetURLExtension() {
	let uniqueString: string;

	function found() {
		return new Promise(r => {
			assetModel.findById(uniqueString)
				.then(res => r(res !== undefined && res !== null))
				.catch(() => r(false))
		})
	}

	do {
		uniqueString = generateUniqueString();
	} while (await found())

	return uniqueString;
}

export function createUUID() {
	// http://www.ietf.org/rfc/rfc4122.txt
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}
