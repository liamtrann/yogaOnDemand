import React from "react";
import {GestureResponderEvent, StyleSheet, View, ViewStyle} from "react-native";
import YogaText from "./YogaText";
import YogaButton from "./YogaButton";
import textStyles from "../theme/textStyles";
import globalStyles from "../theme/globalStyles";

interface IProps {
	title: string,
	subtitle: string,
	largePrice: string,
	smallPrice: string,
	buttonText: string,
	onPress?: () => void;
	style?: ViewStyle;
	disabled?: boolean;
}

const SubscriptionListItem: React.FC<IProps> = (props) => {

	const {title, subtitle, largePrice, smallPrice, buttonText, onPress, style} = props;

	return (
		<View style={[styles.container, style]}>
			<YogaText style={[textStyles.bold, textStyles.dark]}>{title}</YogaText>
			<YogaText style={[textStyles.dark]}>{subtitle}</YogaText>
			<View style={globalStyles.verticalSpacingSmall}/>
			<YogaText style={[textStyles.minorHeader, textStyles.dark]}>{largePrice}</YogaText>
			<View style={globalStyles.verticalSpacingSmall}/>
			<YogaText style={[textStyles.dark]}>{smallPrice}</YogaText>
			<View style={globalStyles.verticalSpacingSmall}/>
			<YogaButton disabled={props.disabled} size="small" text={buttonText} onPress={onPress} theme={props.disabled ? "primary-border" : "primary"}/>
		</View>
	)
}


const styles = StyleSheet.create({
	container: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
})

export default SubscriptionListItem;