import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import Request = Express.Request;
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {Video, videoModel} from "@/models/Video";
import {isNil} from "lodash";
import {validateID} from "@/utils/validateID";
import {classModel} from "@/models/Class";
import {chain} from "mathjs";
import {DocumentType} from "@typegoose/typegoose";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {GetVideosPaginatedResponse} from "@/routes/video/user/get_videos_for_category";

/**
 * @swagger
 * /video/get_videos_for_class:
 *   get:
 *     operationId: getVideosForClass
 *     tags:
 *       - video
 *     security:
 *       - User: []
 *     parameters:
 *       - in: query
 *         name: classID
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         required: true
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetVideosPaginatedResponse'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/video/get_videos_for_class", userAuthentication(false), async (req: Request<undefined, GetVideosPaginatedResponse | APIError>, res) => {
    const errors: string[] = [];

    const {classID, limit, offset} = req.query;
    console.log(req.query);

    // validate the class ID
    if (isNil(classID)) {
        errors.push("The class ID field was missing.");
    } else {
        const classIDErrors = validateID(classID);
        if (classIDErrors) {
            errors.push(...classIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the class
    const classDocument = await classModel.findById(classID);
    if (isNil(classDocument)) {
        res.status(400).send({messages: ["Could not find a class with the given ID"]});
        return;
    }

    // check if the class is disabled
    if (classDocument.disabled) {
        res.status(400).send({messages: ["This class has been removed."]});
        return;
    }

    // find total number of videos
    const videoCount = await videoModel.countDocuments({class: classDocument, disabled: false, hidden: {$ne: true}});
    if (videoCount === 0) {
        res.send({
            videos: [],
            paginationInfo: {
                disableNext: true,
                total: 0,
            },
        })
        return;
    }

    const skip = chain(Number(offset)).multiply(Number(limit)).done();
    let disableNext = false;
    if (skip >= videoCount) {
        res.status(400).send({messages: ["The requested page is outside of the range."]});
        return;
    } else if (chain(videoCount).subtract(skip).done() < Number(limit)) {
        disableNext = true;
    }

    // find the videos
    const videos = await videoModel.find({class: classDocument, disabled: false, hidden: {$ne: true}})
        .populate({path: "image", model: "Asset"})
        .populate({path: "instructor", model: "Instructor", populate: [{path: "image" ,model: "Asset"}]})
        .populate({path: "class", model: "Class"})
        .populate({path: "categories", model: "Category"})
        .sort({classNumber: 1, creationDate: 1})
        .skip(skip)
        .limit(Number(limit));

    const videosWithURL: Video[] = videos.map((video: DocumentType<Video>) => {
        const v = video.toJSON();
        v.image = addURLtoAsset(v.image);
        v.instructor.image = addURLtoAsset(v.instructor.image);
        return v;
    });

    res.send({
        paginationInfo: {disableNext, total: videoCount},
        videos: videosWithURL
    });
});
