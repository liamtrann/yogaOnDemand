import {app} from "@/index";
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
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {UpdateAssetManagerAssetRequest} from "@/routes/asset/admin_asset_manager/update_asset_manager_asset";
import {chain} from "mathjs";

const upload = multer({dest: "assets/"})

/**
 * @swagger
 * /asset/update_user_asset_manager_asset:
 *   post:
 *     operationId: updateUserAssetManagerAsset
 *     tags:
 *       - asset
 *     security:
 *       - User: []
 *     description: Uploads an asset to the asset manager for users.
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
app.post("/asset/update_user_asset_manager_asset",
    userAuthentication,
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

            if (assetDoc.category !== AssetCategory.UserAssetManager) {
                res.status(400).send({messages: ["Given asset was not a admin asset manager type asset."]});
                return;
            }

            if (assetDoc.owner !== req.user) {
                res.status(400).send({messages: ["User is not the owner of this asset."]});
                return;
            }

            //if no file, update the other parts
            if (!file) {
                // save update to database
                await assetModel.findByIdAndUpdate(_id, omitBy({
                    lastUpdated: Date.now(),
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

            // check if the user has exceeded their maximum space allocated
            const maxSize = 100000000 // 100 MB
            const usersAssets = await assetModel.find({owner: req.user}).populate("size");
            const totalSize = usersAssets.reduce((totalSize: number, asset: Asset) => {
                return totalSize + asset.size;
            }, 0)
            if (chain(totalSize).add(file.size).subtract(assetDocument.size).done() > maxSize) {
                res.status(400).send({messages: [`You have exceeded you maximum allocated space of 100MB`]});
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
            // this is overwrite the old asset
            await assetBucket.upload(file.path, {
                destination: assetDoc.urlExtension,
                contentType: file.mimetype,
                gzip: true,
            });

            // save update to database
            await assetModel.findByIdAndUpdate(_id, omitBy({
                lastUpdated: Date.now(),
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
