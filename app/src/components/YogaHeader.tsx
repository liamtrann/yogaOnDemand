import React from "react";
import {StyleSheet, TextStyle, TouchableOpacity, View} from "react-native";
import YogaText from "./YogaText";
import textStyles from "../theme/textStyles";
import Back from "../../assets/icons/backarrow.svg";
import {useNavigation} from "@react-navigation/native";
import Line from "./Line";

interface IProps {
	title?: string;
	back?: boolean;
	textStyle?: TextStyle;
	addLine?: boolean;
}

const YogaHeader: React.FC<IProps> = (props: IProps) => {

	const navigation = useNavigation();

	function onBack(): void {
		navigation.goBack();
	}

	return (
		<React.Fragment>
			<View style={[styles.container]}>
				{props.back && (
					<TouchableOpacity activeOpacity={0.7} style={styles.backButtonContainer} onPress={onBack}>
						<Back height={28} width={18}/>
					</TouchableOpacity>
				)}

				<YogaText style={[textStyles.pageHeader, props.textStyle]}>
					{props.title}
				</YogaText>
			</View>

			{props.addLine && <Line style={styles.line}/>}
		</React.Fragment>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	backButtonContainer: {
		paddingRight: 15,
		paddingLeft: 15,
		marginLeft: -15,
	},
	line: {
		marginVertical: 15,
	}
});

YogaHeader.defaultProps = {
	back: true,
};

export default YogaHeader;
