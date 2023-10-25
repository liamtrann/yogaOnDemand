import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import {app} from "@/index";
import {Video, videoModel} from "@/models/Video";
import {transactionModel, WatchTransactionType} from "@/models/Transaction";
import {DocumentType} from "@typegoose/typegoose";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {isNil} from "lodash";
import {validateID} from "@/utils/validateID";
import {Category, categoryModel} from "@/models/Category";
import {GetVideoFeedResponse} from "@/routes/video/get_newest_videos";
import Request = Express.Request;

/**
 * @swagger
 * /video/get_videos_based_on_views:
 *   get:
 *     operationId: getVideosBasedOnViews
 *     tags:
 *       - video
 *     security:
 *       - TokenDependant: []
 *     parameters:
 *       - in: query
 *         name: transactionsToFetch
 *         schema:
 *           type: number
 *       - in: query
 *         name: categoryID
 *         schema:
 *           type: string
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
app.get("/video/get_videos_based_on_views", tokenTypeAuthentication([TokenType.Admin, TokenType.User]), async (req: Request<undefined, GetVideoFeedResponse | APIError>, res) => {
	const errors: string[] = [];
	const limit = (req.query.transactionsToFetch && !isNaN(Number(req.query.transactionsToFetch))) ? Number(req.query.transactionsToFetch) : Number.MAX_SAFE_INTEGER;

	// validate
	if (!isNil(req.query.categoryID)) {
		if (typeof req.query.categoryID !== "string") {
			errors.push("The category ID field was invalid.");
		} else {
			const categoryIDErrors = validateID(req.query.categoryID);
			if (categoryIDErrors) {
				errors.push(...categoryIDErrors.messages);
			}
		}
	}

	if (errors.length > 0) {
		res.status(400).send({messages: errors});
		return;
	}

	let category: DocumentType<Category>;
	if (!isNil(req.query.categoryID)) {
		// find the category
		category = await categoryModel.findById(req.query.categoryID);
		if (isNil(category)) {
			res.status(400).send({messages: ["Could not find a category with the given ID."]});
			return;
		}
	}

	// get the most recent 5000 start transactions
	const transactions = await transactionModel
		.find({["watchTransaction.watchTransactionType"]: WatchTransactionType.START})
		.sort({creationDate: -1})
		.limit(limit)


	// create map of watch amounts to videoIDs
	const videoWatchAmounts: {[key: string]: number} = {};
	for (const transaction of transactions) {
		const id = transaction.watchTransaction.video.toString();
		if (!videoWatchAmounts[id]) {
			videoWatchAmounts[id] = 1;
		} else {
			videoWatchAmounts[id]++;
		}
	}

	// create array of sorted values
	const entries = Object.entries(videoWatchAmounts);

	// sort them by viewCount
	const videoIDEntries = entries.sort((a, b) => b[1] - a[1]);
	const videoIDList = videoIDEntries.map(v => v[0]);

	const query = {disabled: false};

	// hide hidden videos from users
	if (req.token.tokenType === TokenType.User) {
		query["hidden"] = {$ne: true};
	}

	if (!isNil(category)) {
		query["category"] = category;
	}

	// get the videos
	const videos = await videoModel
		.find(query)
		.where("_id")
		.in(videoIDList)
		.populate({path: "image", model: "Asset"})
		.populate({path: "instructor", model: "Instructor", populate: [{path: "image" ,model: "Asset"}]})
		.populate({path: "class", model: "Class"})
		.populate({path: "categories", model: "Category"})
		.limit(30);

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