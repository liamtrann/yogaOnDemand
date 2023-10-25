import React, {ReactNode} from "react";
import {Modal, ModalProps, StyleSheet, TouchableOpacity, View} from "react-native";
import colours from "../theme/colours";
import YogaText from "./YogaText";
import YogaButton from "./YogaButton";

interface IProps extends ModalProps {
	onXPress?: () => void; // this will make the X show up

	// most modals just need title, body and button, so I made them easy to set, but are optional
	// you can still use the modal as is
	easyTitle?: string;
	easyBody?: string;
	easyButton?: () => void;
	easyButtonText?: string;
}

const YogaPopup: React.FC<IProps> = (props) => {
	return (
		<Modal {...props}>
			<View style={styles.parent}>
				<View style={styles.modalParent}>
					<View style={styles.xContainer}>
						{
							props.onXPress &&
								<TouchableOpacity style={styles.touchableOpacity} onPress={props.onXPress}>
									<View style={styles.xCircle}>
										<YogaText style={styles.xText}>X</YogaText>
									</View>
								</TouchableOpacity>
						}
					</View>
					{props.easyTitle &&<YogaText style={styles.title}>{props.easyTitle}</YogaText>}
					{props.easyBody &&<YogaText style={styles.body}>{props.easyBody}</YogaText>}
					{props.easyButton && <View style={styles.buttonView}><YogaButton theme="primary" onPress={props.easyButton} text={props.easyButtonText}/></View>}
				</View>
			</View>
		</Modal>
	)
}

export const styles = StyleSheet.create({
	touchableOpacity: {
		alignItems: "flex-end",
		justifyContent: "center",
	},
	xContainer: {
		width: "100%",
		height: 40,
		paddingTop: 10,
		paddingHorizontal: 20,
		alignItems: "flex-end",
		justifyContent: "center"
	},
	xCircle: {
		height: 25,
		width: 25,
		borderRadius: 25/2,
		backgroundColor: colours.darkGray,
		justifyContent: "center",
		alignItems: "center"
	},
	xText: {
		color: colours.lightGray,
		fontWeight: "800",
	},
	modalParent: {
		backgroundColor: colours.lightGray,
		width: "100%",
		shadowColor: colours.black,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 3,
		shadowOpacity: 0.2,
		borderRadius: 15,
		alignItems: "center",
		paddingBottom: 35
	},
	parent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		backgroundColor: "rgba(0,0,0,0.2)"
	},
	title: {
		fontSize: 24,
		fontWeight: "900",
		marginBottom: 15,
	},
	body: {
		fontSize: 13,
		marginVertical: 15,
		paddingHorizontal: 15
	},
	buttonView: {
		marginTop: 15,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	}
});

YogaPopup.defaultProps = {
	animationType: "fade",
	transparent: true,
	animated: true,
	easyButtonText: "Okay"
}

export default YogaPopup;