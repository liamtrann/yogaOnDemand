import {app} from "@/index";
import {Express} from "@/global";
import {APIError} from "@/models/APIError";
import {PaginationInfo} from "@/models/PaginationInfo";
import {isNil} from "lodash";
import {chain} from "mathjs";
import {Instructor, instructorModel} from "@/models/Instructor";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {DocumentType} from "@typegoose/typegoose";
import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import Request = Express.Request;

/**
 * @swagger
 * components:
 *   schemas:
 *     GetInstructorsResponse:
 *       required:
 *         - paginationInfo
 *         - instructors
 *       properties:
 *         paginationInfo:
 *           $ref: '#/components/schemas/PaginationInfo'
 *         instructors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Instructor'
 */
export interface GetInstructorsResponse {
    paginationInfo: PaginationInfo;
    instructors: Instructor[];
}

/**
 * @swagger
 * /instructor/get_instructors:
 *   get:
 *     operationId: getInstructors
 *     tags:
 *       - instructor
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
 *               $ref: '#/components/schemas/GetInstructorsResponse'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/instructor/get_instructors", tokenTypeAuthentication([TokenType.Admin, TokenType.User]), async (req: Request<undefined, GetInstructorsResponse | APIError>, res) => {
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

    // find total number of instructors
    const total = await instructorModel.countDocuments(query);
    if (total === 0) {
        res.send({
            paginationInfo: {disableNext: true, total},
            instructors: []
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

    // find the instructors
    const instructors = await instructorModel.find(query)
        .populate("image")
        .skip(skip)
        .limit(Number(limit));

    const instructorsWithURL: Instructor[] = instructors.map((instructor: DocumentType<Instructor>) => {
        const i = instructor.toJSON();
        i.image = addURLtoAsset(i.image);
        return i;
    });

    res.send({
        paginationInfo: {disableNext, total},
        instructors: instructorsWithURL,
    });
});
