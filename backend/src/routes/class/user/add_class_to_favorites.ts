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
 * /class/add_class_to_favorites:
 *   put:
 *     description: Used by users to add a class to their favorites.
 *     operationId: addClassToFavorites
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
 *         description: Success. Class has been add to favorites.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/class/add_class_to_favorites", userAuthentication(false), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
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
    const favoritedClass = await classModel.findById(classID);
    if (isNil(favoritedClass)) {
        res.status(400).send({messages: ["Could not find a class with the given ID."]});
        return;
    }

    // get the user's favorites
    const {favoriteClasses} = await userModel.findById(req.user._id).select("favoriteClasses");

    // check if the class is already in the list
    if (favoriteClasses.includes(favoritedClass.id)) {
        res.status(400).send({messages: ["This class is already favorited."]});
        return;
    }

    // add the class to favorites
    favoriteClasses.push(favoritedClass);

    // update user with new favorited classes list
    await userModel.findByIdAndUpdate(req.user._id, {favoriteClasses});

    res.sendStatus(200);
});