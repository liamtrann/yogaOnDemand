import React, {ReactNode} from "react";

export interface ISelectOption {
	value: any;
	label: string;
}

interface IProps {
	strings?: string[];
	options?: Array<ISelectOption>;
}

const SelectOptionsFactory: React.FC<IProps> = (props: IProps) => {

	const {strings, options} = props;

	function makeSelectOptions(_options: Array<ISelectOption>): ReactNode {
		return _options.map((_option: ISelectOption, i: number) => {
			return (<option value={_option.value} key={`select-option-${i}`}>{_option.label}</option>)
		});
	}

	if (strings) {
		return <>{makeSelectOptions(strings.map((s: string): ISelectOption => {return {value: s, label: s}}))}</>
	} else if (options) {
		return <>{makeSelectOptions(options)}</>
	} else {
		return null;
	}
};

export default SelectOptionsFactory;
