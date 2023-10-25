import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import colours from "../../theme/colours";
import YogaText from "../YogaText";

interface IProps {
	value?: boolean;
	onChange?: (v: boolean) => void;
	text?: string;
}

const YogaRadio: React.FC<IProps> = ({value, onChange, text}) => {

	function onPressWrapper() {
		if (onChange) {
			onChange(!value);
		}
	}

	return (
		<View style={styles.parent}>
			<TouchableOpacity onPress={onPressWrapper} activeOpacity={0.5} disabled={onChange === undefined}>
				<View style={[styles.outerSquare, {backgroundColor: value ? colours.darkGray : colours.white}]}>
					{value && <YogaText style={styles.checkbox}>✓</YogaText>}
				</View>
			</TouchableOpacity>
			{
				text &&
				<YogaText style={styles.text}>{text}</YogaText>
			}
		</View>
	)
}

const styles = StyleSheet.create({
	outerSquare: {
		height: 20,
		width: 20,
		borderWidth: 2,
		borderColor: colours.darkGray,
		borderRadius: 2,
		justifyContent: "center",
		alignItems: "center"
	},
	checkbox: {

		color: colours.lightGray
	},
	parent: {
		flexDirection: "row",
		alignItems: "center"
	},
	text: {
		fontSize: 12,
		marginLeft: 5,
	}
})

export default YogaRadio;