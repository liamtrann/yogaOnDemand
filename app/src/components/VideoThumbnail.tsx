import React from "react";
import {Image, StyleSheet, TouchableOpacity, View, ViewStyle} from "react-native";
import colours from "../theme/colours";
import YogaText from "./YogaText";
import {Grayscale} from "react-native-image-filter-kit";
const blackHeart = require("../../assets/images/blackHeart.png");
const grayHeart = require("../../assets/images/grayHeart.png");

interface IProps {
	thumbnailURL?: string;
	title?: string;
	subtitle?: string;
	onClick?: () => void;
	onHeart?: () => void;
	hearted?: boolean;
	style?: ViewStyle
}

const VideoThumbnail: React.FC<IProps> = (props) => {

	return (
		<TouchableOpacity
			style={[styles.container, props.style]}
			activeOpacity={0.7}
			onPress={props.onClick}
			disabled={props.onClick === undefined}
		>

			<Grayscale
				style={styles.image}
				image={<Image source={{uri: props.thumbnailURL}} style={styles.image}/>}
			/>

			{
				props.hearted !== undefined &&
				<View style={styles.heartContainer}>
					<Image style={[styles.heartImage]} source={props.hearted ? blackHeart : grayHeart}
						   resizeMethod="resize"/>
				</View>
			}
			<View style={styles.subtitleBox}>
				<YogaText style={styles.title}>{props.title}</YogaText>
				<YogaText style={styles.subtitle}>{props.subtitle}</YogaText>
			</View>
		</TouchableOpacity>
	)
}

export const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: 250,
		shadowColor: colours.black,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 3,
		shadowOpacity: 0.2,
		backgroundColor: colours.darkGray,
		borderRadius: 7,
		overflow: "hidden",
		justifyContent: "flex-end",
		alignItems: "flex-end",
	},
	image: {
		height: "100%",
		width: "100%",
		flex: 1,
	},
	subtitleBox: {
		width: "100%",
		height: 80,
		backgroundColor: "rgba(0,0,0,0.4)",
		paddingHorizontal: 15,
		paddingTop: 15,
		position: "absolute",
		bottom: 0,
	},
	title: {
		color: colours.white,
		fontSize: 18,
		fontWeight: "800"
	},
	subtitle: {
		marginTop: 4,
		color: colours.white,
		fontSize: 10,
		fontWeight: "500",
	},
	heartContainer: {
		position: "absolute",
		top: 15,
		right: 15,
		height: 30,
		width: 30,
		// backgroundColor: colours.white,
		justifyContent: "center",
		alignContent: "center",
		borderRadius: 15,
		backgroundColor: "rgba(255,255,255,0.7)",
		padding: 4
	},
	heartImage: {
		resizeMode: "contain",
		height: "100%",
		width: "100%",
	}
})

export default VideoThumbnail;
