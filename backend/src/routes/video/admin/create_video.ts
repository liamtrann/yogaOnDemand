import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError, isAPIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {getMongooseErrors} from "@/utils/mongooseError";
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
 *     CreateVideoBody:
 *       required:
 *         - hidden
 *         - isTopPick
 *         - classID
 *         - description
 *         - instructorID
 *         - videoSourceID
 *         - level
 *         - experience
 *         - categoryIDs
 *         - equipment
 *         - intervals
 *         - imageID
 *       properties:
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
interface CreateVideoBody {
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
 * /video/create_video:
 *   post:
 *     description: Used by admins to create a new video
 *     operationId: createVideo
 *     tags:
 *       - video
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVideoBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/video/create_video", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, CreateVideoBody>, res) => {
    const errors: string[] = [];
    const creationDate: number = Date.now();

    const {
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
    if (isNil(hidden)) {
        errors.push("The hidden field was missing.");
    } else if (typeof hidden !== "boolean") {
        errors.push("The hidden field was invalid.");
    }

    if (isNil(isTopPick)) {
        errors.push("The isTopPick field was missing.");
    } else if (typeof isTopPick !== "boolean") {
        errors.push("The isTopPick field was invalid.");
    }

    if (isNil(classID)) {
        errors.push("The class ID field was missing.");
    } else {
        const classIDErrors = validateID(classID);
        if (classIDErrors) {
            errors.push(...classIDErrors.messages);
        }
    }

    if (isNil(description)) {
        errors.push("The description field was missing.");
    }

    if (isNil(instructorID)) {
        errors.push("The instructor ID field was missing.");
    } else {
        const instructorIDErrors = validateID(instructorID);
        if (instructorIDErrors) {
            errors.push(...instructorIDErrors.messages);
        }
    }

    if (isNil(videoSourceID)) {
        errors.push("The video source ID field was missing.");
    } else {
        const videoSourceIDErrors = validateID(videoSourceID);
        if (videoSourceIDErrors) {
            errors.push(...videoSourceIDErrors.messages);
        }
    }

    if (isNil(level)) {
        errors.push("The level field was missing.");
    }

    if (isNil(experience)) {
        errors.push("The experience field was missing.");
    }

    if (isNil(categoryIDs)) {
        errors.push("The category IDs field was missing.");
    } else {
        for (const categoryID of categoryIDs) {
            const categoryIDErrors = validateID(categoryID);
            if (categoryIDErrors) {
                errors.push(...categoryIDErrors.messages);
            }
        }
    }

    if (isNil(equipment)) {
        errors.push("The equipment field was missing.");
    } else {
        for (const equipmentItem of equipment) {
            if (!Object.values(Equipment).includes(equipmentItem)) {
                errors.push("The equipment was invalid.");
                break;
            }
        }
    }

    if (isNil(intervals)) {
        errors.push("The intervals field was missing.");
    }

    if (isNil(imageID)) {
        errors.push("The image ID field was missing.");
    } else {
        const imageIDErrors = validateID(imageID);
        if (imageIDErrors) {
            errors.push(...imageIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the class
    const classDocument = await classModel.findById(classID);
    if (isNil(classDocument)) {
        res.status(400).send({messages: ["Could not find a class with the given ID."]});
        return;
    }

    // find the image
    const image = await assetModel.findById(imageID);
    if (isNil(image)) {
        res.status(400).send({messages: ["Could not find a image with the given ID."]});
        return;
    }

    // find the instructor
    const instructor = await instructorModel.findById(instructorID);
    if (isNil(instructor)) {
        res.status(400).send({messages: ["Could not find a instructor with the given ID."]});
        return;
    }

    // find the video source
    const videoSource = await videoSourceModel.findById(videoSourceID);
    if (isNil(videoSource)) {
        res.status(400).send({messages: ["Could not find a video source with the given ID."]});
        return;
    }

    // check that the classNumber is unique if it exists
    if (!isNil(classNumber)) {
        const duplicateClassNumberVideo = await videoModel.findOne({class: classDocument, classNumber, disabled: false});
        if (!isNil(duplicateClassNumberVideo)) {
            res.status(400).send({messages: [`The already exists a video in this class with class number: ${classNumber}`]});
            return;
        }
    }

    // find the categories
    const categories: Category[] = await Promise.all(categoryIDs.map(async (categoryID: string) => {
        const category: Category = await categoryModel.findById(categoryID);
        if (isNil(category)) {
            res.status(400).send({messages: [`Could not find a category with the given ID: ${categoryID}.`]});
            return;
        }

        return category;
    }));

    // create db document
    const video = new videoModel(omitBy({
        disabled: false,
        hidden,
        isTopPick,
        class: classDocument,
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
        creationDate,
        dateLastUpdated: creationDate,
        image
    }, isNil))

    // validate
    const mongooseErrors = await getMongooseErrors(video);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // save
    await video.save();
    res.sendStatus(200);
})