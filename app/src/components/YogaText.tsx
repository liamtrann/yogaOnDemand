import React from "react";
import {TextProps, Text, StyleSheet} from "react-native";
import colours from "../theme/colours";

const YogaText: React.FC<TextProps> = (props) => {
	return <Text {...props} style={[style.text, props.style]}>{props.children}</Text>
}

const style = StyleSheet.create({
	text: {
		fontFamily: "Lato",
		color: colours.darkGray,
		paddingVertical: 1.2,
	}
});

export default YogaText;
