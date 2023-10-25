import colours from "./colours";
import {StyleSheet} from "react-native";

export default StyleSheet.create({
	bold: {
		fontWeight: "bold",
	},
	dark: {
		color: colours.black,
	},
	red: {
		color: colours.red,
	},
	pageHeader: {
		fontSize: 32,
		lineHeight: 36,
		fontWeight: "700" as "700", // casting required to satisfy IDE's linting inside the tsx file.
		color: colours.black,
	},
	popupHeader: {
		fontSize: 32,
		lineHeight: 36,
		marginBottom: 10,
	},
	videoPlayer: {
		fontSize: 17,
		fontWeight: "bold",
		color: colours.black
	},
	header: {
		fontSize: 26,
		fontWeight: "bold",
		color: colours.darkGray,
		lineHeight: 26,
	},
	minorHeader: {
		fontSize: 20,
		fontWeight: "bold",
		color: colours.darkGray,
	},
	smallHeader: {
		fontSize: 18,
		fontWeight: "bold",
		color: colours.black,
	},
	labeledImageButton: {
		fontSize: 17,
		fontWeight: "bold",
		color: colours.white
	},
	description: {
		fontSize: 15,
		color: colours.black
	},
	subtitle: {
		fontSize: 15,
		color: colours.gray,
	}
})
