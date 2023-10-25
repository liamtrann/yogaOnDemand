import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {userModel} from "@/models/User";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {isNil} from "lodash";
import {validateID} from "@/utils/validateID";
import {classModel} from "@/models/Class";
import {IDBody} from "@/models/IDBody";

/**
 * @swagger
 * /class/remove_class_from_favorites:
 *   put:
 *     description: Used by users to remove a class from their favorites.
 *     operationId: removeClassFromFavorites
 *     tags:
 *       - class
 *     security:
 *       - User: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IDBody'
 *     responses:
 *       '200':
 *         description: Success. Class has been removed from favorites.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/class/remove_class_from_favorites", userAuthentication(false), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];
    const {id: classID} = req.body;

    //validation
    if (isNil(classID)) {
        errors.push("The class ID field was missing.");
    } else if (typeof classID !== "string") {
        errors.push("The class id field was invalid.");
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

    // get the class
    const classToRemove = await classModel.findById(classID);
    if (isNil(classToRemove)) {
        res.status(400).send({messages: ["Could not find a class with the given ID."]});
        return;
    }

    // get the user's favorites
    const {favoriteClasses} = await userModel.findById(req.user._id).select("favoriteClasses");

    // find the index of the class and remove it
    const indexOfClass = favoriteClasses.findIndex((id) => id.toString() === classToRemove.id.toString());

    if (indexOfClass >= 0) {
        favoriteClasses.splice(indexOfClass, 1);
    }

    // update user with new favorited classes list
    await userModel.findByIdAndUpdate(req.user._id, {favoriteClasses});

    res.sendStatus(200);
});