import {StyleSheet} from "react-native";
import colours from "../../theme/colours";
import globalStyles from "../../theme/globalStyles";

export default StyleSheet.create({
	displayBox: {
		borderRadius: 5,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colours.gray,
		backgroundColor: colours.white,
		width: "100%",
		color: colours.black,
		padding: 14,
	},
	text: {
		fontFamily: "Lato",
		fontSize: 14,
	},
	inputMock: {
		alignItems: "flex-end",
		justifyContent: "center",
		paddingRight: 10,
	},
	inputMockHeightHelper: {
		height: 45,
	},
	dropdownView: {
		width: "100%",
		alignSelf: "flex-end",
		marginBottom: 10
	},
	parentView: {
		width: "100%",
	},
	shadow: {
		shadowColor: "#000000",
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},
})
