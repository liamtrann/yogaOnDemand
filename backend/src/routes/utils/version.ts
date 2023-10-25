import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;

/**
 * @swagger
 * components:
 *   schemas:
 *     VersionResponse:
 *       required:
 *         - version
 *       properties:
 *         version:
 *           type: string
 */
interface VersionResponse {
    version: string
}

/**
 * @swagger
 * /utils/version:
 *   get:
 *     description: Finds what version of the app you are using
 *     operationId: version
 *     tags:
 *       - utils
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VersionResponse'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/utils/version", (req: Request<undefined, VersionResponse>, res) => {
    res.status(200).send({version: process.env.REACT_APP_VERSION});
})