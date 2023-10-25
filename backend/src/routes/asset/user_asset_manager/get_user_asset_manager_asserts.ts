import {app} from "@/index";
import {Asset, AssetCategory, assetModel} from "@/models/Asset";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import userAuthentication from "@/middleware/authentication/userAuthentication";

/**
 * @swagger
 * /asset/get_user_asset_manager_assets:
 *   get:
 *     description: Gets all assets this user owns from the user asset manager.
 *     operationId: getUserAssetManagerAssets
 *     tags:
 *       - asset
 *     security:
 *       - User: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/asset/get_user_asset_manager_assets", userAuthentication, async (req: Request<undefined, (Asset & {url: string})[] | APIError>, res) => {
    const assets = await assetModel
        .find({category: AssetCategory.UserAssetManager, owner: req.user})
        .populate("owner");
    const assetsWithURL = assets.map(a => addURLtoAsset(a));
    res.send(assetsWithURL);
})
