/**
 * @swagger
 * components:
 *   schemas:
 *     APIError:
 *       description: A model for errors that can be returned from the backend.
 *       required:
 *         - messages
 *       properties:
 *         messages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["There was an error with your request."]
 *         requiredSubscriptionError:
 *           description: This is returned in the case where the user requires a subscription to use this api.
 *           type: boolean
 */
export interface APIError {
    messages: string[];
    requiredSubscriptionError?: boolean;
}

/**
 * @swagger
 * components:
 *   responses:
 *     APIError:
 *       description: An error response that can be returned from the backend.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/APIError'
 */

/**
 * Utility for checking if an object in an API Error
 */
export function isAPIError(obj: any): boolean {
   return obj.hasOwnProperty("messages") && Array.isArray(obj.messages) && obj.messages.every(v => typeof v === "string");
}

/**
 * Utility for turning APIError into an Error
 */
export function convertAPIErrorToError(apiError: APIError): Error & {apiError: APIError} {
    const message = apiError.messages.reduce((prevValue, newValue) => prevValue + ", " + newValue, "");
    const error = new Error(message);
    return {...error, apiError};
}