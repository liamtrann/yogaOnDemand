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
				<View style={styles.outerCircle}>
					{value && <View style={styles.innerCircle}/>}
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
	outerCircle: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: colours.darkGray,
		justifyContent: "center",
		alignItems: "center"
	},
	innerCircle: {
		backgroundColor: colours.darkGray,
		height: 10,
		width: 10,
		borderRadius: 5,
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