import {DocumentType} from "@typegoose/typegoose";
import {APIError} from "@/models/APIError";

export async function getErrors(document: DocumentType<any>): Promise<APIError | void> {
	return new Promise((resolve: (err?: APIError) => void) => {

		// run the validation async to get any errors that are present from the db
		document.validate(err => {

			// if no error, then all is good and continue
			if (err === undefined || err === null) {
				resolve();
				return;
			}

			// iterate over each possible error and return a message for it.
			const messages: string[] = Object.keys(err.errors).map(key => {
				switch (err.errors[key].kind) {
					case ("unique"):
						return `The '${key}' field needs to be unique.`;
					case ("required"):
						return `The '${key}' field is required.`;
					default:
						return `The '${key}' field is invalid.`;
				}
			})

			// send back possible messages
			resolve({
				messages
			})
		})
	})
}
