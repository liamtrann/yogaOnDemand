import React from "react";
import {FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View} from "react-native";
import colours from "../../theme/colours";
import YogaText from "../YogaText";

interface IProps {
	items?: Array<{ display: string, value: any, selected?: boolean }>;
	onSelect?: (v: any) => void;
}

const YogaSelectList: React.FC<IProps> = (props) => {

	const renderItem: ListRenderItem<{display: string, value: any, selected?: boolean}> = (info) =>  {

		function onPress() {
			if (props.onSelect) {
				props.onSelect(info.item.value);
			}
		}

		return (
			<TouchableOpacity key={info.index + Math.random()} onPress={onPress} disabled={props.onSelect === undefined} style={styles.row}>
				<YogaText style={{color: info.item.selected ? colours.black : colours.gray}}>{info.item.display}</YogaText>
			</TouchableOpacity>
		)
	}

	function keyExtractor() {
		return Math.random().toString();
	}

	return (
		<View style={styles.view}>
			<FlatList
				style={styles.flatList}
				data={props.items}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
			/>
		</View>
	)
};

const styles = StyleSheet.create({
	view: {
		shadowColor: colours.black,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 3,
		shadowOpacity: 0.5,
		backgroundColor: colours.white,
		maxHeight: 110,
		borderRadius: 5,
		minHeight: 30,
	},
	flatList: {
		paddingVertical: 10
	},
	row: {
		height: 30,
		justifyContent: "center",
		paddingHorizontal: 10,
	}
});

export default YogaSelectList;