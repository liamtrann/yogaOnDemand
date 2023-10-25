import {app} from "@/index";
import {promisify} from "util";
import fs from "fs";
import multer from "multer";
import {Express} from "@/global";
import Request = Express.Request;
import {getUniqueAssetURLExtension} from "@/utils/generateUniqueString";
import {DocumentType} from "@typegoose/typegoose";
import {Asset, AssetCategory, assetModel, AssetOwnerType} from "@/models/Asset";
import {isNil, omitBy} from "lodash";
import {getErrors} from "@/utils/mongooseUtils";
import {assetBucket} from "@/services/googleStorage";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {CreateAssetManagerAssetRequest} from "@/routes/asset/admin_asset_manager/create_asset_manager_asset";
import {chain} from "mathjs";

const upload = multer({dest: "assets/"})

/**
 * @swagger
 * /asset/create_user_asset_manager_asset:
 *   post:
 *     operationId: createUserAssetManagerAsset
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
 *             required:
 *               - asset
 *             properties:
 *               asset:
 *                 description: The binary for the asset
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               urlExtension:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/asset/create_user_asset_manager_asset",
    userAuthentication,
    upload.single("asset"),
    async (req: Request<undefined, undefined, CreateAssetManagerAssetRequest>, res) => {

        let {file, body: {name, description, urlExtension}} = req

        // create async way to remove asset after API
        const unlinkAsync = promisify(fs.unlink);
        async function deleteFile() {
            try {
                await unlinkAsync(file.path);
            } catch {}
        }

        try {

            //check the size
            if (!file || file.size < 1) {
                res.status(400).send({messages: ["A file must be uploaded that is at least 1 byte."]});
                await deleteFile();
                return;
            }

            // check the urlExtension is valid
            if (typeof urlExtension === "string" && urlExtension.length > 0) {

                // check there isn't already an asset with the same extension
                let found: DocumentType<Asset>;
                try {
                    found = await assetModel.findById(urlExtension);
                } catch {}

                if (found !== undefined && found !== null) {
                    res.status(400).send({messages: ["This url extension is already in use."]});
                    await deleteFile();
                    return;
                }
            }
            // if not passed in, get a unique one
            else {
                urlExtension = await getUniqueAssetURLExtension();
            }

            // check if the user has exceeded their maximum space allocated
            const maxSize = 100000000 // 100 MB
            const usersAssets = await assetModel.find({owner: req.user}).populate("size");
            const totalSize = usersAssets.reduce((totalSize: number, asset: Asset) => {
                return totalSize + asset.size;
            }, 0)
            if (chain(totalSize).add(file.size).done() > maxSize) {
                res.status(400).send({messages: [`You have exceeded you maximum allocated space of 100MB`]});
                return;
            }

            // create document
            const date = Date.now();
            const assetDocument = new assetModel(omitBy({
                urlExtension,
                category: AssetCategory.UserAssetManager,
                ownerType: AssetOwnerType.User,
                owner: req.user,
                name: typeof name === "string" && name.length > 0 ? name : undefined,
                description: typeof description === "string" && description.length > 0 ? description : undefined,
                mimeType: file.mimetype,
                size: file.size,
                created: date,
                lastUpdated: date,
            }, isNil));

            // validate document
            const errors = await getErrors(assetDocument);
            if (errors) {
                res.status(400).send(errors);
                await deleteFile();
                return;
            }

            // upload to Google
            await assetBucket.upload(file.path, {
                destination: urlExtension,
                contentType: file.mimetype,
                gzip: true,
            });

            // save document
            await assetDocument.save();

            // send ok and delete local file
            res.sendStatus(200);
            await deleteFile();

        } catch (e) {
            // @ts-ignore
            console.log("e:", e);
            res.status(500).send({messages: ["An unexpected error occurred when uploading the file, please try again."]});
            await deleteFile();
        }

    });
