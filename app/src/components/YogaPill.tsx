import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import colours from "../theme/colours";
import YogaText from "./YogaText";

interface IProps {
	text?: string;
	onClose?: () => void; // will make the X show up
}

const YogaPill: React.FC<IProps> = ({text, onClose}) => {
	return (
		<View style={style.view}>
			<YogaText style={style.text}>{text}</YogaText>
			{
				onClose &&
				<TouchableOpacity onPress={onClose}>
					<View>
						<YogaText style={style.closeText}>X</YogaText>
					</View>
				</TouchableOpacity>
			}
		</View>
	)
}

const style = StyleSheet.create({
	view: {
		backgroundColor: colours.darkGray,
		height: 30,
		borderRadius: 7,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		alignSelf: "flex-start",
	},
	text: {
		width: "auto",
		color: colours.lightGray,
		marginRight: 15,
	},
	closeText: {
		width: "auto",
		color: colours.lightGray,
		fontWeight: "700",
	},
})

export default YogaPill