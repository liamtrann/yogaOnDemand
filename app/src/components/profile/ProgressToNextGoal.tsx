import React from "react";
import {StyleSheet, View} from "react-native";
import YogaText from "../YogaText";
import {UserStats} from "client";
import ProgressBar from "../YogaProgressBar";

import Chart from "../../../assets/icons/ic_format_align_left_24px.svg";

interface IProps {
	data: UserStats;
}


const ProgressToNextGoal: React.FC<IProps> = (props) => {

	const {data} = props;

	return (
		<React.Fragment>
				<YogaText>Progress to Next Goal</YogaText>
				<View style={styles.progressContainer}>
					<Chart height={50} width={50}/>
					<YogaText
						style={styles.paddingVertical20}
					>
						{data?.expToGoal} xp until the next goal. Earn points by taking classes.
					</YogaText>
					<ProgressBar
						leftLabel={`${data?.startOfGoal} xp`}
						rightLabel={`${data?.endOfGoal} xp`}
						progress={data?.currentExp / data?.endOfGoal}
					/>
				</View>
		</React.Fragment>
	);
};

const styles = StyleSheet.create({
	progressContainer: {
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	paddingVertical20: {
		paddingVertical: 20
	}
});

export default ProgressToNextGoal;
