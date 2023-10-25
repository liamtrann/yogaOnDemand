import {InitFunction} from "@/routes/utils/init";
import {userModel} from "@/models/User";

/**
 * Adds a favoriteClasses array to users that don't have it
 */
const addFavoritesArrayToUsers: InitFunction = async () => {
    await userModel.updateMany(
        {favoriteClasses: {$exists: false}},
        {favoriteClasses: []}
    );
}

export default addFavoritesArrayToUsers;