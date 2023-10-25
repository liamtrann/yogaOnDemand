import React from "react";
import {StyleSheet, View, ViewStyle} from "react-native";
import colours from "../theme/colours";

interface IProps {
	style?: ViewStyle;
}

const Line: React.FC<IProps> = (props) => {

	return (
		<View style={[styles.line, props.style]}/>
	);
};

const styles = StyleSheet.create({
	line: {
		width: "100%",
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colours.gray,
	}
});

export default Line;
