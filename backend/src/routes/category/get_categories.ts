import {app} from "@/index";
import {Express} from "@/global";
import {APIError} from "@/models/APIError";
import {Category, categoryModel} from "@/models/Category";
import {PaginationInfo} from "@/models/PaginationInfo";
import {isNil} from "lodash";
import {chain} from "mathjs";
import tokenTypeAuthentication from "@/middleware/authentication/tokenTypeAuthentication";
import {TokenType} from "@/models/Token";
import {DocumentType} from "@typegoose/typegoose";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import Request = Express.Request;

/**
 * @swagger
 * components:
 *   schemas:
 *     GetCategoriesResponse:
 *       required:
 *         - paginationInfo
 *         - categories
 *       properties:
 *         paginationInfo:
 *           $ref: '#/components/schemas/PaginationInfo'
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 */
export interface GetCategoriesResponse {
    paginationInfo: PaginationInfo;
    categories: Category[];
}

/**
 * @swagger
 * /category/get_categories:
 *   get:
 *     operationId: getCategories
 *     tags:
 *       - category
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
 *               $ref: '#/components/schemas/GetCategoriesResponse'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/category/get_categories", tokenTypeAuthentication([TokenType.Admin, TokenType.User]), async (req: Request<undefined, GetCategoriesResponse | APIError>, res) => {
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

    const query = req.token.tokenType === TokenType.Admin ? {} : {disabled: false};

    // find total number of categories
    const total = await categoryModel.countDocuments(query);
    if (total === 0) {
        res.send({
            paginationInfo: {disableNext: true, total},
            categories: []
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

    // find the categories
    const categories: DocumentType<Category>[] = await categoryModel.find(query).populate("image")
        .skip(skip)
        .limit(Number(limit));

    const categoriesWithURL: Category[] = categories.map((category: DocumentType<Category>) => {
        const c = category.toJSON();
        c.image = addURLtoAsset(c.image);
        return c;
    });

    res.send({
        paginationInfo: {disableNext, total},
        categories: categoriesWithURL,
    });
});