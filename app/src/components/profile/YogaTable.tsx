import React, {useEffect, useState} from "react";
import {Image, StyleSheet, View, ViewStyle} from "react-native";
import colours from "../../theme/colours"
import YogaText from "../YogaText";
import YogaButton from "../YogaButton";
import {UserApi, UserStats} from "client";
import moment from "moment";
import YogaHeader from "../YogaHeader";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";
import {IStore} from "../../redux/defaultStore";
import {connect} from "react-redux";
import DatePickerModal from "../modal/custom/DatePickerModal";
import ProgressToNextGoal from "./ProgressToNextGoal";

import Line from "../Line";
import { isNil } from "lodash";

interface IProps {
	dispatch?: any;
	token?: string;
	style?: ViewStyle;
}

interface IFormattedData {
	index?: number;
	date: string,
	minutes: number,
}

const start = moment().startOf("week").valueOf();
const end = moment().endOf("week").valueOf();

const YogaTable: React.FC<IProps> = (props) => {

	const [data, setData] = useState<UserStats>();

	const [dateFilterModal, setDateFilterModal] = useState<boolean>(false);
	const [formattedData, setFormattedData] = useState<IFormattedData[]>();
	const [maxValue, setMaxValue] = useState<number>();
	const [startOfWeek, setStartOfWeek] = useState<number>();
	const [endOfWeek, setEndOfWeek] = useState<number>();

	useEffect(() => {
		props.dispatch(incrementLoading());
		try {
			if (startOfWeek) {
				getProfileData(false).then().catch();
			} else {
				getProfileData(true).then().catch();
			}
		} catch (err) {
			props.dispatch(addError(err));
		}
		props.dispatch(decrementLoading());
	}, [startOfWeek]);

	async function getProfileData(pristine: boolean = true) {
		const res = await new UserApi(getConfig(props.token)).getUserStats({
			startTime: pristine ? start : startOfWeek,
			endTime: pristine ? end : endOfWeek,
		});
		setData(res);
		formatData(res);
	}

	function formatData(data: UserStats): void {
		const tempFormat = Object.entries(data?.watchTimeData).map((item, index) => {
			if (index === 0) {
				setStartOfWeek(moment(item[0], "x").valueOf());
			}
			if (index === (Object.entries(data?.watchTimeData).length - 1)) {
				setEndOfWeek(moment(item[0], "x").valueOf());
			}
			return {
				index: index,
				date: moment(item[0], "x").format("MM/DD"),
				minutes: Math.round(item[1] / 60),
			};
		});
		const tempNumber = Math.round(biggestNumberInArray(Object.values(data.watchTimeData)) / 60);

		setFormattedData(tempFormat);
		setMaxValue(tempNumber);
	}

	function biggestNumberInArray(arr) {
		return Math.max(...arr);
	}

	function createBar(data, index): JSX.Element {
		let barColor: string = (index % 2 === 0) ? colours.lightGray : colours.darkGray;

		return (
			<View
				key={`bar-item-${index}`}
				style={styles.tableBarContainer}
			>
				<YogaText style={{fontWeight: "900", paddingVertical: 5}}>{`${data.minutes} min.`}</YogaText>
				<View style={[styles.tableBar, {
					backgroundColor: barColor,
					height: `${(data.minutes / maxValue) * 100}%`
				}]}/>
			</View>
		);
	}

	function createDates(data, index): JSX.Element {
		return (
			<React.Fragment
				key={`date-item-${index}`}
			>
				<View
					style={styles.tableDatesContainer}
				>
					<YogaText style={{fontWeight: "900"}}>{`${data.date}`}</YogaText>
				</View>

			</React.Fragment>
		);
	}

	function toggleDateFilterModal() {
		setDateFilterModal(!dateFilterModal);
	}

	function setDateRange(start, end) {
		setStartOfWeek(start);
		setEndOfWeek(end)
	}

	const hasName = !isNil(data?.user?.firstName);

	return (
		<React.Fragment>
			<YogaHeader title={`Hello ${hasName ? `,${data.user.firstName}.` : ""}`}
			            back={false} addLine={true}/>

			<YogaText style={{paddingVertical: 15}}>
				Activity Tracker - {
				startOfWeek === moment(start, "x").valueOf() ? (
					`This Week`
				) : (
					`${moment(startOfWeek, "x").format("MMM. DD")} - ${moment(endOfWeek, "x").format("DD, YYYY")}`
				)
			}
			</YogaText>

			<View style={[styles.YogaTableContainer, props.style]}>

				<View style={[styles.tableHeader]}>
					<YogaText>{`${moment(startOfWeek, "x").format("MMM. DD")} - ${moment(endOfWeek, "x").format("DD, YYYY")}`}</YogaText>
					<YogaButton
						onPress={toggleDateFilterModal}
						text="Other Dates"
						buttonStyle={{width: "100%", paddingHorizontal: 15}}
					/>
				</View>

				<View style={styles.tableContentContainer}>
					{formattedData && formattedData.length > 0 && (
						formattedData.map(createBar)
					)}
				</View>

				<View style={styles.tableDates}>
					{formattedData && formattedData.length > 0 && (
						formattedData.map(createDates)
					)}
				</View>

			</View>

			<Line style={{marginVertical: 30}}/>

			<ProgressToNextGoal data={data} />

			<Line style={{marginVertical: 30}}/>



			<DatePickerModal
				open={dateFilterModal}
				title={"Other Weeks"}
				onClose={toggleDateFilterModal}
				callback={setDateRange}
			/>

		</React.Fragment>
	);
};

const styles = StyleSheet.create({
	YogaTableContainer: {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		backgroundColor: colours.white,
		borderRadius: 10,
		borderColor: colours.lightGray,
		shadowColor: colours.darkGray,
		shadowOpacity: 0.8,
		shadowRadius: 2,
		shadowOffset: {
			height: 1.5,
			width: 1.5
		},
	},
	tableHeader: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	tableContentContainer: {
		flex: 1,
		flexDirection: "row",
		minHeight: 250,
		paddingBottom: 15,
		width: "100%",
		justifyContent: "space-around",
		alignItems: "flex-end"
	},
	tableBarContainer: {
		flexDirection: "column",
		justifyContent: "flex-end",
		alignItems: "center",
		height: "100%"
	},
	tableBar: {
		borderRadius: 5,
		width: 25,
	},
	tableDatesContainer: {
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		height: "100%"
	},
	tableDates: {
		flex: 1,
		flexDirection: "row",
		minHeight: 50,
		width: "100%",
		justifyContent: "space-around",
		backgroundColor: colours.lightGray,
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10,
	},
});

export default connect((store: IStore) => {
	return {
		token: store.metaStore.token,
	}
})(YogaTable);
