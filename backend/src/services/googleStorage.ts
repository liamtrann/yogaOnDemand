import {Storage} from "@google-cloud/storage";

const storage = new Storage({
	projectId: process.env.GCP_PROJECT_ID,
	credentials: {
		client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
	}
});

const assetBucket = storage.bucket(process.env.GCP_ASSET_BUCKET);
const videoSourceBucket = storage.bucket(process.env.GCP_VIDEO_SOURCES_BUCKET);

export {assetBucket, videoSourceBucket};