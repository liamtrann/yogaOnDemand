import React from "react";
import SafeAreaView from "react-native-safe-area-view";
import globalStyles from "../../theme/globalStyles";
import {View} from "react-native";
import YogaTable from "../../components/profile/YogaTable";
import RecentlyViewed from "../../components/profile/RecentlyViewed";
import {StackNavigationProp} from "@react-navigation/stack";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

interface IProps {
	navigation?: StackNavigationProp<any>;
	dispatch?: any;
	token?: any;
}


const ProfilePage: React.FC<IProps> = (props) => {

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<KeyboardAwareScrollView>
				<View style={globalStyles.pagePadding}>

					<YogaTable/>

					<RecentlyViewed/>

				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	);
};

export default ProfilePage;
