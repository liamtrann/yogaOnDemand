import React from "react";
import {Card, CardBody, Col, Input, Label, Row} from "reactstrap";
import {FiArrowDownCircle, FiArrowUpCircle, FiX} from "react-icons/all";
import NumberFormat from "react-number-format";
import {VideoIntervalIcon} from "client";
import parseIntervalEnumsToIcon, {parseIntervalEnumToDisplayString} from "../utils/parseIntervalEnums";

export interface IClassInterval {
	icon: any;
	description: string;
	intervalDuration: any;
}

export const initialClassInterval: IClassInterval = {
	icon: undefined,
	description: "",
	intervalDuration: "",
}

interface IProps {
	icon?: any;
	description?: string;
	intervalDuration?: number;
	onChange(key: string, value: any): void;
	onRemove(): void;
	onMoveUp(): void;
	onMoveDown(): void;
}

const ClassIntervalInput: React.FC<IProps> = (props) => {

	function onRemoveHelper(e): void {
		if (e) {
			e.preventDefault();
		}

		props.onRemove();
	}

	function moveUpHelper(e): void {
		if (e) {
			e.preventDefault();
		}

		props.onMoveUp();
	}

	function moveDownHelper(e): void {
		if (e) {
			e.preventDefault();
		}
		props.onMoveDown();
	}

	function onIconChange(e): void {
		props.onChange("icon", e.target.value);
	}

	function onDescriptionChange(e): void {
		props.onChange("description", e.target.value);
	}

	function onDurationChange(e): void {
		props.onChange("intervalDuration", e.floatValue);
	}

	return (
		<Card>
			<div className="d-flex justify-content-end pt-1 px-3">
				<a href="#" onClick={onRemoveHelper}>
					<FiX style={{fontSize: "1.25rem", maxHeight: 20}}/>
				</a>
			</div>
			<CardBody className="pt-1 pb-3 px-3">

				<div className="d-flex">
					<Row style={{width: "95%"}} className="no-gutters">
						<Col xs={4}>
							<Label>Icon</Label>
							<div className="d-flex align-items-center">
								<Input
									type="select"
									value={props.icon}
									onChange={onIconChange}
									className="mr-3"
								>
									<option value="" disabled selected>Select Icon</option>
									{Object.keys(VideoIntervalIcon).map((_icon: VideoIntervalIcon) => {
										return <option value={VideoIntervalIcon[_icon]}>{parseIntervalEnumToDisplayString(VideoIntervalIcon[_icon])}</option>
									})}
								</Input>

								<div style={{width: 60}}>
									{props.icon && (
										<img
											src={parseIntervalEnumsToIcon(props.icon)}
											style={{
												width: 40,
												height: 40,
											}}
										/>
									)}
								</div>
							</div>
						</Col>
						<Col xs={6} className="px-3">
							<Label>Description</Label>
							<Input
								placeholder="Enter Interval Description..."
								value={props.description}
								onChange={onDescriptionChange}
							/>
						</Col>
						<Col xs={2}>
							<Label>Interval Duration</Label>
							<NumberFormat
								placeholder="Duration..."
								customInput={Input}
								value={props.intervalDuration}
								decimalScale={0}
								onValueChange={onDurationChange}
								maxLength={4}
							/>
						</Col>
					</Row>

					<div style={{width: "5%"}} className="d-flex justify-content-end">
						<div className="d-flex flex-column justify-content-end">
							<a href="#" onClick={moveUpHelper}>
								<FiArrowUpCircle style={{fontSize: "1.25rem", maxHeight: 20}}/>
							</a>

							<a href="#" onClick={moveDownHelper}>
								<FiArrowDownCircle style={{fontSize: "1.25rem", maxHeight: 20}}/>
							</a>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default ClassIntervalInput;
