import React, {ReactNode} from "react";
import {FiX} from "react-icons/all";

interface IProps {
	children?: ReactNode | string;
	onClose?(): void;
}

const YogaModalHeader: React.FC<IProps> = (props: IProps) => {

	function onCloseHelper(e): void {
		if (e) {
			e.preventDefault();
		}

		props.onClose();
	}

	return (
		<div className="pt-3 px-3">
			<div className="d-flex flex-row">
				<div className="w-100">
					{typeof props.children === "string" ? (
						<h4 className="font-weight-bold text-blue">{props.children}</h4>
					) : (
						<React.Fragment>
							{props.children}
						</React.Fragment>
					)}
				</div>
				<a href="#" onClick={onCloseHelper} className="ml-3">
					<FiX style={{fontSize: "1.5rem", maxHeight: 40}}/>
				</a>
			</div>

			<hr className="mt-1 mb-0"/>
		</div>
	);
};

export default YogaModalHeader;
