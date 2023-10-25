import React, {useEffect, useRef, useState} from "react";
import {Animated, StyleSheet, TouchableOpacity, View, ViewStyle} from "react-native";
import YogaText from "../YogaText";
import YogaInputsStyle from "./YogaInputsStyle";
import YogaArrowButton from "./YogaArrowButton";
import YogaSelectList from "./YogaSelectList";
import colours from "../../theme/colours";

interface IYogaDropdownProps {
	value?: any;
	placeholder?: string;
	items?: Array<{ display: string, value: any }>;
	onChange?: (v: any) => void;
	style?: ViewStyle;
}

const YogaDropdown: React.FC<IYogaDropdownProps> = (props) => {

	const [open, setOpen] = useState(false);

	const opacity = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(
			opacity,
			{
				toValue: open ? 1 : 0,
				duration: 200,
				useNativeDriver: true,
			}
		).start();
	}, [open])

	function toggleOpen() {
		setOpen(!open)
	}

	function onSelect(v: any) {
		if (props.onChange) {
			props.onChange(v);
		}
		toggleOpen();
	}

	let displayValue: string = "";
	const convertedItems: Array<{ display: string, value: any, selected: boolean }> = (props.items as Array<{ display: string, value: any }>).map(v => {

		displayValue = v.value === props.value ? v.display : "";

		return {
			display: v.display,
			value: v.value,
			selected: v.value === props.value,
		}
	});

	return (
		<View style={props.style}>
			<View style={YogaInputsStyle.parentView}>
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={toggleOpen}
					disabled={convertedItems.length < 1}
				>
					<View style={[YogaInputsStyle.displayBox, YogaInputsStyle.inputMock, YogaInputsStyle.shadow, YogaInputsStyle.inputMockHeightHelper, styles.mockInputContainer]}>
						<YogaText style={[styles.selectedValue, {color: props.value !== undefined ? colours.black : colours.gray}]}>{props.value !== undefined ? displayValue : (props.placeholder ? props.placeholder : "")}</YogaText>

						<YogaArrowButton
							disabled={true}
							direction={convertedItems.length > 0 ? open ? "up" : "down" : "left"}
						/>
					</View>
				</TouchableOpacity>

			</View>
			{
				(open && convertedItems.length > 0) &&
				<Animated.View style={[YogaInputsStyle.dropdownView, {opacity: opacity}]}>
					<YogaSelectList items={convertedItems} onSelect={onSelect}/>
				</Animated.View>
			}
		</View>

	)
}

const styles = StyleSheet.create({
	mockInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	selectedValue: {
		marginTop: -2,
	}
});

YogaDropdown.defaultProps = {
	items: []
}

export default YogaDropdown;
