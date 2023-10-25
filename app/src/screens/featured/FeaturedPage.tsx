import React, {useEffect, useState} from "react";
import SafeAreaView from "react-native-safe-area-view";
import YogaText from "../../components/YogaText";
import globalStyles from "../../theme/globalStyles";
import {ActivityIndicator, FlatList, ListRenderItem, RefreshControl, ScrollView, StyleSheet, View} from "react-native";
import YogaHeader from "../../components/YogaHeader";
import {Video, VideoApi} from "client";
import VideoThumbnail from "../../components/VideoThumbnail";
import {StackNavigationProp} from "@react-navigation/stack";
import {styles as videoThumbnailStyles} from "../../components/VideoThumbnail";
import {addError} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";
import { cloneDeep } from "lodash";
import { connect } from "react-redux";
import {IMetaStore} from "../../redux/meta/InitialMetaStore";
import {IStore} from "../../redux/defaultStore";
import {GetVideoFeedResponse} from "../../../../client";
import {KeyboardAwareFlatList} from "react-native-keyboard-aware-scroll-view";

interface IProps {
	token?: string;
	navigation: StackNavigationProp<any>;
	dispatch?: any;
}

type EntryListItem = [string, Array<Video>]
type EntryListItems = [
	["The Yoga Bar's Picks", Array<Video>],
	["Trending Right Now", Array<Video>],
	["Most Popular", Array<Video>],
	["Newest", Array<Video>],
];

const FeaturedPage: React.FC<IProps> = (props) => {

	const [yogaPicks, setYogaPicks] = useState<Video[]>([]);
	const [popular, setPopular] = useState<Video[]>([]);
	const [trending, setTrending] = useState<Video[]>([]);
	const [newest, setNewest] = useState<Video[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [lastLoadTime, setLastLoadTime] = useState(Date.now());

	useEffect(() => {
		if (props.token) {
			getAllVideos().then().catch();
		}
	}, [props.token]);

	useEffect(() => {
		const unsub = props.navigation.addListener("focus", () => {
			if ((lastLoadTime + 300000) <= Date.now()) {
				pullToRefresh();
			}
		});

		return unsub;
	}, [props.navigation, lastLoadTime]);

	async function getAllVideos(): Promise<void> {
		try {
			const videoAPIs = new VideoApi(getConfig(props.token));
			await createGetVideosFunction(videoAPIs.getTopPickVideos({limit: 30}), setYogaPicks);
			await createGetVideosFunction(videoAPIs.getVideosBasedOnViews({transactionsToFetch: 15}), setTrending);
			await createGetVideosFunction(videoAPIs.getVideosBasedOnViews({transactionsToFetch: 15}), setPopular);
			await createGetVideosFunction(videoAPIs.getNewestVideos({limit: 30}), setNewest);
			setRefreshing(false);
			setLastLoadTime(Date.now());
		} catch (e) {

		}
	}

	function pullToRefresh(): void {
		setRefreshing(true);
		setYogaPicks([]);
		setPopular([]);
		setTrending([]);
		setNewest([]);
		getAllVideos().then().catch();
	}

	async function createGetVideosFunction(api: Promise<GetVideoFeedResponse>, setFunc: (v: Video[]) => void) {
		try {
			const {videos} = await api;
			setFunc(videos);
		} catch (err) {
			props.dispatch(addError(err));
		}
	}

	const createHorizontalList: ListRenderItem<EntryListItem> = (_item) => {

		const [label, array] = _item.item;

		const createVideoThumbnail: ListRenderItem<Video> = (videoItem) => {
			function onPress() {
				props.navigation.navigate("VideoPage", {
					video: videoItem.item,
				})
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

	function createHeader() {
		return (
			<View style={globalStyles.pagePadding}>
				<YogaHeader title="Featured Page" back={false} addLine={true}/>
			</View>
		)
	}

	const entries: EntryListItems = [
		["The Yoga Bar's Picks", yogaPicks],
		["Trending Right Now", trending],
		["Most Popular", popular],
		["Newest", newest],
	]

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<KeyboardAwareFlatList
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={pullToRefresh}
					/>
				}
				ListHeaderComponent={createHeader}
				data={entries}
				renderItem={createHorizontalList}
				keyExtractor={(v, i) => `"video_feed_${v[0]}_${i}`}
			/>
		</SafeAreaView>
	)
};

const styles = StyleSheet.create({
	activityIndicator: {
		...globalStyles.pagePadding,
		height: videoThumbnailStyles.container.height,
	}
})

export default connect((store: IStore) => ({
	token: store.metaStore.token
}))(FeaturedPage);
