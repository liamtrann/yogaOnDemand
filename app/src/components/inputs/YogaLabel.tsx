import React from "react";
import {StyleSheet, Text, TextProps} from "react-native";
import YogaText from "../YogaText";
import colours from "../../theme/colours";

const YogaLabel: React.FC<TextProps> = (props) => {
	return <YogaText {...props} style={[style.text, props.style]}>{props.children}</YogaText>
}

const style = StyleSheet.create({
	text: {
		fontWeight: "bold",
		fontSize: 12,
		marginBottom: 8,
		color: colours.black,
	}
})

export default YogaLabel;
