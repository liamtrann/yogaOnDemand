import React from "react";
import {StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from "react-native";
import YogaText from "./YogaText";
import colours from "../theme/colours";

interface IProps extends TouchableOpacityProps {
	text?: string
	theme?: "primary" | "secondary" | "dark-background" | "primary-border" | "secondary-border" | "dark-background-border"
	bubble?: string; // displays text in bubble
	buttonStyle?: ViewStyle;
	textStyle?: TextStyle;
	size?: "small" | "medium";
}

// value for borderWidth
const borderWidth = 2;
const shadow = {
	shadowColor: colours.black,
	shadowOffset: {
		width: 0,
		height: 3
	},
	shadowRadius: 3,
	shadowOpacity: 0.2
}

const YogaButton: React.FC<IProps> = (props) => {

	let viewStyle: ViewStyle;
	let bubbleStyle: ViewStyle;
	let sizeStyle: ViewStyle;
	let textStyle: TextStyle;

	switch (props.theme) {
		case "dark-background":
			viewStyle = {
				backgroundColor: colours.white,
				...shadow,
			}
			textStyle = {
				color: colours.darkGray
			}
			break;
		case "primary-border":
			viewStyle = {
				backgroundColor: "transparent",
				borderColor: colours.darkGray,
				borderWidth
			}
			textStyle = {
				color: colours.gray
			}
			break;
		case "secondary-border":
			viewStyle = {
				backgroundColor: "transparent",
				borderColor: colours.gray,
				borderWidth
			}
			textStyle = {
				color: colours.gray
			}
			break;
		case "dark-background-border":
			viewStyle = {
				backgroundColor: "transparent",
				borderWidth,
				borderColor: colours.white,
				...shadow,
			}
			textStyle = {
				color: colours.white
			}
			break;
		case "secondary":
			viewStyle = {
				backgroundColor: colours.gray,
			}
			textStyle = {
				color: colours.lightGray
			}
			break;
		case "primary":
		default:
			viewStyle = {
				backgroundColor: colours.darkGray,
			}
			textStyle = {
				color: colours.lightGray
			}
	}

	switch (props.size) {
		case "small":
			sizeStyle = {
				width: 160,
				paddingVertical: 5,
			}
			bubbleStyle = {
				left: 160 - 15
			}
			textStyle = {
				...textStyle,
				fontSize: 12
			}
			break;
		case "medium":
		default:
			sizeStyle = {
				width: 240,
				paddingVertical: 10,
			}
			bubbleStyle = {
				left: 240 - 15
			}
			break;
	}

	return (
		<TouchableOpacity {...props} style={[style.touchableOpacity, props.style]}>
			<View style={[style.view, viewStyle, sizeStyle, props.buttonStyle]}>
				<YogaText style={[style.text, textStyle, props.textStyle]}>{props.text}</YogaText>
			</View>
			{
				props.bubble &&
				<View style={[style.bubble, bubbleStyle]}>
					<YogaText style={style.bubbleText}>{props.bubble}</YogaText>
				</View>
			}
		</TouchableOpacity>
	)

}

const style = StyleSheet.create({
	touchableOpacity: {
		overflow: "visible",
	},
	view: {
		borderRadius: 9,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "red",
	},
	text: {
		fontSize: 15,
		fontWeight: "bold"
	},
	bubble: {
		backgroundColor: "white",
		width: 30,
		height: 30,
		borderRadius: 15,
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
		top: -10,
		shadowColor: colours.black,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 3,
		shadowOpacity: 0.5
	},
	bubbleText: {
		fontSize: 17,
		fontWeight: "bold",
		color: colours.darkGray,
	}
})

YogaButton.defaultProps = {
	text: "",
	theme: "primary",
	activeOpacity: 0.7,
	size: "medium",
}

export default YogaButton;
