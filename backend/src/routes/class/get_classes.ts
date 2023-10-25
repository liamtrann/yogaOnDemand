import {app} from "@/index";
import {Express} from "@/global";
import {APIError} from "@/models/APIError";
import {PaginationInfo} from "@/models/PaginationInfo";
import {isNil} from "lodash";
import {chain} from "mathjs";
import {Class, classModel} from "@/models/Class";
import Request = Express.Request;
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {DocumentType, prop, Ref} from "@typegoose/typegoose";
import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";

/**
 * @swagger
 * components:
 *   schemas:
 *     GetClassesResponse:
 *       required:
 *         - paginationInfo
 *         - classes
 *       properties:
 *         paginationInfo:
 *           $ref: '#/components/schemas/PaginationInfo'
 *         classes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Class'
 */
export interface GetClassesResponse {
    paginationInfo: PaginationInfo;
    classes: Class[];
}

/**
 * @swagger
 * /class/get_classes:
 *   get:
 *     operationId: getClasses
 *     tags:
 *       - class
 *     security:
 *       - TokenDependant: []
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
app.get("/class/get_classes", tokenTypeAuthentication([TokenType.Admin, TokenType.User]), async (req: Request<undefined, GetClassesResponse | APIError>, res) => {
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

    const query = {disabled: false};

    // find total number of classes
    const total = await classModel.countDocuments(query);
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

    // find the classes
    const classes = await classModel.find(query)
        .populate("categories image")
        .skip(skip)
        .limit(Number(limit));

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
