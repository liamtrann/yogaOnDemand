import {Equipment} from "client";
import WorkoutMat from "../../assets/icons/yoga_mat.svg";
import Weights from "../../assets/icons/weights.svg";
import Bike from "../../assets/icons/bike.svg";
import ResistantBand from "../../assets/icons/resistance_band.svg";
import PilatesBall from "../../assets/icons/pilates_ball.svg";
import AerialYogaHammock from "../../assets/icons/hammock.svg";
import {ReactNode} from "react";

export default function parseEquipmentEnumsToIcon(equipment: Equipment): ReactNode {

	switch(equipment) {
		case Equipment.WORKOUTMAT:
			return WorkoutMat;
		case Equipment.LIGHTWEIGHTS:
			return Weights;
		case Equipment.MEDIUMWEIGHTS:
			return Weights;
		case Equipment.HEAVYWEIGHTS:
			return Weights;
		case Equipment.BIKE:
			return Bike;
		case Equipment.RESISTANTBAND:
			return ResistantBand;
		case Equipment.PILATESFITBALL:
			return PilatesBall;
		case Equipment.AERIALYOGAHAMMOCK:
			return AerialYogaHammock;
		default:
			return WorkoutMat;
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
