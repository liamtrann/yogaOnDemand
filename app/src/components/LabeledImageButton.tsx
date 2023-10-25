import {StyleSheet, View, Text, TouchableOpacity, ViewStyle, ImageBackground} from "react-native";
import colours from "../theme/colours";
import React from "react";
import textStyles from "../theme/textStyles";
import {Grayscale} from "react-native-image-filter-kit";

interface IProps {
	text?: string;
	url?: string;
	onPress?: () => void;
	style?: ViewStyle;
}

const LabeledImageButton: React.FC<IProps> = (props) => {

	return (
		<TouchableOpacity
			onPress={props.onPress}
			activeOpacity={0.75}
			style={[
				styles.touchable,
				props.style,
			]}
		>
			<Grayscale
				image={
					<ImageBackground
						source={{uri: props.url}}
						style={styles.container}
					>
					</ImageBackground>
				}
			/>

			<View style={styles.textContainer}>
				<Text style={[textStyles.labeledImageButton, styles.text]}>{props.text}</Text>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	touchable: {
		backgroundColor: colours.black,
		borderRadius: 10,
		overflow: "hidden",
		position: "relative",
	},
	container: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: 125,
		height: 125,
		backgroundColor: colours.darkGray,
		opacity: 0.75,
		position: "relative",
	},
	textContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		// paddingHorizontal: 20,
	},
})

export default LabeledImageButton;
