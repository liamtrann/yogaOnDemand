import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Asset, AssetCategory, assetModel} from "@/models/Asset";
import {addURLtoAsset} from "@/utils/addURLToAsset";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";

/**
 * @swagger
 * /asset/get_asset_manager_assets:
 *   get:
 *     description: Gets all eligible assets for the asset manager.
 *     operationId: getAssetManagerAssets
 *     tags:
 *       - asset
 *     security:
 *       - Admin: []
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
app.get("/asset/get_asset_manager_assets", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, (Asset & {url: string})[] | APIError>, res) => {
	const assets = await assetModel
		.find({category: AssetCategory.AdminAssetManager})
		.populate("owner");
	const assetsWithURL = assets.map(a => addURLtoAsset(a));
	res.send(assetsWithURL);
})
