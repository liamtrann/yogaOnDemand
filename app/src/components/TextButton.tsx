import React from "react";
import {StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps} from "react-native";
import YogaText from "./YogaText";
import Line from "./Line";
import colours from "../theme/colours";

interface IProps extends TouchableOpacityProps {
	text: string;
	textStyle?: TextStyle;
}

const TextButton: React.FC<IProps> = (props) => {

	return (
		<TouchableOpacity {...props} style={[styles.touchableOpacity, props.style]}>
			<YogaText style={[styles.textStyle, props.textStyle]}>
				{props.text}
			</YogaText>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	touchableOpacity: {
		alignSelf: "auto",
		borderBottomWidth: 1,
		borderBottomColor: colours.darkGray,
	},
	textStyle: {
		color: colours.darkGray,
		textDecorationColor: colours.darkGray,
		fontSize: 12,
	},
});

TextButton.defaultProps = {
	activeOpacity: 0.7,
}

export default TextButton;
