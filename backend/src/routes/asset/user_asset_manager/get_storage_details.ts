import {app} from "@/index";
import {Asset, assetModel} from "@/models/Asset";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {chain} from "mathjs";

/**
 * @swagger
 * components:
 *   schemas:
 *     StorageDetails:
 *       required:
 *         - storageUsed
 *         - storageLeft
 *         - totalAvailableStorage
 *       properties:
 *         storageUsed:
 *           type: number
 *         storageLeft:
 *           type: number
 *         totalAvailableStorage:
 *           type: number
 */
interface StorageDetails {
    storageUsed: number,
    storageLeft: number,
    totalAvailableStorage: number,
}

/**
 * @swagger
 * /asset/get_storage_details:
 *   get:
 *     description: Used to tell how much storage space the user has used, has left, and what the total amount allowed is.
 *     operationId: getStorageDetails
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
 *               $ref: '#/components/schemas/StorageDetails'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/asset/get_storage_details", userAuthentication, async (req: Request<undefined, StorageDetails | APIError>, res) => {
    const maxSize = 100000000 // 100 MB
    const usersAssets = await assetModel.find({owner: req.user}).populate("size");
    const totalSize = usersAssets.reduce((totalSize: number, asset: Asset) => {
        return totalSize + asset.size;
    }, 0)

    if (totalSize > maxSize) {
        res.status(400).send({messages: [`User has exceeded their maximum allocated space of 100MB.`]});
        return;
    }

    res.send({
        storageUsed: totalSize,
        storageLeft: chain(maxSize).subtract(totalSize).done(),
        totalAvailableStorage: maxSize,
    });
})
