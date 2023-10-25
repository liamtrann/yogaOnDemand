import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import FeaturedPage from "../screens/featured/FeaturedPage";
import VideoPage from "../screens/VideoPage";
import SubscriptionPage from "../screens/settings/SubscriptionPage";

const FeaturedStack = createStackNavigator();

const SettingsNavigator: React.FC = () => {

	return (
		<FeaturedStack.Navigator>
			<FeaturedStack.Screen name="FeaturedPage" component={FeaturedPage} options={{headerShown: false}}/>
			<FeaturedStack.Screen name="VideoPage" component={VideoPage} options={{headerShown: false}}/>
			<FeaturedStack.Screen name="SubscriptionPage" component={SubscriptionPage} options={{headerShown: false}}/>
		</FeaturedStack.Navigator>
	);
};

export default SettingsNavigator;
