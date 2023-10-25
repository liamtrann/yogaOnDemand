import * as React from "react";
import {Modal, ModalProps, StyleSheet, useWindowDimensions, View} from "react-native";
import globalStyles from "../../theme/globalStyles";
import {ReactNode} from "react";
import ModalCard from "./ModalCard";
import YogaText from "../YogaText";
import YogaButton from "../YogaButton";

interface IProps extends ModalProps {
	animationType?: "slide" | "fade"
	title: string;
	children: ReactNode | string;
	visible: boolean;
	buttonText?: string;
	buttonDisabled?: boolean;
	showButton?: boolean;
	onClose?(): void;
	onDismiss?(): void;
}

const GenericMessageModal: React.FC<IProps> = (props) => {

	const window = useWindowDimensions();
	return (
		<Modal
			visible={props.visible}
			transparent={true}
			animationType={props.animationType}
		>
			<View style={[style.modalContent, globalStyles.pagePadding, {width: window.width, height: window.height}]}>
				<ModalCard
					title={props.title}
					onClose={props.onClose}
				>

					{typeof props.children === "string" ? (
						<YogaText style={style.textCenter}>
							{props.children}
						</YogaText>
					) : (
						<React.Fragment>
							{props.children}
						</React.Fragment>
					)}

					{props.showButton && (
						<View style={style.alignCenter}>
							<YogaButton
								theme="primary"
								style={style.dismissButton}
								disabled={props.buttonDisabled}
								onPress={props.onDismiss}
							>
								{props.buttonText}
							</YogaButton>
						</View>
					)}
				</ModalCard>
			</View>
		</Modal>
	);
};

const style = StyleSheet.create({
	modalContent: {
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		justifyContent: "center",
		height: "100%",
	},
	textCenter: {
		textAlign: "center",
	},
	alignCenter: {
		alignItems: "center",
	},
	dismissButton: {
		marginTop: 15,
		alignSelf: "center",
	},
});

GenericMessageModal.defaultProps = {
	animationType: "fade",
	buttonText: "Close Window",
	showButton: true,
}

export default GenericMessageModal;
