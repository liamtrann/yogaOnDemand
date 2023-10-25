import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil} from "lodash";
import {getMongooseErrors} from "@/utils/mongooseError";
import {Express} from "@/global";
import {validateID} from "@/utils/validateID";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {Video, videoModel} from "@/models/Video";
import {transactionModel, TransactionType, WatchTransactionType} from "@/models/Transaction";
import {DocumentType} from "@typegoose/typegoose";
import {VideoSource} from "@/models/VideoSource";
import Request = Express.Request;

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWatchTransactionBody:
 *       required:
 *         - videoID
 *         - watchTransactionType
 *         - timestamp
 *       properties:
 *         videoID:
 *           type: string
 *         watchTransactionType:
 *           $ref: '#/components/schemas/WatchTransactionType'
 *         timestamp:
 *           type: number
 *         skipTo:
 *           type: number
 */
interface CreateWatchTransactionBody {
    videoID: string;
    watchTransactionType: WatchTransactionType;
    timestamp: number;
    skipTo?: number;
}

/**
 * @swagger
 * /video/create_watch_transaction:
 *   post:
 *     description: Used by users to create a new watch transaction
 *     operationId: createWatchTransaction
 *     tags:
 *       - video
 *     security:
 *       - User: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWatchTransactionBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/video/create_watch_transaction", userAuthentication(false), async (req: Request<undefined, undefined | APIError, CreateWatchTransactionBody>, res) => {
    const errors: string[] = [];
    const creationDate: number = Date.now();

    const {videoID, watchTransactionType, timestamp, skipTo} = req.body;

    //validation
    if (isNil(videoID)) {
        errors.push("The video ID field was missing.");
    } else {
        const videoIDErrors = validateID(videoID);
        if (videoIDErrors) {
            errors.push(...videoIDErrors.messages);
        }
    }

    if (isNil(watchTransactionType)) {
        errors.push("The watch transaction type field was missing.");
    } else if (!Object.values(WatchTransactionType).includes(watchTransactionType)) {
        errors.push("The watch transaction type was invalid.");
    } else if (watchTransactionType === WatchTransactionType.SKIP && isNil(skipTo)) {
        errors.push("Skip type watch transaction require the skipTo field.");
    } else if (watchTransactionType !== WatchTransactionType.SKIP && !isNil(skipTo)) {
        errors.push("Only skip type watch transactions can have the skipTo field.");
    }

    if (isNil(timestamp)) {
        errors.push("The timestamp field was missing");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the video
    const video: DocumentType<Video> = await videoModel.findById(videoID).populate("videoSource");
    if (isNil(video)) {
        res.status(400).send({messages: ["Could not find a video with the given ID."]});
        return;
    }

    if (video.disabled) {
        res.status(400).send({messages: ["This video has been removed."]});
        return;
    }

    // create db document
    const transaction = new transactionModel({
        transactionType: TransactionType.VIDEO,
        owner: req.user,
        watchTransaction: {
            watchTransactionType,
            video,
            timestamp,
            skipTo,
            videoLength: (video.videoSource as VideoSource).videoLength,
            videoExperience: video.experience,
        },
        creationDate
    });

    // validate
    const mongooseErrors = await getMongooseErrors(transaction);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // save
    await transaction.save();
    res.sendStatus(200);
})