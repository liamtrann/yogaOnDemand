import {getModelForClass, prop, Ref} from "@typegoose/typegoose";

/**
 * @swagger
 * components:
 *   responses:
 *     AssetResponse:
 *       description: Enum for each of the different MimeTypes that are allowed.
 *       content:
 *         video/mp4:
 *           schema:
 *             $ref: '#/components/schemas/FileType'
 */
export const supportedVideoSourceContentTypes: string[] = [
	"video/mp4",
];

/**
 * @swagger
 * components:
 *   schemas:
 *     VideoSource:
 *       required:
 *         - _id
 *         - creationDate
 *         - contentType
 *         - lastUpdated
 *         - size
 *         - videoLength
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         creationDate:
 *           type: number
 *         gcpFileName:
 *           type: string
 *         contentType:
 *           type: string
 *         lastUpdated:
 *           type: number
 *         size:
 *           type: number
 *         videoLength:
 *           type: number
 */
export class VideoSource {
	@prop({
		required: true,
	})
	creationDate: number;

	@prop({
		required: true,
	})
	contentType: string;

	@prop({
		required: true,
		unique: true
	})
	gcpFileName: string;

	@prop({
		required: true,
	})
	lastUpdated: number;

	@prop({
		required: true,
	})
	size: number;

	@prop({
		required: true
	})
	videoLength: number;

	@prop({
		required: true,
		default: false
	})
	disabled: boolean;
}
export const videoSourceModel = getModelForClass(VideoSource);