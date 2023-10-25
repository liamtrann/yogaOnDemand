import React from "react";
import {StyleSheet, TextStyle, View} from "react-native";
import ModalCloseButton from "./ModalCloseButton";
import colours from "../../theme/colours";
import YogaText from "../YogaText";

interface IProps {
	onClose?: () => void;
	title?: string;
	titleStyle?: TextStyle;
}

const ModalCard: React.FC<IProps> = (props) => {

	return (
		<View style={style.card}>
			<View style={style.cardHeader}>
				{props.title && (
					<YogaText style={[style.titleStyle, props.titleStyle]}>{props.title}</YogaText>
				)}
				{props.onClose && (
					<View style={style.closeButtonContainer}>
						<ModalCloseButton
							onPress={props.onClose}
							style={style.closeButton}
						/>
					</View>
				)}
			</View>

			<View>
				{props.children}
			</View>
		</View>
	);
};

const style = StyleSheet.create({
	card: {
		paddingHorizontal: 24,
		paddingTop: 15,
		paddingBottom: 25,
		borderRadius: 5,
		backgroundColor: colours.white,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	titleStyle: {
		fontWeight: "bold",
		fontSize: 26,
		flex: 9
	},
	closeButtonContainer: {
		flex: 1,
	},
	closeButton: {
		position: "absolute",
		top: -3,
		right: -9,
	},
});

export default ModalCard;
