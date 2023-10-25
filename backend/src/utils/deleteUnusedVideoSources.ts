import {GetFilesResponse} from "@google-cloud/storage";
import {videoSourceBucket} from "@/services/googleStorage";
import {videoSourceModel} from "@/models/VideoSource";
import {isNil} from "lodash";
import {videoModel} from "@/models/Video";

async function deleteUnusedVideoSources() {
    const currentDate = Date.now();
    const getFilesResponse: GetFilesResponse = await videoSourceBucket.getFiles();
    const files = getFilesResponse[0];

    for (const file of files) {
        // check that the file has existed for at least 24 hours (we don't want to delete it yet if it's new)
        if ((currentDate - (file.metadata.generation / 1000)) > (24 * 60 * 60 * 1000)) {
            // find the video source
            const videoSource = await videoSourceModel.findOne({gcpFileName: file.name});
            if (isNil(videoSource)) {
                // the video source does not exist delete the file
                await file.delete();
            } else {
                // check if the video source is being used in a video
                const video = await videoModel.findOne({videoSource});
                if (isNil(video)) {
                    // the video source is not in use so delete it and the file
                    await videoSourceModel.findByIdAndDelete(videoSource.id);
                    await file.delete();
                }
            }
        }
    }
}

export default deleteUnusedVideoSources;