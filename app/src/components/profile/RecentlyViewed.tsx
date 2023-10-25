import React, {useEffect, useState} from "react";
import {ActivityIndicator, FlatList, ListRenderItem, StyleSheet, View} from "react-native";
import {Video, VideoApi} from "client";

import {connect} from "react-redux";
import getConfig from "../../utils/getConfig";
import {GetVideoFeedResponse} from "../../../../client/src";
import {addError} from "../../redux/meta/MetaActions";
import {IStore} from "../../redux/defaultStore";
import SafeAreaView from "react-native-safe-area-view";
import globalStyles from "../../theme/globalStyles";
import {KeyboardAwareFlatList} from "react-native-keyboard-aware-scroll-view";
import VideoThumbnail, {styles as videoThumbnailStyles} from "../VideoThumbnail";
import YogaText from "../YogaText";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";

interface IProps {
	dispatch?: any;
	token?: string;
}

type EntryListItem = [string, Array<Video>]

type EntryListItems = [
	["Recently Viewed", Array<Video>],
];

const RecentlyViewed: React.FC<IProps> = (props) => {

	const [recentlyViewedVideos, setRecentlyViewedVideos] = useState<Video[]>([]);
	const navigation = useNavigation<StackNavigationProp<any>>();

	useEffect(() => {
		getRecentlyViewedVideos().then().catch();
	}, [props.token]);

	async function getRecentlyViewedVideos() {
		try {
			const res: GetVideoFeedResponse = await new VideoApi(getConfig(props.token)).getVideosRecentlyViewed({
				transactionsToFetch: 5,
			});
			setRecentlyViewedVideos(res.videos);
		} catch (err) {
			props.dispatch(addError(err));
		}
	}

	const createHorizontalList: ListRenderItem<EntryListItem> = (_item) => {

		const [label, array] = _item.item;

		const createVideoThumbnail: ListRenderItem<Video> = (videoItem) => {

			function onPress() {
				navigation.push("VideoPage", {video: videoItem.item});
			}

			return (
				<VideoThumbnail
					thumbnailURL={videoItem.item.image?.url}
					title={videoItem.item.name}
					subtitle={videoItem.item.instructor?.name}
					onClick={onPress}
					style={
						{
							marginBottom: 15,
							width: 300,
							height: 200,
							marginRight: videoItem.index !== array.length - 1 ? 10 : 30,
							marginLeft: videoItem.index === 0 ? 30 : 0,
						}
					}
				/>
			)
		}

		return (
			<View>
				<View style={globalStyles.pagePadding}>
					<YogaText>{label}</YogaText>
				</View>
				<View style={globalStyles.verticalSpacingSmall}/>
				<FlatList
					data={array}
					renderItem={createVideoThumbnail}
					horizontal={true}
					keyExtractor={(v, i) => `"list_item_${v.name}_${i}`}
					ListEmptyComponent={<ActivityIndicator style={styles.activityIndicator} size="large"/>}
				/>
				<View style={globalStyles.verticalSpacingMedium}/>
			</View>
		)
	}

	const entries: EntryListItems = [
		["Recently Viewed", recentlyViewedVideos],
	]

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<KeyboardAwareFlatList
				data={entries}
				renderItem={createHorizontalList}
				keyExtractor={(v, i) => `"video_feed_${v[0]}_${i}`}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	activityIndicator: {
		...globalStyles.pagePadding,
		height: videoThumbnailStyles.container.height,
	},
});

export default connect((store: IStore) => ({
	token: store.metaStore.token
}))(RecentlyViewed);
