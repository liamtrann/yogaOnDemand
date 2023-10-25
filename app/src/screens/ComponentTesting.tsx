import React, {useState} from "react";
import {ScrollView, StatusBar} from "react-native";
import SafeAreaView from 'react-native-safe-area-view';
import YogaButton from "../components/YogaButton";
import YogaArrowButton from "../components/inputs/YogaArrowButton";
import YogaLabel from "../components/inputs/YogaLabel";
import YogaTextInput from "../components/inputs/YogaTextInput";
import YogaDropdown from "../components/inputs/YogaDropdown";
import YogaMultiSelect from "../components/inputs/YogaMultiSelect";
import YogaPill from "../components/YogaPill";
import YogaRadio from "../components/inputs/YogaRadio";
import YogaCheckbox from "../components/inputs/YogaCheckbox";
import ProgressBar from "../components/YogaProgressBar";
import YogaPopup from "../components/YogaPopup";
import VideoThumbnail from "../components/VideoThumbnail";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const ComponentTesting: React.FC = () => {

	const [value, setValues] = useState([]);
	const [check, setCheck] = useState(false);
	const [open, setOpen] = useState(false);

	return (
		<SafeAreaView>
			<KeyboardAwareScrollView
				keyboardShouldPersistTaps="handled"
				style={{height: "100%", paddingHorizontal: 50}}
			>
				<StatusBar barStyle="dark-content"/>
				<YogaButton text="Yoga Bar On Demand" theme="primary" style={{marginBottom: 10}}/>
				<YogaButton text="Yoga Bar On Demand" theme="primary-border" style={{marginBottom: 10}}/>
				<YogaButton text="Yoga Bar On Demand" theme="secondary" style={{marginBottom: 10}}/>
				<YogaButton text="Yoga Bar On Demand" theme="secondary-border" style={{marginBottom: 10}}/>
				<YogaButton text="Yoga Bar On Demand" theme="dark-background" style={{marginBottom: 10}}/>
				<YogaButton text="Yoga Bar On Demand" theme="dark-background-border" style={{marginBottom: 10}}/>
				<YogaButton text="Yoga Bar On Demand" bubble="!" theme="primary" style={{marginBottom: 10}}/>
				<YogaArrowButton/>
				<YogaArrowButton direction="left"/>
				<YogaArrowButton direction="right"/>
				<YogaArrowButton direction="down"/>
				<YogaLabel>Label</YogaLabel>
				<YogaTextInput placeholder="Placeholder"/>
				<YogaLabel>Label</YogaLabel>
				<YogaDropdown placeholder="Placeholder" items={[{value: 0, display: "hello"}, {value: 1, display: "hello"}, {value: 2, display: "hello"}]}/>
				<YogaLabel>Label</YogaLabel>
				<YogaMultiSelect placeholder="Placeholder" value={value} onChange={setValues} items={[{value: 0, display: "hello"}, {value: 1, display: "hello23213123123123"}, {value: 2, display: "hello"}]}/>
				<YogaPill text="Yoga Bar On Demand" onClose={() => {}}/>
				<YogaRadio text="Yoga Bar On Demand" value={check} onChange={setCheck}/>
				<YogaCheckbox text="Yoga Bar On Demand" value={check} onChange={setCheck}/>
				<ProgressBar leftLabel="0 xp" rightLabel="500 xp" progress={0.9}/>
				<YogaButton onPress={() => setOpen(!open)} text="Open Modal"/>
				<YogaPopup visible={open} easyBody="This is a test." easyTitle="Test!" onXPress={() => setOpen(false)} easyButton={() => setOpen(false)}/>
				<VideoThumbnail hearted={true} thumbnailURL="https://www.spiritualpeople.com/wp-content/uploads/2018/05/Spiritual-People-Yoga-Poses-for-the-week-copy.jpg" title="Yin & Yang" subtitle="75 minute class · Jenny Doe"/>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	);
};

export default ComponentTesting;
