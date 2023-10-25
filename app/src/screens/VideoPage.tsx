import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {FlatList, Image, ListRenderItem, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import VideoPlayer from "../components/VideoPlayer";
import globalStyles from "../theme/globalStyles";
import YogaHeader from "../components/YogaHeader";
import YogaText from "../components/YogaText";
import textStyles from "../theme/textStyles";
import {StackNavigationProp} from "@react-navigation/stack";
import {Class, Video, VideoApi} from "client";
import Line from "../components/Line";
import IconList, {createEntriesFromEquipment, createEntriesFromIntervals} from "../components/IconList";
import VideoThumbnail from "../components/VideoThumbnail";
import getConfig from "../utils/getConfig";
import {IStore} from "../redux/defaultStore";
import {addError} from "../redux/meta/MetaActions";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import { Grayscale } from "react-native-image-filter-kit";

interface IVideoPageProps {
	navigation: StackNavigationProp<any>;
	route: any;
	dispatch: any;
	token?: string;
}

const VideoPage: React.FC<IVideoPageProps> = (props) => {

	const video: Video = props.route.params.video;
	const [takeItFurtherVideos, setTakeItFurtherVideos] = useState<Video[]>();

	useEffect(() => {
		getFurtherVideos().then().catch();
	}, [])

	const renderVideoListItem: ListRenderItem<Video> = (item) => {

		function onPress() {
			props.navigation.replace("VideoPage", {
				video: item.item,
			})
		}

		return (
			<VideoThumbnail
				thumbnailURL={item.item.image?.url}
				title={item.item.name}
				subtitle={item.item.instructor?.name}
				onClick={onPress}
				style={
					{
						marginBottom: 15,
						width: 300,
						height: 200,
						marginRight: takeItFurtherVideos && item.index !== takeItFurtherVideos.length - 1 ? 10 : 30,
						marginLeft: item.index === 0 ? 30 : 0,
					}
				}
			/>
		)
	}

	async function getFurtherVideos() {
		try {
			const {videos} = await new VideoApi(getConfig(props.token)).getVideosForClass({
				classID: (video._class as unknown as Class)._id as string,
				limit: Number.MAX_SAFE_INTEGER,
				offset: 0,
			})
			setTakeItFurtherVideos(videos.filter(v => v._id !== video._id));
		} catch (err) {
			props.dispatch(addError(err));
		}
	}

	const showFurtherVideos = !takeItFurtherVideos || takeItFurtherVideos.length > 0;

	return (
		<SafeAreaView style={globalStyles.safeArea}>

			<View style={globalStyles.pagePadding}>
				<YogaHeader title={video.name} back={true} addLine={false}/>
			</View>

			<KeyboardAwareScrollView
				keyboardShouldPersistTaps="handled"
				style={styles.scrollView}
			>

				<VideoPlayer videoID={video._id}/>

				<View style={globalStyles.verticalSpacing}/>

				<View style={globalStyles.pagePadding}>

					<YogaText style={textStyles.header}>Description</YogaText>
					<View style={globalStyles.verticalSpacingSmall}/>
					{/*<YogaText style={textStyles.subtitle}>You can earn {video.experience} exp. by taking this class.</YogaText>*/}
					{/*<View style={globalStyles.verticalSpacingSmall}/>*/}
					<YogaText style={[textStyles.description]}>{video.description}</YogaText>

					<View style={globalStyles.verticalSpacing}/>
					<Line/>
					<View style={globalStyles.verticalSpacing}/>

					<YogaText style={textStyles.header}>Instructor Profile</YogaText>
					<View style={globalStyles.verticalSpacing}/>

					<View style={styles.profileContainer}>
						<Grayscale image={<Image style={styles.image} source={{uri: video.instructor?.image.url}}/>}/>
						<View style={styles.profileText}>
							<YogaText style={textStyles.smallHeader}>{video.instructor?.name}</YogaText>
							<View style={globalStyles.verticalSpacingTiny}/>
							<YogaText style={textStyles.description}>{video.instructor?.description}</YogaText>
						</View>
					</View>

					<View style={globalStyles.verticalSpacing}/>
					<Line/>
					<View style={globalStyles.verticalSpacing}/>

					<YogaText style={textStyles.header}>Class Intervals</YogaText>
					<View style={globalStyles.verticalSpacing}/>

					<IconList entries={createEntriesFromIntervals(video.intervals)}/>

					<View style={globalStyles.verticalSpacing}/>
					<Line/>
					<View style={globalStyles.verticalSpacing}/>

					<YogaText style={textStyles.header}>Equipment Needed</YogaText>
					<View style={globalStyles.verticalSpacing}/>

					<IconList entries={createEntriesFromEquipment(video.equipment)}/>

					<View style={globalStyles.verticalSpacing}/>

					{
						showFurtherVideos &&
						<React.Fragment>
							<Line/>
							<View style={globalStyles.verticalSpacing}/>
							<YogaText style={textStyles.header}>Take it Further</YogaText>
							<View style={globalStyles.verticalSpacing}/>
						</React.Fragment>
					}

				</View>

				{
					showFurtherVideos &&
					<FlatList
						data={takeItFurtherVideos}
						renderItem={renderVideoListItem}
						horizontal={true}
						keyExtractor={(v, i) => `"further_${v.name}_${i}`}
					/>
				}

				<View style={globalStyles.verticalSpacing}/>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	image: {
		height: 140,
		width: 140,
		borderRadius: 140 / 2
	},
	profileContainer: {
		display: "flex",
		flexDirection: "row",
	},
	profileText: {
		flex: 1,
		marginLeft: 15,
	},
	scrollView: {}
})

export default connect((state: IStore) => ({token: state.metaStore.token}))(VideoPage);
