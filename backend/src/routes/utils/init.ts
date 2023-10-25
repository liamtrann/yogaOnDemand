import {app} from "@/index";
import adminInit from "@/utils/init_functions/adminInit";
import {APIError, isAPIError} from "@/models/APIError";
import {isNil} from "lodash";
import addFavoritesArrayToUsers from "@/utils/init_functions/addFavoritesArrayToUsers";

/**
 * @swagger
 * /utils/init:
 *   get:
 *     description: A safe public API to initialize the server. This API is sustainable to even if compromised, it will not cause problems.
 *     operationId: init
 *     tags:
 *       - utils
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/utils/init", (req, res) => {

	function findErrors(errArray: Array<void | APIError | Error>) {
		if (isNil(errArray) || (Array.isArray(errArray) && errArray.length < 1)) {
			res.sendStatus(200);
			return;
		}

		if (!Array.isArray(errArray)) {
			res.status(400).send({messages: ["unexpected response of init", JSON.stringify(errArray)]});
			return;
		}

		const errorResponse: APIError = {
			messages: [],
		}

		for (const err of errArray) {
			if (isNil(err)) {
				continue;
			}

			if (isAPIError(err)) {
				errorResponse.messages = [...errorResponse.messages, ...(err as APIError).messages];
				continue;
			}

			if (err instanceof Error) {
				errorResponse.messages.push("An unidentified error has occurred: " + (err as Error).message);
				continue;
			}

			errorResponse.messages.push("An unidentified error occurred");
		}

		if (errorResponse.messages.length > 0) {
			res.status(400).send(errorResponse);
			return;
		}

		res.sendStatus(200);
	}
	Promise.all([
		adminInit(),
		addFavoritesArrayToUsers(),
	])
		.then(findErrors)
		.catch(findErrors)

})

export type InitFunction = () => Promise<void | APIError | Error>;
