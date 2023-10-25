import React, {ReactNode} from "react";
import {Button} from "reactstrap";
import {FiX} from "react-icons/all";

export interface IPillOption {
	value: string;
	label: string;
	icon?: string;
	[key: string]: any;
}

interface IProps {
	list: Array<IPillOption>
	onClick(option: IPillOption): void;
}

const SelectedPills: React.FC<IProps> = (props) => {

	function makePill(_pill: IPillOption, i: number): ReactNode {

		function clickHelper() {
			props.onClick(_pill);
		}

		return (
			<Button
				color="info"
				className="mr-2 mb-3 d-flex align-items-center"
				key={`pill-button-${_pill.label}-${i}`}
				onClick={clickHelper}
			>
				{_pill.icon && (
					<img
						src={_pill.icon}
						style={{
							width: 30,
							height: 30,
						}}
						className="mr-2"
					/>
				)}
				{_pill.label}
				<FiX
					size="1.25rem"
					style={{maxHeight: 30}}
					className="ml-2"
				/>
			</Button>
		);
	}

	return (
		<div className="d-flex flex-wrap">
			{props.list.map(makePill)}
		</div>
	);
};

export default SelectedPills;
