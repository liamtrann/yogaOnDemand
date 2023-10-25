import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import SettingsPage from "../screens/settings/SettingsPage";
import SubscriptionPage from "../screens/settings/SubscriptionPage";

const SettingsStack = createStackNavigator();

const SettingsNavigator: React.FC = () => {

	return (
		<SettingsStack.Navigator>
			<SettingsStack.Screen name="SettingsPage" component={SettingsPage} options={{headerShown: false}}/>
			<SettingsStack.Screen name="SubscriptionPage" component={SubscriptionPage} options={{headerShown: false}}/>
		</SettingsStack.Navigator>
	);
};

export default SettingsNavigator;
