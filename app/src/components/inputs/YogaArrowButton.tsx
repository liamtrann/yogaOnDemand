import React, {useEffect, useRef, useState} from "react";
import {TouchableOpacity, TouchableOpacityProps, View, StyleSheet, Animated, Easing} from "react-native";
import colours from "../../theme/colours";
import YogaText from "../YogaText";

interface IProps extends TouchableOpacityProps {
	direction?: "up" | "left" | "right" | "down";
}

const YogaArrowButton: React.FC<IProps> = (props) => {
	const rotation = useRef(new Animated.Value(determineRotation(props.direction))).current

	useEffect(() => {
		const newRotation = determineRotation(props.direction);
		Animated.timing(
			rotation,
			{
				toValue: newRotation,
				duration: 200,
				useNativeDriver: true,
			}
		).start();
	}, [props.direction])

	return (
		<TouchableOpacity {...props} style={[style.touchableOpacity, props.style]}>
			<Animated.View
				style={[
					style.view,
					{
						transform: [
							{
								rotate: rotation.interpolate({
									inputRange: [0, 360],
									outputRange: ['0deg', '360deg']
								})
							}
						]
					}
				]}
			>
				<YogaText style={style.text}>V</YogaText>
			</Animated.View>
		</TouchableOpacity>
	)
};

function determineRotation(direction: "up" | "left" | "right" | "down" = "down"): number {
	switch (direction) {
		case "up":
			return 180;
		case "left":
			return 90;
		case "right":
			return 270;
		case "down":
			return 0;
	}
}

const style = StyleSheet.create({
	touchableOpacity: {
		width: 30,
		height: 30,
	},
	view: {
		backgroundColor: colours.darkGray,
		height: 30,
		width: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		color: colours.lightGray,
		fontWeight: "900",
	}
})

YogaArrowButton.defaultProps = {
	direction: "down",
	activeOpacity: 0.5,
}


export default YogaArrowButton;