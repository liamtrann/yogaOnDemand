import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import {app} from "@/index";
import {Video, videoModel} from "@/models/Video";
import {Transaction, transactionModel, TransactionType, WatchTransactionType} from "@/models/Transaction";
import Request = Express.Request;
import {DocumentType} from "@typegoose/typegoose";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {isNil} from "lodash";
import {validateID} from "@/utils/validateID";
import {Category, categoryModel} from "@/models/Category";
import {GetVideoFeedResponse} from "@/routes/video/get_newest_videos";
import userAuthentication from "@/middleware/authentication/userAuthentication";

/**
 * @swagger
 * /video/get_videos_recently_viewed:
 *   get:
 *     operationId: getVideosRecentlyViewed
 *     tags:
 *       - video
 *     security:
 *       - User: []
 *     parameters:
 *       - in: query
 *         name: transactionsToFetch
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
app.get("/video/get_videos_recently_viewed", userAuthentication(false), async (req: Request<undefined, GetVideoFeedResponse | APIError>, res) => {
    const errors: string[] = [];
    const {transactionsToFetch} = req.query;

    if (!isNil(transactionsToFetch)) {
        if (typeof transactionsToFetch !== "string" || isNaN(Number(transactionsToFetch))) {
            errors.push("The transactions to fetch field was invalid.");
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    const limit = (req.query.transactionsToFetch && !isNaN(Number(req.query.transactionsToFetch))) ? Number(req.query.transactionsToFetch) : Number.MAX_SAFE_INTEGER;

    // get the transactions
    const transactions = await transactionModel
        .find({owner: req.user})
        .sort({creationDate: 1})
        .limit(limit);

    const filteredTransactions: {[key: string]: number} = {};
    for (const transaction of transactions) {
        const videoID = transaction.watchTransaction.video.toString();

        if (transaction.watchTransaction.watchTransactionType === WatchTransactionType.END) {
            delete filteredTransactions[videoID];
        } else {
            filteredTransactions[videoID] = transaction.creationDate;
        }
    }

    // create array of sorted values
    const entries = Object.entries(filteredTransactions);

    // sort them by creation date
    const videoIDEntries = entries.sort((a, b) => b[1] - a[1]);
    const videoIDList = videoIDEntries.map(v => v[0]);

    const query = {disabled: false};

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