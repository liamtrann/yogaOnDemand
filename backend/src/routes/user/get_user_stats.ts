import {app} from "@/index";
import {Express} from "@/global";
import {APIError} from "@/models/APIError";
import Request = Express.Request;
import userAuthentication from "@/middleware/authentication/userAuthentication";
import calculateUserStats from "@/utils/levels/calculateUserStats";
import {UserStats} from "@/models/UserStats";
import {isNil} from "lodash";

/**
 * @swagger
 * /user/get_user_stats:
 *   get:
 *     description: Used to get the current stats of a user
 *     operationId: getUserStats
 *     tags:
 *       - user
 *     security:
 *       - User: []
 *     parameters:
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: number
 *         required: true
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: number
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStats'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/user/get_user_stats", userAuthentication(false), async (req: Request<undefined, UserStats | APIError>, res) => {
    const errors: string[] = [];
    let {startTime, endTime} = req.query;

    // validate query
    if (isNil(startTime)) {
        errors.push("The start time field was missing.");
    } else if (typeof startTime !== "string" || isNaN(Number(startTime))) {
        errors.push("The start time field was invalid.");
    }

    if (isNil(endTime)) {
        errors.push("The end time field was missing.");
    } else if (typeof endTime !== "string" || isNaN(Number(endTime))) {
        errors.push("The end time field was invalid.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    const userStats = await calculateUserStats(req.user, undefined, Number(startTime), Number(endTime));

    // userStats is already UserStats | APIError
    res.send(userStats);
});
