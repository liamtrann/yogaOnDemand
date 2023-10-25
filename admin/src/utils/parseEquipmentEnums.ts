import {Equipment} from "client";

export default function parseEquipmentEnumsToIcon(equipment: Equipment): string {
	const base: string = process.env.PUBLIC_URL;

	switch(equipment) {
		case Equipment.WORKOUTMAT:
			return base + "/app-icons/yoga_mat.svg";
		case Equipment.LIGHTWEIGHTS:
			return base + "/app-icons/weights.svg";
		case Equipment.MEDIUMWEIGHTS:
			return base + "/app-icons/weights.svg";
		case Equipment.HEAVYWEIGHTS:
			return base + "/app-icons/weights.svg";
		case Equipment.BIKE:
			return base + "/app-icons/bike.svg";
		case Equipment.RESISTANTBAND:
			return base + "/app-icons/resistance_band.svg";
		case Equipment.PILATESFITBALL:
			return base + "/app-icons/pilates_ball.svg";
		case Equipment.AERIALYOGAHAMMOCK:
			return base + "/app-icons/hammock.svg";
		default:
			return "";
	}
}

export function parseEquipmentEnumToDisplayString(equipment: Equipment): string {
	switch(equipment) {
		case Equipment.WORKOUTMAT:
			return "Workout Mat";
		case Equipment.LIGHTWEIGHTS:
			return "Light Weights";
		case Equipment.MEDIUMWEIGHTS:
			return "Medium Weights";
		case Equipment.HEAVYWEIGHTS:
			return "Heavy Weights";
		case Equipment.BIKE:
			return "Bike";
		case Equipment.RESISTANTBAND:
			return "Resistant Band";
		case Equipment.PILATESFITBALL:
			return "Pilates Fit Ball";
		case Equipment.AERIALYOGAHAMMOCK:
			return "Aerial Yoga Hammock";
		default:
			return equipment;
	}
}
