import React, {useEffect, useRef, useState} from "react";
import {Animated, StyleSheet, TextProps, TouchableOpacity, View} from "react-native";
import YogaText from "../YogaText";
import YogaTextInput from "./YogaTextInput";
import YogaInputsStyle from "./YogaInputsStyle";
import YogaArrowButton from "./YogaArrowButton";
import YogaSelectList from "./YogaSelectList";
import YogaPill from "../YogaPill";
import {cloneDeep} from "lodash";

interface IYogaMultiSelectProps {
	value?: any[];
	placeholder?: string;
	items?: Array<{ display: string, value: any }>;
	onChange?: (v: any) => void;
}

const YogaMultiSelect: React.FC<IYogaMultiSelectProps> = (props) => {

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
		const included = props.value?.includes(v);
		if (props.onChange) {
			const newArray = cloneDeep(props.value) as any[];
			if (!included) {
				newArray.push(v);
			} else {
				const index = newArray.indexOf(v);
				newArray.splice(index, 1);
			}
			props.onChange(newArray);
		}
	}

	const convertedItems: Array<{ display: string, value: any, selected: boolean }> = (props.items as Array<{ display: string, value: any }>).map(v => ({
		display: v.display,
		value: v.value,
		selected: Array.isArray(props.value) ? props.value.includes(v.value) : false,
	}))

	const selectedItems: Array<{ display: string, value: any, selected: boolean }> = convertedItems.filter(v => v.selected);

	function renderPill(v: { display: string, value: any, selected: boolean }, i: number) {
		function onClose() {
			const newArray = cloneDeep(props.value) as any[];
			const index = newArray.indexOf(v.value);
			newArray.splice(index, 1);
			if (props.onChange) {
				props.onChange(newArray);
			}
		}

		return (
			<View style={styles.pillView} key={Math.random()}>
				<YogaPill key={Math.random()} text={v.display} onClose={onClose}/>
			</View>
		)
	}

	return (
		<React.Fragment>
			<View style={YogaInputsStyle.parentView}>
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={toggleOpen}
					disabled={convertedItems.length < 1}
				>
					<View style={[YogaInputsStyle.displayBox, YogaInputsStyle.inputMock]}>
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

			{
				selectedItems.length > 0 &&
				<View style={styles.pillContainer}>
					{selectedItems.map(renderPill)}
				</View>
			}
		</React.Fragment>
	)
};

const styles = StyleSheet.create({
	pillView: {
		marginBottom: 5,
		marginRight: 10,
	},
	pillContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 10
	}
})

YogaMultiSelect.defaultProps = {
	items: []
}

export default YogaMultiSelect;