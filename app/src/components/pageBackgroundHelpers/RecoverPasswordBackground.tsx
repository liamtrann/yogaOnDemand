import React, {ReactNode} from "react";
import globalStyles from "../../theme/globalStyles";
import {ImageBackground} from "react-native";

const bg = require("../../../assets/backgrounds/rocks.jpg");

interface IProps {
	children?: ReactNode;
}

const RecoverPasswordBackground: React.FC<IProps> = (props: IProps) => {

	return (
		<ImageBackground
			source={bg}
			style={globalStyles.imageBackgroundView}
			imageStyle={[globalStyles.backgroundImage, {
				resizeMode: "cover",
				transform: [{ scale: 1.2}],
			}]}
		>
			{props.children}
		</ImageBackground>
	);
};

export default RecoverPasswordBackground;
