import {VideoIntervalIcon} from "client";

export default function parseIntervalEnumsToIcon(icon: VideoIntervalIcon): string {
	const base: string = process.env.PUBLIC_URL;

	switch(icon) {
		default:
		case VideoIntervalIcon.HEART:
			return base + "/app-icons/cardio_heart.svg";
		case VideoIntervalIcon.STRETCH:
			return base + "/app-icons/stretch.svg";
		case VideoIntervalIcon.MEDITATION:
			return base + "/app-icons/meditation.svg";
		case VideoIntervalIcon.WEIGHTS:
			return base + "/app-icons/weights.svg";
		case VideoIntervalIcon.ENDURANCE:
			return base + "/app-icons/endurance.svg";
		case VideoIntervalIcon.HIIT:
			return base + "/app-icons/hiit_heart.svg";
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
