import React, {useEffect, useState} from "react";
import SafeAreaView from "react-native-safe-area-view";
import YogaText from "../../components/YogaText";
import {Category, CategoryApi, Class, ClassApi, VideoApi, Video} from "client";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import YogaHeader from "../../components/YogaHeader";
import {ActivityIndicator, FlatList, ListRenderItem, RefreshControl, ScrollView, StyleSheet, View} from "react-native";
import globalStyles from "../../theme/globalStyles";
import textStyles from "../../theme/textStyles";
import LabeledImageButton from "../../components/LabeledImageButton";
import VideoThumbnail from "../../components/VideoThumbnail";
import {StackNavigationProp} from "@react-navigation/stack";
import {cloneDeep} from "lodash"
import EmptyContentMessage from "../../components/EmptyContentMessage";

interface IProps {
	dispatch?: any;
	token?: string;
	navigation: StackNavigationProp<any>;
}

const ClassesPage: React.FC<IProps> = (props) => {

	const [videosResponse, setVideosResponse] = useState<Video[]>(undefined as unknown as Video[]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [offset, setOffset] = useState(0);
	const [disableNext, setDisableNext] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<Category>(undefined as unknown as Category);
	const [localLoading, setLocalLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [lastLoadTime, setLastLoadTime] = useState(Date.now());

	useEffect(() => {
		getCategories().then().catch();
	}, []);

	useEffect(() => {
		getVideos(offset).then().catch();
	}, [offset])

	useEffect(() => {
		if (selectedCategory) {
			setVideosResponse([]);
			if (offset > 0) {
				setOffset(0);
			} else {
				getVideos(0, true).then().catch();
			}
		}
	}, [JSON.stringify(selectedCategory)]);

	useEffect(() => {
		const unsub = props.navigation.addListener("focus", () => {
			if ((lastLoadTime + 300000) <= Date.now()) {
				pullToRefresh();
			}
		});

		return unsub;
	}, [props.navigation, lastLoadTime]);

	function pullToRefresh(): void {
		setRefreshing(true);
		setVideosResponse(undefined as unknown as Video[]);
		getVideos(0, true).then().catch();
	}

	async function getVideos(_offset: number, clearOld: boolean = false) {
		setLocalLoading(true);

		try {
			if (selectedCategory) {
				const {videos, paginationInfo: {disableNext}} = await new VideoApi(getConfig(props.token)).getVideosForCategory({
					categoryID: selectedCategory._id,
					limit: 10,
					offset: _offset,
				});
				setDisableNext(disableNext);

				let allVideos;

				if (clearOld) {
					setVideosResponse(videos);
				} else {
					allVideos = cloneDeep(videosResponse).concat(videos);
					setVideosResponse(allVideos);
				}
			} else {
				const {videos} = await new VideoApi(getConfig(props.token)).getTopPickVideos({
					limit: 10,
				});
				setVideosResponse(videos);
			}

			setRefreshing(false);
			setLastLoadTime(Date.now());
		} catch (err) {
			props.dispatch(addError(err));
		}

		setLocalLoading(false);
	}

	async function getCategories() {
		try {
			const {categories} = await new CategoryApi(getConfig(props.token)).getCategories({
				limit: Number.MAX_SAFE_INTEGER,
				offset: offset,
			});
			setCategories(categories);
		} catch (err) {
			props.dispatch(addError(err));
		}
	}

	const renderCategory: ListRenderItem<Category> = (item) => {

		function selectCategoryHelper(): void {
			setSelectedCategory(item.item);
		}

		return (
			<LabeledImageButton
				text={item.item.name}
				url={item.item.image?.url}
				style={
					{
						marginRight: item.index !== categories.length - 1 ? 10 : 30,
						marginLeft: item.index === 0 ? 30 : 0,
					}
				}
				onPress={selectCategoryHelper}
			/>
		)
	}

	const renderVideo: ListRenderItem<Video> = (item) => {

		function onPress() {
			props.navigation.navigate("VideoPage", {
				video: item.item,
			})
		}

		return (
			<View style={[styles.videoThumbnail, globalStyles.pagePadding]}>
				<VideoThumbnail
					thumbnailURL={item.item.image?.url}
					title={item.item.name}
					subtitle={item.item.instructor?.name}
					onClick={onPress}
				/>
			</View>
		)
	}

	async function onEndReached() {
		if (!disableNext && !!selectedCategory) {
			const newOffset = offset + 1;
			setOffset(newOffset);
			await getVideos(newOffset);
		}
	}

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<FlatList
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={pullToRefresh}
					/>
				}
				style={styles.videoList}
				data={videosResponse ? videosResponse : []}
				renderItem={renderVideo}
				keyExtractor={(item, i) => "class_" + item.name + "_" + i}
				initialNumToRender={7}
				windowSize={5}
				onEndReached={onEndReached}
				onEndReachedThreshold={0.1}
				ListEmptyComponent={(
					<React.Fragment>
						{videosResponse !== undefined && (
							<View>
								<EmptyContentMessage>
									There are no classes that match your selected category.
								</EmptyContentMessage>
							</View>
						)}
					</React.Fragment>
				)}
				ListFooterComponent={(
					<React.Fragment>
						{localLoading && (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large"/>
							</View>
						)}
					</React.Fragment>
				)}
				ListHeaderComponent={(
					<React.Fragment>
						<View style={globalStyles.pagePadding}>
							<YogaHeader title="Classes" back={false} addLine={true}/>
						</View>

						<View style={styles.categoryView}>
							<YogaText style={[textStyles.minorHeader, globalStyles.pagePadding]}>Select a Category</YogaText>
							<View style={globalStyles.verticalSpacing}/>
							<FlatList
								data={categories}
								renderItem={renderCategory}
								horizontal={true}
								keyExtractor={(item, i) => "category_" + item.name + "_" + i}
								style={styles.categoryFlatList}
							/>
						</View>

						<YogaText style={[textStyles.minorHeader, globalStyles.pagePadding]}>Most Popular</YogaText>
						<View style={globalStyles.verticalSpacing}/>
					</React.Fragment>
				)}
			/>
		</SafeAreaView>
	)
};


const styles = StyleSheet.create({
	categoryView: {
		marginVertical: 15,
	},
	categoryFlatList: {
		paddingBottom: 15,
	},
	videoThumbnail: {
		marginBottom: 15,
	},
	videoList: {
		// height: "100%",
	},
	loadingContainer: {
		marginVertical: 20,
	},
})

export default connect((store: IStore) => {
	return {
		token: store.metaStore.token,
	}
})(ClassesPage);
