import {NextFunction, Response} from "express";
import {APIError} from "@/models/APIError";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     Cron:
 *       description: Authentication for cron functions, the password is set in the environment variables
 *       type: apiKey
 *       in: query
 *       name: api-key
 */
const cronAuthentication = async (req, res: Response<APIError>, next: NextFunction) => {
    const apiKey = req.query["api-key"];

    // see if authorization exists in header
    if (typeof apiKey !== "string") {
        res.status(400).send({
            messages: ["You must have an api-key to continue authentication."]
        });
        return;
    }

    if (apiKey !== process.env.CRON_PASSWORD) {
        res.status(400).send({
            messages: ["cron authentication password was invalid."],
        })
        return;
    }

    next();
};

export default cronAuthentication;