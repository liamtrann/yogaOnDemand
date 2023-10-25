import React, {useState} from "react";
import GenericMessageModal from "../GenericMessageModal";
import YogaButton from "../../YogaButton";
import YogaLabel from "../../inputs/YogaLabel";
import DateTimePicker from '@react-native-community/datetimepicker';
import {Platform, PlatformColor, StyleSheet, View} from "react-native";
import moment from "moment";
import YogaText from "../../YogaText";
import colours from "../../../theme/colours";

interface IProps {
	open: boolean;
	title: string;

	onClose(): void;

	callback(start, end): void;
}

const DatePickerModal: React.FC<IProps> = (props) => {
	const [startDate, setStartDate] = useState(moment().startOf("week").toDate());
	const [endDate, setEndDate] = useState(moment().endOf("week").toDate());

	const onChange = (event, selectedDate) => {
		const currentDate = selectedDate || startDate;
		setStartDate(moment(currentDate).startOf("week").toDate());
		setEndDate(moment(currentDate).endOf("week").toDate());
	};


	function callback() {
		props.callback(
			moment(startDate).valueOf(),
			moment(endDate).valueOf()
		);
		props.onClose();
	}

	return (
		<GenericMessageModal
			title={props.title}
			visible={props.open}
			showButton={false}
			onClose={props.onClose}
		>

			<YogaLabel>Select Week</YogaLabel>

			<View style={{flexDirection: "row", justifyContent: "center", paddingBottom: 30}}>

				<View style={{width: 160, alignSelf: "center"}}>
					<DateTimePicker
						testID="dateTimePicker"
						value={startDate}
						mode={"date"}
						display="compact"
						onChange={onChange}
					/>
				</View>

				<View style={{justifyContent: "center", alignItems: "center", marginRight: 35}}>
					<YogaText>To</YogaText>
				</View>

				<View style={{width: 160, alignSelf: "center"}}>
					<DateTimePicker
						testID="dateTimePicker"
						value={endDate}
						mode={"date"}
						display="compact"
						onChange={onChange}
					/>
				</View>

			</View>

			<YogaButton
				theme={"primary"}
				style={{alignSelf: "center", marginBottom: 20}}
				text={"Filter Results"}
				onPress={callback}
			/>

		</GenericMessageModal>
	);
}

const styles = StyleSheet.create({
	customButton: {
		maxWidth: 120,
		borderWidth: 1,
		borderColor: colours.lightGray,
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 7,
		backgroundColor: colours.lightGray,
		marginVertical: 10,
	},
	customButtonText: {
		color: PlatformColor("systemBlue"),
		fontWeight: "400",
		fontSize: 16,
		textAlign: "left",
	}
});
export default DatePickerModal;
