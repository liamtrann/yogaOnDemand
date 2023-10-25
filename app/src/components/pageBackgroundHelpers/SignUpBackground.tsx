import React, {ReactNode} from "react";
import globalStyles from "../../theme/globalStyles";
import {ImageBackground} from "react-native";

const bg = require("../../../assets/backgrounds/lotus-flower.jpg");

interface IProps {
	children?: ReactNode;
}

const SignUpBackground: React.FC<IProps> = (props: IProps) => {

	return (
		<ImageBackground
			source={bg}
			style={globalStyles.imageBackgroundView}
			imageStyle={[globalStyles.backgroundImage, {
				// marginTop: 70,
				// marginLeft: -100,
				resizeMode: "cover",
				transform: [{ scale: 1.3}],
			}]}
		>
			{props.children}
		</ImageBackground>
	);
};

export default SignUpBackground;
