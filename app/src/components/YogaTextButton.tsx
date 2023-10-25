import React from "react";
import {TextProps, TouchableOpacity, TouchableOpacityProps} from "react-native";
import YogaText from "./YogaText";

interface IProps extends TouchableOpacityProps {
	textProps?: TextProps,
}

const YogaTextButton: React.FC<IProps> = (props) => {
	const touchableOpacityProps = props;
	delete touchableOpacityProps.textProps;
	return (
		<TouchableOpacity activeOpacity={0.5} {...touchableOpacityProps}>
			<YogaText {...props.textProps}>{props.children}</YogaText>
		</TouchableOpacity>
	)
}

export default YogaTextButton;