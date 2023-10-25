import {View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Button, TouchableWithoutFeedback} from 'react-native';
import React from "react";
import {BottomTabBarProps, BottomTabNavigationEventMap} from "@react-navigation/bottom-tabs/src/types";
import {BottomTabDescriptorMap} from "@react-navigation/bottom-tabs/lib/typescript/src/types";
import {NavigationHelpers, ParamListBase, TabNavigationState} from "@react-navigation/native";
import colours from "../theme/colours";
import Favourites from "../../assets/icons/favorites-dynamic.svg";
import Classes from "../../assets/icons/classes-dynamic.svg";
import Settings from "../../assets/icons/settings-dynamic.svg";
import Profile from "../../assets/icons/profile-dynamic.svg";

function getTabBarIcon(_icon: string): any {
	switch (_icon) {
		case "Profile":
			return Profile;
		case "Featured":
			return Favourites;
		case "Classes":
			return Classes;
		case "Settings":
			return Settings;
		default:
			return Favourites;
	}
}

const TabBar: React.FC<BottomTabBarProps> = (props) => {

	const state: TabNavigationState<ParamListBase> = props.state;
	const descriptors: BottomTabDescriptorMap = props.descriptors;
	const navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap> = props.navigation;

	const focusedOptions = descriptors[state.routes[state.index].key].options;

	if (focusedOptions.tabBarVisible === false) {
		return null;
	}

	return (
		<SafeAreaView style={styles.container}>

			{/* TODO Figure out why the tab navigation defaults to calling the first touchable event on the page */}
			<TouchableOpacity><View style={{width: 1}}/></TouchableOpacity>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
						? options.title
						: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: 'tabLongPress',
						target: route.key,
					});
				};

				const Icon = getTabBarIcon(label as string);

				const color: string = isFocused ? colours.darkGray : colours.gray;

				return (
					<TouchableOpacity
						key={`tab-bar-item-${index}`}
						accessibilityRole="button"
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						onPress={onPress}
						activeOpacity={1}
						style={styles.tab}
					>
						<Icon
							style={{color}}
							width={30}
							height={30}
						/>
						<Text
							style={[
								styles.tabLabel,
								{color}
							]}
						>
							{label}
						</Text>
					</TouchableOpacity>
				);
			})}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		zIndex: 10,
		flexDirection: "row",
		backgroundColor: colours.white,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.23,
		shadowRadius: 2.62,

		elevation: 4, // android
	},
	tab: {
		flex: 1,
		alignItems: "center",
		paddingTop: 12,
	},
	tabLabel: {
		marginTop: 7,
	},
});

export default TabBar;
