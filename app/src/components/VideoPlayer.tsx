import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, Image, StyleSheet, TouchableOpacity, View} from "react-native";
import colours from "../theme/colours";
import {CreateWatchTransactionBody, Video as VideoModel, VideoApi, VideoSourceApi, WatchTransactionType} from "client";
import {connect} from "react-redux";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import getConfig from "../utils/getConfig";
import {IStore} from "../redux/defaultStore";
import YogaText from "./YogaText";
import textStyles from "../theme/textStyles";
import Video, {OnLoadData, OnPlaybackRateData, OnProgressData, OnSeekData} from "react-native-video"
import {Grayscale} from "react-native-image-filter-kit";

interface IProps {
	videoID: string;
	dispatch?: any;
	token?: string;
}

const VideoPlayer: React.FC<IProps> = ({videoID, dispatch, token}) => {

	const [video, setVideo] = useState<VideoModel>();
	const [loadingInitialData, setLoadingInitialData] = useState(true);
	const [videoURL, setVideoURL] = useState<string>();
	const [showVideo, setShowVideo] = useState(false);
	const [videoDetails, setVideoDetails] = useState<OnLoadData>();
	const [progressData, setProgressData] = useState<OnProgressData>();
	const [imageLoaded, setImageLoaded] = useState(false);
	const [paused, setPaused] = useState(false);
	const [lastPaused, setLastPaused] = useState<number>();
	const [videoLoading, setVideoLoading] = useState(false)
	const videoRef = useRef<Video>();

	useEffect(() => {
		getVideo().then().catch();
	}, [videoID])

	useEffect(() => {
		return () => {
			if (progressData) {
				onClose().then().catch()
			}
		}
	}, [])

	async function getVideo() {
		setLoadingInitialData(true);
		try {
			const video = await new VideoApi(getConfig(token)).getVideo({videoID});
			setVideo(video);
		} catch (err) {
			dispatch(addError(err));
		}
		setLoadingInitialData(false);
	}

	async function startVideo() {
		setVideoLoading(true);
		try {
			// console.log("calling", video?.videoSource, new VideoSourceApi(getConfig(token)).getVideoSourceURL.toString());
			const videoURL = await new VideoSourceApi(getConfig(token)).getVideoSourceURL({getVideoSourceURLRequestBody: {videoSourceId: video?.videoSource as string}})
			setVideoURL(videoURL.url);
			setShowVideo(true);
			if (videoRef.current) {
				videoRef.current?.seek(0);
			}
		} catch (err) {
			dispatch(addError(err))
		}

		setVideoLoading(false);
	}

	function onLoad(data: OnLoadData) {
		setVideoDetails(data);
	}

	function onImageLoad() {
		setImageLoaded(true);
	}

	async function transaction(body: CreateWatchTransactionBody) {
		try {
			await new VideoApi(getConfig(token)).createWatchTransaction({createWatchTransactionBody: body})
		} catch (err) {
		}
	}

	async function onProgress(data: OnProgressData) {
		setProgressData(data)
	}

	async function onEnd() {
		setShowVideo(false);
		setVideoURL(undefined)
		// await transaction({
		// 	videoID,
		// 	watchTransactionType: WatchTransactionType.END,
		// 	timestamp: (videoDetails as OnLoadData).duration,
		// })
	}

	async function onStart() {
		await transaction({
			videoID,
			watchTransactionType: WatchTransactionType.START,
			timestamp: 0,
		})
	}

	async function onSeek({currentTime, seekTime}: OnSeekData) {
		await transaction({
			videoID,
			watchTransactionType: WatchTransactionType.SKIP,
			timestamp: currentTime,
			skipTo: seekTime,
		})
	}

	async function onPlaybackRateChange({playbackRate}: OnPlaybackRateData) {
		if (playbackRate === 0) {
			setPaused(true);
			setLastPaused((progressData as OnProgressData).currentTime)
			await transaction({
				videoID,
				watchTransactionType: WatchTransactionType.PAUSE,
				timestamp: (progressData as OnProgressData).currentTime,
			})
		} else if (paused) {
			setPaused(false);

			if (lastPaused === (progressData as OnProgressData).currentTime) {
				await transaction({
					videoID,
					watchTransactionType: WatchTransactionType.START,
					timestamp: (progressData as OnProgressData).currentTime,
				})
			} else {
				await transaction({
					videoID,
					watchTransactionType: WatchTransactionType.SKIP,
					timestamp: lastPaused as number,
					skipTo: (progressData as OnProgressData).currentTime
				})
			}

		}
	}

	async function onClose() {
		await transaction({
			videoID,
			watchTransactionType: WatchTransactionType.CLOSE,
			timestamp: (progressData as OnProgressData).currentTime,
		})
	}

	return (
		<View>
			<TouchableOpacity activeOpacity={0.7} onPress={startVideo} style={styles.container}
			                  disabled={!video || videoLoading}>

				{video?.image?.url && (
					<Grayscale
						style={styles.image}
						image={
							<Image
								source={{uri: video?.image?.url}}
								style={styles.image}
								onLoad={onImageLoad}
								progressiveRenderingEnabled={true}
							/>
						}
					/>
				)}

				{(loadingInitialData || !imageLoaded || videoLoading) && (
					<ActivityIndicator style={styles.loadingIndicator} color={colours.black} size="large"/>
				)}

				<View style={styles.startThisClassContainer}>
					<YogaText style={textStyles.videoPlayer}>Start this Class </YogaText>
				</View>
			</TouchableOpacity>

			{
				(showVideo && videoURL) &&
                <Video
                    key={videoURL}
					{...{} /* @ts-ignore */}
                    ref={videoRef}
                    source={{uri: videoURL}}
                    style={styles.backgroundVideo}
                    fullscreen={true}
                    controls={true}
                    allowsExternalPlayback={true}
                    ignoreSilentSwitch={"ignore"}
                    pictureInPicture={true}
                    onLoad={onLoad}
                    onReadyForDisplay={onStart}
                    onEnd={onEnd}
                    onSeek={onSeek}
                    onPlaybackRateChange={onPlaybackRateChange}
                    onProgress={onProgress}
                />
			}

		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: 300,
		shadowColor: colours.black,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 3,
		shadowOpacity: 0.2,
		backgroundColor: colours.gray,
		overflow: "hidden",
		justifyContent: "flex-end",
		alignItems: "flex-end"
	},
	image: {
		height: "100%",
		width: "100%",
		position: "absolute",
	},
	startThisClassContainer: {
		position: "absolute",
		bottom: 0,
		marginBottom: 25,
		left: 0,
		paddingRight: 20,
		paddingLeft: 40,
		paddingVertical: 15,
		width: 200,
		borderTopEndRadius: 15,
		borderBottomEndRadius: 15,
		backgroundColor: colours.lightGray,
		opacity: 0.8,
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end"
	},
	loadingIndicator: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	},
	backgroundVideo: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: "black",
		height: 300,
		width: "100%",
	},
})

export default connect((store: IStore, props: IProps) => {
	return {
		token: store.metaStore.token,
	}
})(VideoPlayer);
