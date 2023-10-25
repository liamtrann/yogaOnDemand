import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import Request = Express.Request;
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {Video, videoModel} from "@/models/Video";
import {isNil} from "lodash";
import {validateID} from "@/utils/validateID";
import {chain} from "mathjs";
import {PaginationInfo} from "@/models/PaginationInfo";
import {DocumentType} from "@typegoose/typegoose";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {categoryModel} from "@/models/Category";
import { classModel } from "@/models/Class";
import {TokenType} from "@/models/Token";

/**
 * @swagger
 * components:
 *   schemas:
 *     GetVideosPaginatedResponse:
 *       required:
 *         - paginationInfo
 *         - videos
 *       properties:
 *         paginationInfo:
 *           $ref: '#/components/schemas/PaginationInfo'
 *         videos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Video'
 */
export interface GetVideosPaginatedResponse {
    paginationInfo: PaginationInfo;
    videos: Video[];
}

/**
 * @swagger
 * /video/get_videos_for_category:
 *   get:
 *     operationId: getVideosForCategory
 *     tags:
 *       - video
 *     security:
 *       - User: []
 *     parameters:
 *       - in: query
 *         name: categoryID
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
app.get("/video/get_videos_for_category", userAuthentication(false), async (req: Request<undefined, GetVideosPaginatedResponse | APIError>, res) => {
    const errors: string[] = [];

    const {categoryID, limit, offset} = req.query;

    // validate the category ID
    if (isNil(categoryID)) {
        errors.push("The category ID field was missing.");
    } else {
        const categoryIDErrors = validateID(categoryID);
        if (categoryIDErrors) {
            errors.push(...categoryIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the category
    const category = await categoryModel.findById(categoryID);
    if (isNil(category)) {
        res.status(400).send({messages: ["Could not find a category with the given ID"]});
        return;
    }

    // check if the category is disabled
    if (category.disabled) {
        res.status(400).send({messages: ["This category has been removed."]});
        return;
    }

    // find total number of videos
    const [videosWithAdditionalCategories, classes] = await Promise.all([
        videoModel.find({categories: category, disabled: false, hidden: {$ne: true}}),
        classModel.find({categories: category, disabled: false}),
    ])

    // get the videos in the classes
    const classIds = classes.map(d => d._id);
    const videosInClass = await videoModel.find({class: {$in: classIds}, disabled: false, hidden: {$ne: true}});

    // make single list of videos
    const videos = [...videosWithAdditionalCategories, ...videosInClass];
    const videoIds: string[] = [...new Set(videos.map(d => d._id.toString()))];

    // check if any videos exist
    if (videoIds.length === 0) {
        res.send({
            videos: [],
            paginationInfo: {
                disableNext: true,
                total: 0,
            },
        })
        return;
    }

    // determine pagination information
    const skip = chain(Number(offset)).multiply(Number(limit)).done();
    let disableNext = false;
    if (skip >= videoIds.length) {
        res.status(400).send({messages: ["The requested page is outside of the range."]});
        return;
    } else if (chain(videoIds.length).subtract(skip).done() < Number(limit)) {
        disableNext = true;
    }

    // find the videos
    const videosPopulated = await videoModel.find({_id: {$in: videoIds}})
        .populate({path: "image", model: "Asset"})
        .populate({path: "instructor", model: "Instructor", populate: [{path: "image" ,model: "Asset"}]})
        .populate({path: "class", model: "Class"})
        .populate({path: "categories", model: "Category"})
        .sort({creationDate: 1})
        .skip(skip)
        .limit(Number(limit));

    const videosWithURL: Video[] = videosPopulated.map((video: DocumentType<Video>) => {
        const v = video.toJSON();
        v.image = addURLtoAsset(v.image);
        v.instructor.image = addURLtoAsset(v.instructor.image);
        return v;
    });

    res.send({
        paginationInfo: {disableNext, total: videos.length},
        videos: videosWithURL
    });
});
