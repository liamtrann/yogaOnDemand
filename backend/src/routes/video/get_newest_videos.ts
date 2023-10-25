import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import {app} from "@/index";
import {Video, videoModel} from "@/models/Video";
import {DocumentType} from "@typegoose/typegoose";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import Request = Express.Request;

/**
 * @swagger
 * components:
 *   schemas:
 *     GetVideoFeedResponse:
 *       required:
 *         - videos
 *       properties:
 *         videos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Video'
 */
export interface GetVideoFeedResponse {
	videos: Video[]
}

/**
 * @swagger
 * /video/get_newest_videos:
 *   get:
 *     operationId: getNewestVideos
 *     tags:
 *       - video
 *     security:
 *       - TokenDependant: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetVideoFeedResponse'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/video/get_newest_videos", tokenTypeAuthentication([TokenType.Admin, TokenType.User]), async (req: Request<undefined, GetVideoFeedResponse | APIError>, res) => {

	const limit = (req.query.limit && !isNaN(Number(req.query.limit))) ? Number(req.query.limit) : 30;

	// hide hidden videos from users
	let query = {disabled: false};
	if (req.token.tokenType === TokenType.User) {
		query["hidden"] = {$ne: true};
	}

	// get the videos
	const videos = await videoModel
		.find(query)
		.populate({path: "image", model: "Asset"})
		.populate({path: "instructor", model: "Instructor", populate: [{path: "image" ,model: "Asset"}]})
		.populate({path: "class", model: "Class"})
		.populate({path: "categories", model: "Category"})
		.sort({creationDate: -1, dateLastUpdated: -1})
		.limit(limit)

	// add urls to the asset
	const videosWithURL: Video[] = videos.map((video: DocumentType<Video>) => {
		const v = video.toJSON();
		v.image = addURLtoAsset(v.image);
		v.instructor.image = addURLtoAsset(v.instructor.image);
		return v;
	});

	// send the result
	res.send({

		videos: videosWithURL
	});
})