import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import {Video, videoModel} from "@/models/Video";
import {isNil} from "lodash";
import {validateID} from "@/utils/validateID";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {DocumentType} from "@typegoose/typegoose";
import {Asset} from "@/models/Asset";
import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import Request = Express.Request;

/**
 * @swagger
 * /video/get_video:
 *   get:
 *     operationId: getVideo
 *     tags:
 *       - video
 *     security:
 *       - User: []
 *     parameters:
 *       - in: query
 *         name: videoID
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/video/get_video", tokenTypeAuthentication([TokenType.User, TokenType.Admin], false), async (req: Request<undefined, Video | APIError>, res) => {
    const errors: string[] = [];

    const {videoID} = req.query;

    // validate the video ID
    if (isNil(videoID)) {
        errors.push("The video ID field was missing.");
    } else {
        const videoIDErrors = validateID(videoID);
        if (videoIDErrors) {
            errors.push(...videoIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the video
    const _video = await videoModel.findById(videoID).populate("categories class image instructor videoSource");
    const video = _video.toJSON();
    if (isNil(video)) {
        res.status(400).send({messages: ["Could not find a video with the given ID"]});
        return;
    }

    // check if this video has been disabled
    if (video.disabled) {
        res.status(400).send({messages: ["This video has been removed."]});
        return;
    }

    video.image = addURLtoAsset(video.image as DocumentType<Asset>);

    res.send(video);
});

