import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import {isNil} from "lodash";
import {videoSourceModel} from "@/models/VideoSource";
import {videoSourceBucket} from "@/services/googleStorage";
import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import Request = Express.Request;

/**
 * @swagger
 * components:
 *   schemas:
 *     GetVideoSourceURLRequestBody:
 *       required:
 *         - videoSourceId
 *       properties:
 *         videoSourceId:
 *           type: string
 */
interface GetVideoSourceURLRequestBody {
	videoSourceId: string,
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GetVideoSourceURLResponse:
 *       required:
 *         - url
 *         - expiration
 *       properties:
 *         url:
 *           type: string
 *         expiration:
 *           type: number
 */
interface GetVideoSourceURLResponse {
	url: string,
	expiration: number,
}

/**
 * @swagger
 * /video_source/get_video_source_url:
 *   post:
 *     description: creates a video stream URL that can be played back. Please pass in the VideoSource _id.
 *     operationId: getVideoSourceURL
 *     tags:
 *       - video_source
 *     security:
 *       - TokenDependant: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetVideoSourceURLRequestBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetVideoSourceURLResponse'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/video_source/get_video_source_url",
	tokenTypeAuthentication([TokenType.Admin, TokenType.User], true),
	async (req: Request<undefined, GetVideoSourceURLResponse | APIError, GetVideoSourceURLRequestBody>, res) => {

	// check id exists
	const {videoSourceId} = req.body;
	if (isNil(videoSourceId)) {
		res.status(400).send({messages: ["The video id was missing from the request."]});
		return;
	}

	// check that a video document exists for the id
	const videoSourceDocument = await videoSourceModel.findById(videoSourceId);
	if (isNil(videoSourceDocument)) {
		res.status(400).send({messages: ["The video source could not be found."]});
	}

	// check the file exists in the bucket
	const {gcpFileName, videoLength} = videoSourceDocument;
	const file = videoSourceBucket.file(gcpFileName);
	const exists = await file.exists();
	if (!exists) {
		res.status(400).send({messages: ["The file could not be found."]});
		return;
	}

	// create a signed URL to read it
	const expiration = Date.now() + (3 * 60 * 60 * 1000) + videoLength;
	const [url] = await file.getSignedUrl({
		version: "v4",
		action: 'read',
		expires: expiration, // 3 hours of access
	});

	// send back to frontend
	res.send({
		url,
		expiration
	})

})