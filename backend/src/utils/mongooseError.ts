import {Document} from "mongoose";
import {APIError, isAPIError} from "@/models/APIError";

/**
 * converts mongoose errors to APIErrors
 * @param document
 */
async function getMongooseErrors(document: Document): Promise<APIError | void> {
    return new Promise((r: (err?: APIError) => void) => {
        document.validate(err => {
            if (!err) {
                r();
                return;
            }

            // if the error is already an API error, then return it
            if (isAPIError(err)) {
                return err;
            }

            // if the error is just a string then format it to an API error
            if (typeof err === "string") {
                return {messages: [err]};
            }

            // if the error is a string array then format it to an API error
            if (Array.isArray(err) && err.every(v => typeof v === "string")) {
                return {messages: err};
            }

            // format the error if there is one, this format is from mongo directly
            const messages: string[] = Object.keys(err.errors).map(key => {
                const formattedKey = convertCamelCaseToRegular(key);
                switch (err.errors[key].kind) {
                    case ("unique"):
                        return `'${formattedKey}' field must be unique.`;
                    case ("required"):
                        return `'${formattedKey}' field is required.`;
                    default:
                        return `'${formattedKey}' field is invalid.`;
                }
            });

            r({
                messages
            });
        });
    });
}

function convertCamelCaseToRegular(s: string) {
    return s.replace(/([A-Z])/g, ' $1')
        // uppercase the first character
        .replace(/^./, function(str){ return str.toUpperCase(); })
}

export {getMongooseErrors};