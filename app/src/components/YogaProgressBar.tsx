import React from "react";
import {StyleSheet, View} from "react-native";
import colours from "../theme/colours";
import YogaText from "./YogaText";

interface IProps {
	leftLabel?: string;
	rightLabel?: string;
	progress?: number; // 0 -> 1
}

const ProgressBar: React.FC<IProps> = (props) => {
	return (
		<View style={styles.parent}>
			<View style={styles.progressBarContainer}>
				<View style={[
					styles.progressBarFill,
					{
						width: `${props.progress ? props.progress * 100 : 0}%`,
						backgroundColor: props.progress ? props.progress >= 1 ? colours.darkGray : colours.gray : colours.white
					}
					]}/>
			</View>
			<View style={styles.textContainer}>
				<YogaText style={styles.label}>{props.leftLabel}</YogaText>
				<YogaText style={styles.label}>{props.rightLabel}</YogaText>
			</View>
		</View>
	)
}

const height = 30;

const styles = StyleSheet.create({
	parent: {
		width: "100%",
	},
	progressBarContainer: {
		height,
		width: "100%",
		borderRadius: height / 2,
		shadowColor: colours.black,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 3,
		shadowOpacity: 0.2,
		backgroundColor: colours.white,
	},
	progressBarFill: {
		height,
		borderRadius: height / 2,
	},
	textContainer: {
		marginTop: 5,
		flexDirection: "row",
		justifyContent: "space-between"
	},
	label: {
		fontSize: 12,
	},
});

export default ProgressBar;
