import React from "react";
import YogaText from "./YogaText";
import {StyleSheet, TextStyle} from "react-native";
import colours from "../theme/colours";

interface IProps {
	children: string;
	style?: TextStyle;
}

const EmptyContentMessage: React.FC<IProps> = (props) => {

	return (
		<YogaText style={[styles.message, props.style]}>
			{props.children}
		</YogaText>
	);
}

const styles = StyleSheet.create({
	message: {
		color: colours.darkGray,
		textAlign: "center",
		fontStyle: "italic",
	},
});

export default EmptyContentMessage;
