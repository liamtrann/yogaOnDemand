import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil} from "lodash";
import {Express} from "@/global";
import {videoModel} from "@/models/Video";
import Request = Express.Request;
import {validateID} from "@/utils/validateID";
import {IDBody} from "@/models/IDBody";

/**
 * @swagger
 * /video/disable_video:
 *   put:
 *     description: Used by admins to delete a video
 *     operationId: disableVideo
 *     tags:
 *       - video
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IDBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/video/disable_video", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {id} = req.body;

    //validation
    if (isNil(id)) {
        errors.push("The video ID field was missing.");
    } else {
        const videoIDErrors = validateID(id);
        if (videoIDErrors) {
            errors.push(...videoIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the video
    const video = await videoModel.findById(id);
    if (isNil(video)) {
        res.status(400).send({messages: ["Could not find a video with the given ID."]});
        return;
    }

    // check if the video has already been disabled
    if (video.disabled) {
        res.status(400).send({messages: ["This video has already been removed."]});
        return;
    }

    // disable the video the video
    await videoModel.findByIdAndUpdate(id, {disabled: true, dateLastUpdated});

    res.sendStatus(200);
})