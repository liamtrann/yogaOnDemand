import {app} from "@/index";
import {Express} from "@/global";
import {APIError} from "@/models/APIError";
import {isNil} from "lodash";
import {chain} from "mathjs";
import {Class, classModel} from "@/models/Class";
import Request = Express.Request;
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {DocumentType} from "@typegoose/typegoose";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {GetClassesResponse} from "@/routes/class/get_classes";
import {userModel} from "@/models/User";

/**
 * @swagger
 * /class/get_favorite_classes:
 *   get:
 *     operationId: getFavoriteClasses
 *     tags:
 *       - class
 *     security:
 *       - User: []
 *     parameters:
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
 *               $ref: '#/components/schemas/GetClassesResponse'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/class/get_favorite_classes", userAuthentication(false), async (req: Request<undefined, GetClassesResponse | APIError>, res) => {
    const errors: string[] = [];

    const {limit, offset} = req.query;

    // validate
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

    // get favorite classes
    const {favoriteClasses} = await userModel.findById(req.user.id)
        .select("favoriteClasses")
        .populate({
            path: "favoriteClasses",
            model: "Class",
            populate: [
                {path: "categories", model: "Category"},
                {path: "image", model: "Asset"}
            ]
        });

    // remove disabled classes
    favoriteClasses.filter((c: Class) => !c.disabled);

    // find total number of favorite classes
    const total = favoriteClasses.length;
    if (total === 0) {
        res.send({
            paginationInfo: {disableNext: true, total},
            classes: []
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

    // sort and slice the array
    const classes = favoriteClasses.sort((a: Class, b: Class) => {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        } else {
            return 0;
        }
    }).slice(skip, skip + limit);

    const classesWithURL: Class[] = classes.map((_class: DocumentType<Class>) => {
        const i = _class.toJSON();
        i.image = addURLtoAsset(i.image);
        return i;
    });

    res.send({
        paginationInfo: {disableNext, total},
        classes: classesWithURL,
    });
});
