import {VideoIntervalIcon} from "client";
import {ReactNode} from "react";
import CardioHeart from "../../assets/icons/cardio_heart.svg";
import Stretch from "../../assets/icons/stretch.svg";
import Meditation from "../../assets/icons/meditation.svg";
import Weights from "../../assets/icons/weights.svg";
import Endurance from "../../assets/icons/endurance.svg";
import HiiT from "../../assets/icons/hiit_heart.svg";

export default function parseIntervalEnumsToIcon(icon: VideoIntervalIcon): ReactNode {

	switch(icon) {
		default:
		case VideoIntervalIcon.HEART:
			return CardioHeart;
		case VideoIntervalIcon.STRETCH:
			return Stretch;
		case VideoIntervalIcon.MEDITATION:
			return Meditation;
		case VideoIntervalIcon.WEIGHTS:
			return Weights;
		case VideoIntervalIcon.ENDURANCE:
			return Endurance;
		case VideoIntervalIcon.HIIT:
			return HiiT;
	}
}

export function parseIntervalEnumToDisplayString(icon: VideoIntervalIcon): string {
	switch(icon) {
		default:
		case VideoIntervalIcon.HEART:
			return "Heart"
		case VideoIntervalIcon.STRETCH:
			return "Stretch";
		case VideoIntervalIcon.MEDITATION:
			return "Meditation";
		case VideoIntervalIcon.WEIGHTS:
			return "Weights";
		case VideoIntervalIcon.ENDURANCE:
			return "Endurance";
		case VideoIntervalIcon.HIIT:
			return "HIIT";
	}
}
