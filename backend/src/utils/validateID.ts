import {APIError} from "@/models/APIError";
import {mongoose} from "@typegoose/typegoose";

export function validateID(id: any): void | APIError {
    try {
        mongoose.Types.ObjectId(id);
    } catch {
        return {messages: ["An invalid reference was requested."]};
    }
}