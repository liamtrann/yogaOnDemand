import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {videoSourceBucket} from "@/services/googleStorage";
import {createUUID} from "@/utils/generateUniqueString";
import {supportedVideoSourceContentTypes} from "@/models/VideoSource";

/**
 * @swagger
 * components:
 *   schemas:
 *     GetUploadVideoSourceURLBody:
 *       required:
 *         - contentType
 *       properties:
 *         contentType:
 *           type: string
 */
interface GetUploadVideoSourceURLBody {
	contentType: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GetUploadVideoSourceURLResponse:
 *       required:
 *         - url
 *         - fileName
 *       properties:
 *         url:
 *           type: string
 *         fileName:
 *           type: string
 */
interface GetUploadVideoSourceURLResponse {
	url: string,
	fileName: string,
}

/**
 * @swagger
 * /video_source/get_upload_video_source_url:
 *   post:
 *     description: creates the video upload url, so a video source can be created.
 *     operationId: getUploadVideoSourceURL
 *     tags:
 *       - video_source
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetUploadVideoSourceURLBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUploadVideoSourceURLResponse'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/video_source/get_upload_video_source_url", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, GetUploadVideoSourceURLResponse | APIError, GetUploadVideoSourceURLBody>, res) => {

	// validate the contentType
	const supported = supportedVideoSourceContentTypes.includes(req.body.contentType);
	if (!supported) {
		res.status(400).send({messages: ["Invalid file format, please upload an mp4."]});
		return;
	}

	// generate a random file name
	const fileName = createUUID() + ".mp4";

	// create an empty file
	const file = videoSourceBucket.file(fileName);

	// generate the signed URL
	const [url] = await file.getSignedUrl({
		version: "v4",
		action: 'write',
		expires: Date.now() + (15 * 60 * 1000),
		contentType: req.body.contentType,
	});

	// return the signedURL
	res.send({url, fileName});
})
