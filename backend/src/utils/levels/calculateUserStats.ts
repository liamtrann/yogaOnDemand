import {validateID} from "@/utils/validateID";
import {APIError} from "@/models/APIError";
import {User, userModel} from "@/models/User";
import {isNil} from "lodash";
import {DocumentType} from "@typegoose/typegoose";
import {
    Transaction,
    transactionModel,
    TransactionType,
    WatchTransaction,
    WatchTransactionType
} from "@/models/Transaction";
import {Video} from "@/models/Video";
import {levelTable, VideoTransactionData, UserStats} from "@/models/UserStats";

async function calculateUserStats(user?: DocumentType<User>, userID?: string, startTime?: number, endTime?: number): Promise<UserStats | APIError> {
    if (isNil(user)) {
        if (isNil(userID)) {
            return {messages: ["No user or user ID was given."]};
        }

        // validate the ID
        const userIDErrors = validateID(userID);
        if (userIDErrors) {
            return userIDErrors;
        }

        // get the user
        user = await userModel.findById(userID);
        if (isNil(user)) {
            return {messages: ["Could not find a user with the given ID."]};
        }
    }

    if (!isNil(startTime)) {
        if (typeof startTime !== "number") {
            return {messages: ["The start time was invalid."]};
        }
    }

    if (!isNil(endTime)) {
        if (typeof endTime !== "number") {
            return {messages: ["The end time was invalid."]};
        }
    }

    // get the user's transactions
    const transactions: DocumentType<Transaction>[] = await transactionModel
        .find({owner: user})
        .sort({creationDate: 1})
        .populate({
            path: "watchTransaction.video",
            model: "Video"
        });

    // loop over transactions
    const watchTimeDataObject: { [key: number]: number } = {}
    const videoTransactionDataMap: { [key: string]: VideoTransactionData } = {};
    for (const transaction of transactions) {
        // switch over transaction type
        switch (transaction.transactionType) {
            case TransactionType.VIDEO:
                // check that the watchTransaction exists
                if (isNil(transaction.watchTransaction)) {
                    return {messages: [`The video transaction: ${transaction.id} was missing the watchTransaction field.`]};
                }

                // define some variables we will use
                const watchTransaction = transaction.watchTransaction as WatchTransaction;
                const video = watchTransaction.video as DocumentType<Video>;

                // fetch the current state of the data for this video
                let videoTransactionData = videoTransactionDataMap[video.id.toString()];

                // init the data if its the first transaction
                let lastTransaction;
                if (isNil(videoTransactionData)) {
                    videoTransactionData = {
                        experience: video.experience,
                        totalWatchTime: 0,
                        lastTransaction: undefined,
                    }
                } else {
                    lastTransaction = videoTransactionData.lastTransaction;
                }

                // switch over watch transaction type
                switch (watchTransaction.watchTransactionType) {
                    case WatchTransactionType.START:
                        break;
                    case WatchTransactionType.SKIP:
                        break;
                    case WatchTransactionType.PAUSE:
                    case WatchTransactionType.CLOSE:
                    case WatchTransactionType.END:
                        // check that last transaction exists and is a START
                        if (!isNil(lastTransaction)) {
                            let playTime;
                            switch (lastTransaction.watchTransaction.watchTransactionType) {
                                case WatchTransactionType.START:
                                    playTime = watchTransaction.timestamp - lastTransaction.watchTransaction.timestamp;
                                    break;
                                case WatchTransactionType.SKIP:
                                    playTime = watchTransaction.timestamp - lastTransaction.watchTransaction.skipTo;
                                    break;
                            }

                            // check that the time is positive
                            if (!isNil(playTime) && playTime > 0) {
                                // add the time to the total watch time
                                videoTransactionData.totalWatchTime = videoTransactionData.totalWatchTime + playTime;

                                // add the time to the watch time data
                                watchTimeDataObject[transaction.creationDate] = playTime;
                            }
                        }
                        break;
                    default:
                        return {messages: [`The watch transaction type for transaction: ${transaction.id} was invalid.`]};
                }

                // update the video transaction data
                videoTransactionData.lastTransaction = transaction;

                // update the data map
                videoTransactionDataMap[video.id.toString()] = videoTransactionData;

                break;
            default:
                return {messages: [`The transaction type for transaction: ${transaction.id} was invalid.`]};
        }
    }

    // calculate the total experience
    //const minWatchTime: number = 5 * 60 * 1000;
    const minWatchTime: number = 1;
    const currentExp = Object.entries(videoTransactionDataMap).reduce((acc: number, [, videoTransactionData]: [string, VideoTransactionData]) => {
        // check that the totalWatchTime is over the min time
        if (videoTransactionData.totalWatchTime >= minWatchTime) {
            if (!isNil(videoTransactionData.experience)) {
                return acc + videoTransactionData.experience;
            } else {
                return acc;
            }
        } else {
            return acc;
        }
    }, 0);

    // calculate the level for this experience using the level table
    const currentLevel = levelTable.findIndex((exp) => exp > currentExp);
    const startOfGoal = levelTable[currentLevel - 1];
    const endOfGoal = levelTable[currentLevel];
    const expToGoal = endOfGoal - currentExp;

    // create the watch time bar graph data
    const watchTimeDataArray = [];
    for (const watchTimeData of Object.entries(watchTimeDataObject)) {
        const [timestamp, watchTime] = watchTimeData;
        if (Number(timestamp) >= startTime && Number(timestamp) <= endTime) {
            const interval = Math.floor((Number(timestamp) - startTime) / (24 * 60 * 60 * 1000));
            if (isNil(watchTimeDataArray[interval])) {
                watchTimeDataArray[interval] = watchTime;
            } else {
                watchTimeDataArray[interval] = watchTimeDataArray[interval] + watchTime;
            }
        }
    }

    const watchTimeData = {};
    for (let i = startTime; i < endTime; i = i + (24 * 60 * 60 * 1000)) {
        const interval = Math.floor((Number(i) - startTime) / (24 * 60 * 60 * 1000));
        watchTimeData[i] = !isNil(watchTimeDataArray[interval]) ? watchTimeDataArray[interval] : 0;
    }

    return {
        user,
        watchTimeData,
        currentLevel,
        currentExp,
        expToGoal,
        startOfGoal,
        endOfGoal,
    }
}

export default calculateUserStats;