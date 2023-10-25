import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {isNil} from "lodash";
import {videoSourceModel} from "@/models/VideoSource";
import {videoSourceBucket} from "@/services/googleStorage";

/**
 * @swagger
 * components:
 *   schemas:
 *     DisableVideoSourceBody:
 *       required:
 *         - videoSourceId
 *       properties:
 *         videoSourceId:
 *           type: string
 */
interface DisableVideoSourceBody {
	videoSourceId: string,
}

/**
 * @swagger
 * /video_source/disable_video_source:
 *   delete:
 *     description: This will delete the video source from the bucket as well as disable the document for any use. This can not be undone
 *     operationId: disableVideoSource
 *     tags:
 *       - admin
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DisableVideoSourceBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.delete("/video_source/disable_video_source", async (req: Request<undefined, DisableVideoSourceBody | APIError>, res) => {

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
		return;
	}

	// delete from videoSourceBucket
	const {gcpFileName} = videoSourceDocument;
	const file = videoSourceBucket.file(gcpFileName);
	await file.delete();

	// check the file does not exist in the bucket
	const exists = await file.exists();
	if (exists) {
		res.status(400).send({messages: ["There was an error deleting the file from the bucket."]});
		return;
	}

	// disable
	videoSourceModel.findByIdAndUpdate(videoSourceId, {disabled: true});

	// send back response
	res.sendStatus(200);
})