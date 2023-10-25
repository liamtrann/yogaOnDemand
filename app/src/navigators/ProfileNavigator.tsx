import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import ProfilePage from "../screens/profile/ProfilePage";
import SubscriptionPage from "../screens/settings/SubscriptionPage";
import VideoPage from "../screens/VideoPage";

const ProfileStack = createStackNavigator();

const ProfileNavigator: React.FC = () => {

	return (
		<ProfileStack.Navigator>
			<ProfileStack.Screen name="ProfilePage" component={ProfilePage} options={{headerShown: false}}/>
			<ProfileStack.Screen name="VideoPage" component={VideoPage} options={{headerShown: false}}/>
			<ProfileStack.Screen name="SubscriptionPage" component={SubscriptionPage} options={{headerShown: false}}/>
		</ProfileStack.Navigator>
	);
};

export default ProfileNavigator;
