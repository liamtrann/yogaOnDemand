import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import {Video, videoModel} from "@/models/Video";
import {isNil} from "lodash";
import {validateID} from "@/utils/validateID";
import {classModel} from "@/models/Class";
import {chain} from "mathjs";
import {PaginationInfo} from "@/models/PaginationInfo";
import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import Request = Express.Request;
import {Instructor, instructorModel} from "@/models/Instructor";
import {DocumentType} from "@typegoose/typegoose";
import {addURLtoAsset} from "@/utils/addURLToAsset";

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchForVideosResponse:
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
export interface SearchForVideosResponse {
    paginationInfo: PaginationInfo;
    videos: Video[];
}

/**
 * @swagger
 * /video/search_for_videos:
 *   get:
 *     operationId: searchForVideos
 *     tags:
 *       - video
 *     security:
 *       - TokenDependant: []
 *     parameters:
 *       - in: query
 *         name: searchString
 *         schema:
 *           type: string
 *       - in: query
 *         name: classID
 *         schema:
 *           type: string
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
 *               $ref: '#/components/schemas/SearchForVideosResponse'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/video/search_for_videos", tokenTypeAuthentication([TokenType.Admin, TokenType.User]), async (req: Request<undefined, SearchForVideosResponse | APIError>, res) => {
    const errors: string[] = [];

    const {searchString, classID, limit, offset} = req.query;

    // validate the class ID
    if (!isNil(classID)) {
        const classIDErrors = validateID(classID);
        if (classIDErrors) {
            errors.push(...classIDErrors.messages);
        }
    }

    if (isNil(limit)) {
        errors.push("The limit field was missing.");
    }

    if (isNil(offset)) {
        errors.push("The offset field was missing.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the class
    let classDocument;
    if (!isNil(classID)) {
        classDocument = await classModel.findById(classID);
        if (isNil(classDocument)) {
            res.status(400).send({messages: ["Could not find a class with the given ID"]});
            return;
        }

        // check if the class is disabled
        if (classDocument.disabled) {
            res.status(400).send({messages: ["This class has been removed."]});
            return;
        }
    }

    const query = {disabled: false};

    // hide hidden videos from users
    if (req.token.tokenType === TokenType.User) {
        query["hidden"] = {$ne: true};
    }

    if (!isNil(classID)) {
        query["class"] = classDocument;
    }

    if (!isNil(searchString) && searchString !== "" && typeof searchString === "string") {
        const matchingClasses = await classModel.find({name: {$regex: searchString, $options: "i"}}).select("_id");
        const matchingInstructors = await instructorModel.find({name: {$regex: searchString, $options: "i"}}).select("_id");

        query["$or"] = [
            {name: {$regex: searchString, $options: "i"}},
            {class: {$in: matchingClasses}},
            {instructor: {$in: matchingInstructors}},
        ]

        if (!isNaN(Number(searchString))) {
            query["$or"].push({classNumber: Number(searchString)});
        }
    }

    // find total number of videos
    const total = await videoModel.countDocuments(query);
    if (total === 0) {
        res.send({
            paginationInfo: {disableNext: true, total},
            videos: []
        })
        return;
    }

    const skip = chain(Number(offset)).multiply(Number(limit)).done();
    let disableNext = false;
    if (skip >= total) {
        res.status(400).send({messages: ["The requested page is outside of the range."]});
        return;
    } else if (chain(total).subtract(skip).done() < Number(limit)) {
        disableNext = true;
    }

    // find the videos
    const videos = await videoModel.find(query)
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
        paginationInfo: {disableNext, total},
        videos: videosWithURL
    });
});
