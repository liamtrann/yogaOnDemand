import {app} from "@/index";

/**
 * @swagger
 * /utils/health:
 *   get:
 *     description: Should always return a status code of 200. Used to determine if the server is up and working.
 *     operationId: health
 *     tags:
 *       - utils
 *     responses:
 *       '200':
 *         description: OK
 */
app.get("/utils/health", (req, res) => {
	res.sendStatus(200);
})