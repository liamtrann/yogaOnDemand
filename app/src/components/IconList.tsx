import React, {ReactNode} from "react";
import {ActivityIndicator, StyleSheet, View} from "react-native";
import {Equipment, VideoInterval} from "client";
import globalStyles from "../theme/globalStyles";
import YogaText from "./YogaText";
import textStyles from "../theme/textStyles";
import parseEquipmentEnumsToIcon, {parseEquipmentEnumToDisplayString} from "../utils/parseEquipmentEnums";
import parseIntervalEnumsToIcon from "../utils/parseIntervalEnums";

type IconListEntry = {
	icon?: ReactNode;
	mainText?: string;
	subTitle?: string;
}

interface IProps {
	entries: IconListEntry[]
}

const IconList: React.FC<IProps> = ({entries}) => {

	function createEntry(entry: IconListEntry, i: number) {

		let Icon: any;
		if (entry.icon) {
			Icon = entry.icon;
		}

		return (
			<React.Fragment>
				<View key={`entry_${i}_${entry.mainText}_${entry.subTitle}`} style={styles.entryContainer}>

					<View style={styles.iconContainer}>
						{entry.icon && (
							<Icon
								width={40}
								height={40}
							/>
						)}
					</View>

					{entry.mainText && <YogaText style={textStyles.description}>{entry.mainText}</YogaText>}
					{
						entry.subTitle &&
						<React.Fragment>
							<YogaText style={textStyles.description}>&nbsp;&nbsp;—&nbsp;&nbsp;</YogaText>
							<YogaText style={textStyles.description}>{entry.subTitle}</YogaText>
						</React.Fragment>
					}
				</View>
				{i !== entries.length - 1 && <View style={globalStyles.verticalSpacingMedium}/>}
			</React.Fragment>
		)
	}

	if (!entries) {
		return <ActivityIndicator/>
	}

	return (
		<React.Fragment>
			{entries.map(createEntry)}
		</React.Fragment>
	);
}

const styles = StyleSheet.create({
	entryContainer: {
		display: "flex",
		width: "100%",
		flexDirection: "row",
		alignItems: "center"
	},
	iconContainer: {
		// height: 40,
		// width: 40,
		// borderRadius: 20,
		// borderColor: colours.black,
		// borderWidth: 1,
		marginRight: 20
	}

});

export function createEntriesFromEquipment(equipmentArray: Equipment[]): IconListEntry[] {
	return equipmentArray.map(e => {
		return {
			mainText: parseEquipmentEnumToDisplayString(e),
			// subTitle: "test",
			icon: parseEquipmentEnumsToIcon(e),
		};
	})
}

export function createEntriesFromIntervals(intervalArray: VideoInterval[]): IconListEntry[] {
	return intervalArray.map(e => {
		return {
			icon: parseIntervalEnumsToIcon(e.icon),
			mainText: e.duration.toString() + " min",
			subTitle: e.name
		}
	})
}

export default IconList;
