import React from "react";
import {TextInput, TextInputProps, View} from "react-native";
import YogaInputsStyle from "./YogaInputsStyle";
import colours from "../../theme/colours";

interface IProps extends TextInputProps {
	forwardRef?: any;
}

const YogaTextInput: React.FC<IProps> = (props) => {
	return (
		<View style={YogaInputsStyle.shadow}>
			<TextInput
				{...props}
				ref={props.forwardRef && props.forwardRef}
				style={[YogaInputsStyle.displayBox, YogaInputsStyle.text, props.style, {shadowOpacity: 0, shadowColor: "transparent"}]}
				placeholderTextColor={colours.gray}
				selectionColor={colours.gray}
			/>
		</View>
	)
}

export default YogaTextInput;
