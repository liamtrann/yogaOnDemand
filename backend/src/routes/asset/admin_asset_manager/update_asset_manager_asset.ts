import {app} from "@/index";
import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {promisify} from "util";
import fs from "fs";
import multer from "multer";
import {Express} from "@/global";
import Request = Express.Request;
import {DocumentType} from "@typegoose/typegoose";
import {Asset, AssetCategory, assetModel} from "@/models/Asset";
import {isNil, omitBy} from "lodash";
import {getErrors} from "@/utils/mongooseUtils";
import {assetBucket} from "@/services/googleStorage";

const upload = multer({dest: "assets/"})

export interface UpdateAssetManagerAssetRequest {
	_id: string;
	asset: any;
	name?: string;
	description?: string;
}

/**
 * @swagger
 * /asset/update_asset_manager_asset:
 *   post:
 *     operationId: updateAssetManagerAsset
 *     tags:
 *       - asset
 *     security:
 *       - Admin: []
 *     description: Uploads an asset to the asset manager for admins.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               asset:
 *                 description: The binary for the asset
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/asset/update_asset_manager_asset",
	adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]),
	upload.single("asset"),
	async (req: Request<undefined, undefined, UpdateAssetManagerAssetRequest>, res) => {

		let {file, body: {name, description, _id}} = req

		// create async way to remove asset after API
		const unlinkAsync = promisify(fs.unlink);
		async function deleteFile() {
			try {
				await unlinkAsync(file.path);
			} catch {}
		}

		try {

			// find the previous asset
			const assetDoc = await assetModel.findById({_id});
			if (isNil(assetDoc)) {
				res.status(400).send({messages: ["Could not find the asset to update."]});
				return;
			}

			if (assetDoc.category !== AssetCategory.AdminAssetManager) {
				res.status(400).send({messages: ["Given asset was not a admin asset manager type asset."]});
				return;
			}

			//if no file, update the other parts
			if (!file) {
				// save update to database
				await assetModel.findByIdAndUpdate(_id, omitBy({
					lastUpdated: Date.now(),
					owner: req.admin,
					name: typeof name === "string" && name.length > 0 ? name : undefined,
					description: typeof description === "string" && description.length > 0 ? description : undefined,
				}, isNil))
				res.sendStatus(200);
				return;
			}

			if (file.size < 1) {
				res.status(400).send({messages: ["A file must be uploaded that is at least 1 byte."]});
				await deleteFile();
				return;
			}

			let assetDocument: DocumentType<Asset>;
			try {
				assetDocument = await assetModel.findById(_id);
			} catch {}

			if (assetDocument === undefined || assetDocument === null) {
				res.status(400).send({messages: ["Asset was not found."]});
				await deleteFile();
				return;
			}

			// validate document
			const errors = await getErrors(assetDocument);
			if (errors) {
				res.status(400).send(errors);
				await deleteFile();
				return;
			}

			// upload to Google
			await assetBucket.upload(file.path, {
				destination: assetDoc.urlExtension,
				contentType: file.mimetype,
				gzip: true,
			});

			// save update to database
			await assetModel.findByIdAndUpdate(_id, omitBy({
				lastUpdated: Date.now(),
				owner: req.admin,
				mimeType: file.mimetype,
				size: file.size,
				name: typeof name === "string" && name.length > 0 ? name : undefined,
				description: typeof description === "string" && description.length > 0 ? description : undefined,
			}, isNil))

			// send ok and delete local file
			res.sendStatus(200);
			await deleteFile();

		} catch {
			res.status(500).send({messages: ["An unexpected error occurred when uploading the file, please try again."]});
			await deleteFile();
		}


	});
