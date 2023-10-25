import axios from "axios";
import {APIError} from "client";

async function uploadToSignedURL(signedURL: string, file: File, callbackProgress?: (percent: number) => void): Promise<APIError | void> {
	try {
		await axios({
			url: signedURL,
			headers: {
				"Content-Type": file.type,
			},
			method: "PUT",
			data: file,
			timeout: 0,
			onUploadProgress: (progressEvent) => {
				const totalLength = progressEvent.lengthComputable ? progressEvent.total : progressEvent.target.getResponseHeader('content-length') || progressEvent.target.getResponseHeader('x-decompressed-content-length');
				if (callbackProgress) {
					callbackProgress((progressEvent.loaded * 100) / totalLength);
				}
			}
		})
	} catch (err) {
		console.error("upload to signed URL Error", err);
		return {
			messages: ["Something went wrong during the upload. Please try again."],
		}
	}

}

export default uploadToSignedURL;
