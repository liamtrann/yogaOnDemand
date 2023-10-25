import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {Express} from "@/global";
import {Equipment, VideoInterval, videoModel} from "@/models/Video";
import Request = Express.Request;
import {validateID} from "@/utils/validateID";
import {classModel} from "@/models/Class";
import {instructorModel} from "@/models/Instructor";
import {videoSourceModel} from "@/models/VideoSource";
import {Category, categoryModel} from "@/models/Category";
import {assetModel} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     EditVideoBody:
 *       required:
 *         - videoID
 *       properties:
 *         videoID:
 *           type: string
 *         hidden:
 *           type: boolean
 *         isTopPick:
 *           type: boolean
 *         classID:
 *           type: string
 *         classNumber:
 *           type: number
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         instructorID:
 *           type: string
 *         videoSourceID:
 *           type: string
 *         level:
 *           type: number
 *         experience:
 *           type: number
 *         categoryIDs:
 *           type: array
 *           items:
 *             type: string
 *         equipment:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Equipment'
 *         intervals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VideoInterval'
 *         imageID:
 *           type: string
 */
interface EditVideoBody {
    videoID: string;
    hidden: boolean;
    isTopPick: boolean;
    classID: string;
    classNumber: number;
    name: string;
    description: string;
    instructorID: string;
    videoSourceID: string;
    level: number;
    experience: number;
    categoryIDs: string[];
    equipment: Equipment[];
    intervals: VideoInterval[];
    imageID: string;
}

/**
 * @swagger
 * /video/edit_video:
 *   put:
 *     description: Used by admins to edit a video
 *     operationId: editVideo
 *     tags:
 *       - video
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditVideoBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/video/edit_video", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, EditVideoBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {
        videoID,
        hidden,
        isTopPick,
        classID,
        classNumber,
        name,
        description,
        instructorID,
        videoSourceID,
        level,
        experience,
        categoryIDs,
        equipment,
        intervals,
        imageID
    } = req.body;

    //validation
    if (isNil(videoID)) {
        errors.push("The video ID field was missing.");
    } else {
        const videoIDErrors = validateID(videoID);
        if (videoIDErrors) {
            errors.push(...videoIDErrors.messages);
        }
    }

    if (!isNil(hidden)) {
        if (typeof hidden !== "boolean") {
            errors.push("The hidden field was invalid.");
        }
    }

    if (!isNil(isTopPick)) {
        if (typeof isTopPick !== "boolean") {
            errors.push("The isTopPick field was invalid.");
        }
    }

    if (!isNil(classID)) {
        const classIDErrors = validateID(classID);
        if (classIDErrors) {
            errors.push(...classIDErrors.messages);
        }
    }

    if (!isNil(instructorID)) {
        const instructorIDErrors = validateID(instructorID);
        if (instructorIDErrors) {
            errors.push(...instructorIDErrors.messages);
        }
    }

    if (!isNil(videoSourceID)) {
        const videoSourceIDErrors = validateID(videoSourceID);
        if (videoSourceIDErrors) {
            errors.push(...videoSourceIDErrors.messages);
        }
    }

    if (!isNil(categoryIDs)) {
        for (const categoryID of categoryIDs) {
            const categoryIDErrors = validateID(categoryID);
            if (categoryIDErrors) {
                errors.push(...categoryIDErrors.messages);
            }
        }
    }

    if (!isNil(equipment)) {
        for (const equipmentItem of equipment) {
            if (!Object.values(Equipment).includes(equipmentItem)) {
                errors.push("The equipment was invalid.");
                break;
            }
        }
    }

    if (isNil(imageID)) {
        errors.push("The image ID field was missing.");
    } else {
        const imageIDErrors = validateID(imageID);
        if (imageIDErrors) {
            errors.push("The image ID was invalid.");
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the video
    const oldVideo = await videoModel.findById(videoID);
    if (isNil(oldVideo)) {
        res.status(400).send({messages: ["Could not find a video with the given ID."]});
        return;
    }

    // check if the video is disabled
    if (oldVideo.disabled) {
        res.status(400).send({messages: ["This video has been removed."]});
        return;
    }

    // find the class
    let classDocument;
    if (!isNil(classID)) {
        classDocument = await classModel.findById(classID);
        if (isNil(classDocument)) {
            res.status(400).send({messages: ["Could not find a class with the given ID."]});
            return;
        }
    }

    // find the instructor
    let instructor;
    if (!isNil(instructorID)) {
        instructor = await instructorModel.findById(instructorID);
        if (isNil(instructor)) {
            res.status(400).send({messages: ["Could not find a instructor with the given ID."]});
            return;
        }
    }

    // find the video source
    let videoSource;
    if (!isNil(videoSourceID)) {
        videoSource = await videoSourceModel.findById(videoSourceID);
        if (isNil(videoSource)) {
            res.status(400).send({messages: ["Could not find a video source with the given ID."]});
            return;
        }
    }

    // check that the classNumber is unique if it exists
    if (!isNil(classNumber)) {
        const duplicateClassNumberVideo = await videoModel.findOne({class: classDocument, classNumber, disabled: false, _id: {$ne: videoID}});
        if (!isNil(duplicateClassNumberVideo)) {
            res.status(400).send({messages: [`The already exists a video in this class with class number: ${classNumber}`]});
            return;
        }
    }

    // find the categories
    let categories: Category[];
    if (!isNil(categoryIDs)) {
        categories = await Promise.all(categoryIDs.map(async (categoryID: string) => {
            const category: Category = await categoryModel.findById(categoryID);
            if (isNil(category)) {
                res.status(400).send({messages: [`Could not find a category with the ID: ${categoryID}.`]});
                return;
            }

            return category;
        }));
    }

    // find the image
    const image = await assetModel.findById(imageID);
    if (isNil(image)) {
        res.status(400).send({messages: ["Could not find a image with the given ID."]});
        return;
    }

    // update the video
    await videoModel.findByIdAndUpdate(videoID, omitBy({
        class: classDocument,
        hidden,
        isTopPick,
        classNumber,
        name,
        description,
        instructor,
        videoSource,
        level,
        experience,
        categories,
        equipment,
        intervals,
        image,
        dateLastUpdated,
    }, isNil))

    res.sendStatus(200);
})