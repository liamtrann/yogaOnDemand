import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Request} from "express";
import {videoSourceBucket} from "@/services/googleStorage";
import {videoSourceModel} from "@/models/VideoSource";
import {getMongooseErrors} from "@/utils/mongooseError";
import ffmpeg from 'fluent-ffmpeg';
import {APIError} from "@/models/APIError";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVideoSourceBody:
 *       required:
 *         - fileName
 *       properties:
 *         fileName:
 *           type: string
 */
interface CreateVideoSourceBody {
	fileName: string,
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVideoSourceResponse:
 *       required:
 *         - videoSourceId
 *       properties:
 *         videoSourceId:
 *           type: string
 */
interface CreateVideoSourceResponse {
	videoSourceId: string,
}

/**
 * @swagger
 * /video_source/create_video_source:
 *   post:
 *     description: after uploading a video url, you may use this api to create the document in the database.
 *     operationId: createVideoSource
 *     tags:
 *       - video_source
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVideoSourceBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateVideoSourceResponse'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/video_source/create_video_source", adminAuthentication([AdminRole.STANDARD, AdminRole.GOD]), async (req: Request<undefined, CreateVideoSourceResponse | APIError, CreateVideoSourceBody>, res) => {

	// verify parameters
	if (!req.body.fileName) {
		res.status(400).send({messages: ["the filename was missing from the request."]});
		return;
	}

	// find the file and verify it has a been uploaded to GCP
	const file = videoSourceBucket.file(req.body.fileName)

	// verify the file has been uploaded and is proper
	const [exists] = await file.exists();
	if (!exists) {
		res.status(400).send({messages: ["Could not find the file in the storage bucket, please confirm the upload was completed."]})
		return;
	}

	// get the size and contentType of the file.
	const [{size, contentType}] = await file.getMetadata(); // this page shows the interface https://cloud.google.com/storage/docs/viewing-editing-metadata#storage-set-object-metadata-nodejs

	// verify the size
	if (size < 1) {
		res.status(400).send({messages: ["The video file uploaded has no size."]});
		return;
	}

	// generate a signed url for the file in order to get the length
	const [url] = await file.getSignedUrl({
		version: "v4",
		action: 'read',
		expires: Date.now() + (15 * 60 * 1000),
	});

	// determine the length of the video
	const durationInSeconds = await new Promise((r: (v: number) => void, e) => {
		ffmpeg.ffprobe(url,function(err, metadata) {
			if (err) {
				e(err);
				return;
			}

			r(metadata.streams[0].duration);
		});
	})
	const durationInMs = Math.floor(durationInSeconds * 1000);

	// create the document
	const now = Date.now();
	const videoSource = new videoSourceModel({
		creationDate: now,
		contentType,
		gcpFileName: req.body.fileName,
		lastUpdated: now,
		size,
		videoLength: durationInMs,
	});

	// validate
	const mongooseErrors = await getMongooseErrors(videoSource);
	if (mongooseErrors) {
		res.status(400).send(mongooseErrors);
		return;
	}

	// save
	await videoSource.save();

	// return successful
	res.status(200).send({videoSourceId: videoSource._id.toString()});
})