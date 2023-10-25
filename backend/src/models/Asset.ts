import {prop, getModelForClass, Ref} from "@typegoose/typegoose";
import {User} from "@/models/User";
import {Admin} from "@/models/Admin";

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetOwnerType:
 *       type: string
 *       enum:
 *         - Admin
 *         - User
 */
export enum AssetOwnerType {
	Admin = "Admin",
	User = "User",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetCategory:
 *       type: string
 *       enum:
 *         - AdminAssetManager
 *         - UserAssetManager
 */
export enum AssetCategory {
	AdminAssetManager = "AdminAssetManager",
	UserAssetManager = "UserAssetManager",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     FileType:
 *       description: Represents a binary.
 *       type: string
 *       format: binary
 */

/**
 * @swagger
 * components:
 *   responses:
 *     AssetResponse:
 *       description: Enum for each of the different MimeTypes that are allowed.
 *       content:
 *         image/png:
 *           schema:
 *             $ref: '#/components/schemas/FileType'
 *         image/jpeg:
 *           schema:
 *             $ref: '#/components/schemas/FileType'
 *         image/gif:
 *           schema:
 *             $ref: '#/components/schemas/FileType'
 */
export const supportedMimeTypes: string[] = [
	"image/png",
	"image/jpeg",
	"image/gif"
];


/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       description: Represents a file sitting in google cloud storage.
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/_id'
 *         urlExtension:
 *           type: string
 *         url:
 *           description: this doesn't exist in the database, but is created by combining /asset/ with '_id'.
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         mimeType:
 *           type: string
 *         created:
 *           type: number
 *         lastUpdated:
 *           type: number
 *         size:
 *           type: number
 */
export class Asset {

	@prop({
		required: true,
		minLength: 1,
		unique: true,
		index: true,
	})
	urlExtension: string;

	@prop({
		enum: AssetCategory,
		required: true,
	})
	category: AssetCategory;

	@prop({
		enum: AssetOwnerType,
	})
	ownerType?: AssetOwnerType;

	@prop({
		refPath: 'ownerType',
	})
	owner?: Ref<User | Admin>

	@prop({
		minlength: 1
	})
	name: string;

	@prop({
		minlength: 1
	})
	description: string;

	@prop({
		required: true,
		validate: s => supportedMimeTypes.includes(s)
	})
	mimeType: string;

	@prop({
		required: true,
	})
	size: number;

	@prop({
		required: true,
	})
	created?: number;

	@prop({
		required: true,
	})
	lastUpdated?: number;
}

export const assetModel = getModelForClass(Asset);

