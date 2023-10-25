import * as React from "react";
import {StyleSheet, TouchableOpacity, View, ViewStyle} from "react-native";
import YogaText from "../YogaText";
import colours from "../../theme/colours";

interface IProps {
	onPress: () => void;
	style?: ViewStyle;
}

const ModalCloseButton: React.FC<IProps> = (props) => {

	return (
		<View style={[style.container, props.style]}>
			<TouchableOpacity
				onPress={props.onPress}
				activeOpacity={0.7}
			>
				<YogaText style={style.gray}>X</YogaText>
			</TouchableOpacity>
		</View>
	);
};

const style = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center"
	},
	gray: {
		color: colours.darkGray,
	},
});

export default ModalCloseButton;
