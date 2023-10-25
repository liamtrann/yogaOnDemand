import React, {ReactNode, useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {Button, Card, Container, Input, Label} from "reactstrap";
import {addError, decrementLoading, incrementLoading, setLoadingText} from "../redux/meta/MetaActions";
import {
    Asset,
    Category,
    CategoryApi,
    Class,
    ClassApi,
    CreateVideoBody, CreateVideoSourceResponse,
    Equipment, GetUploadVideoSourceURLResponse,
    Instructor,
    InstructorApi, Video,
    VideoApi, VideoInterval, VideoSourceApi
} from "client";
import getConfig from "../utils/getConfig";
import Select from "react-select";
import {cloneDeep, findIndex, indexOf} from "lodash";
import NumberFormat from "react-number-format";
import SelectedPills, {IPillOption} from "../components/Selectedpills";
import ClassIntervalInput, {IClassInterval, initialClassInterval} from "../components/ClassIntervalInput";
import AssetManager from "../components/assetManager/AssetManager";
import uploadToSignedURL from "../utils/uploadToSignedURL";
import {useHistory} from "react-router-dom";
import {useQuery} from "../utils/useQuery";
import parseEquipmentEnumsToIcon, {parseEquipmentEnumToDisplayString} from "../utils/parseEquipmentEnums";
import {isNil} from "lodash";

interface IProps {
    token?: string;
    dispatch?: any;
}

const CreateVideoPage: React.FC<IProps> = (props: IProps) => {

    const history = useHistory();
    const query = useQuery();
    const existingVideo: boolean = !!query.get("video");

    const [classes, setClasses] = useState<Array<Class>>([]);
    const [categories, setCategories] = useState<Array<Category>>([]);
    const [instructors, setInstructors] = useState<Array<Instructor>>([]);
    const [showAssetManager, setShowAssetManager] = useState(false);

    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState<Asset>(null);
    const [assignedClass, setAssignedClass] = useState<Class>(null);
    const [videoNumber, setVideoNumber] = useState({value: null});
    const [selectedCategories, setSelectedCategories] = useState<Array<{ value: string, label: string }>>([]);
    const [videoTitle, setVideoTitle] = useState("");
    const [videoDescription, setVideoDescription] = useState("");
    const [instructor, setInstructor] = useState<Instructor>(null);
    const [videoExperience, setVideoExperience] = useState({value: null});
    const [requiredLevel, setRequiredLevel] = useState({value: null});
    const [requiredEquipment, setRequiredEquipment] = useState<Array<Equipment>>([]);
    const [topPick, setTopPick] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [classIntervals, setClassIntervals] = useState([initialClassInterval]);
    const [intervalKey, setIntervalKey] = useState(1);

    const [assignClassInputValue, setAssignClassInputValue] = useState("");
    const [instructorInputValue, setInstructorInputValue] = useState("");

    const [currentVideoURL, setCurrentVideoURL] = useState(null);
    const [fullExistingVideoApiRes, setFullExistingVideoApiRes] = useState<Video>(null);

    useEffect(() => {
        getPreData().then().catch();
    }, []);

    async function getPreData(): Promise<void> {
        props.dispatch(incrementLoading());

        try {
            const _classes = await new ClassApi(getConfig(props.token)).getClasses({limit: 0, offset: 0});
            const _categories = await new CategoryApi(getConfig(props.token)).getCategories({limit: 0, offset: 0});
            const _instructors = await new InstructorApi(getConfig(props.token)).getInstructors({limit: 0, offset: 0});

            setClasses(_classes.classes);
            setCategories(_categories.categories);
            setInstructors(_instructors.instructors);

            props.dispatch(decrementLoading());
            if (query.get("video")) {
                await getExistingVideo();
            }

        } catch (e) {
            props.dispatch(decrementLoading());
            props.dispatch(addError(e));
        }

    }

    async function getExistingVideo(): Promise<void> {
        props.dispatch(incrementLoading());

        try {
            const res = await new VideoApi(getConfig(props.token)).getVideo({videoID: query.get("video")});

            const videoRes = await new VideoSourceApi(getConfig(props.token)).getVideoSourceURL({
                getVideoSourceURLRequestBody: {
                    videoSourceId: res.videoSource,
                },
            });

            setCurrentVideoURL(videoRes.url);

            setThumbnail(res.image);
            setAssignedClass(res._class as unknown as Class);
            setAssignClassInputValue((res._class as unknown as Class).name);
            setVideoNumber({value: res.classNumber});
            setSelectedCategories((res.categories as unknown as Array<Category>).map((_category: Category) => {
                return {value: _category._id, label: _category.name};
            }));
            setVideoTitle(res.name);
            setVideoDescription(res.description);
            setInstructor(res.instructor as unknown as Instructor);
            setInstructorInputValue((res.instructor as unknown as Instructor).name)
            setVideoExperience({value: res.experience});
            setRequiredLevel({value: res.level});
            setRequiredEquipment(res.equipment);
            setTopPick(res.isTopPick);
            setHidden(isNil(res.hidden) ? false : res.hidden);
            setClassIntervals(res.intervals.map((_interval: VideoInterval) => {
                return {
                    icon: _interval.icon,
                    description: _interval.name,
                    intervalDuration: _interval.duration,
                };
            }));

            setFullExistingVideoApiRes(res);

        } catch (e) {
            props.dispatch(addError(e));
        }

        props.dispatch(decrementLoading());
    }

    function toggleAssetManager(): void {
        setShowAssetManager(!showAssetManager);
    }

    function onVideoChange(e): void {
        setVideo(e.target.files[0]);
    }

    function onThumbnailChange(a: Asset): void {
        setThumbnail(a);
        setShowAssetManager(false);
    }

    function onAssignClassInputChange(e): void {
        setAssignClassInputValue(e);
    }

    function onSelectClass(_class: Class): void {
        if (_class) {
            const index: number = findIndex(classes, (c) => c._id === _class._id);
            setAssignedClass(index > -1 ? classes[index] : null);
        } else {
            setAssignedClass(null);
        }
    }

    function onVideoNumberChange(e): void {
        setVideoNumber({value: e.floatValue});
    }

    function onSelectCategory(e: { value: string, label: string }): void {
        const newSelectedCategories = cloneDeep(selectedCategories);
        newSelectedCategories.push(e);
        setSelectedCategories(newSelectedCategories);
    }

    function onRemoveCategory(_category: IPillOption): void {
        const newSelectedCategories = cloneDeep(selectedCategories);
        const index: number = findIndex(selectedCategories, _category);
        newSelectedCategories.splice(index, 1);
        setSelectedCategories(newSelectedCategories);
    }

    function onVideTitleChange(e): void {
        setVideoTitle(e.target.value);
    }

    function onVideoDescriptionChange(e): void {
        setVideoDescription(e.target.value);
    }

    function onInstructorInputChange(e): void {
        setInstructorInputValue(e);
    }

    function onSelectInstructor(_instructor: Instructor): void {
        if (_instructor) {
            const index: number = findIndex(instructors, (ins) => ins._id === _instructor._id);
            setInstructor(index > -1 ? instructors[index] : null);
        } else {
            setInstructor(null);
        }
    }

    function onVideoExperienceChange(e): void {
        setVideoExperience({value: e.floatValue});
    }

    function onVideoLevelChange(e): void {
        setRequiredLevel({value: e.floatValue});
    }

    function onSelectEquipment(e: { value: Equipment, label: string }): void {
        const newRequiredEquipment = cloneDeep(requiredEquipment);
        newRequiredEquipment.push(e.value);
        setRequiredEquipment(newRequiredEquipment);
    }

    function onRemoveEquipment(_equipment: IPillOption): void {
        const newRequiredEquipment = cloneDeep(requiredEquipment);
        const index: number = indexOf(requiredEquipment, _equipment.value);
        newRequiredEquipment.splice(index, 1);
        setRequiredEquipment(newRequiredEquipment);
    }

    function toggleTopPick(): void {
        setTopPick(!topPick);
    }

    function toggleHidden(): void {
        setHidden(!hidden);
    }

    function makeClassIntervals(_classIntervals: Array<IClassInterval> = []): ReactNode {
        return _classIntervals.map((_classInterval: IClassInterval, i: number) => {

            function onChangeHelper(key: string, value: any): void {
                const baseIntervals = cloneDeep(classIntervals);
                baseIntervals[i][key] = value;
                setClassIntervals(baseIntervals);
            }

            function onRemove(): void {
                const baseIntervals = cloneDeep(classIntervals);
                baseIntervals.splice(i, 1);
                setClassIntervals(baseIntervals);
                setIntervalKey(intervalKey + 1);
            }

            function moveUp(): void {
                if (i === 0) {
                    return
                }
                const baseIntervals = cloneDeep(classIntervals);
                const toMove = baseIntervals[i];
                baseIntervals[i] = baseIntervals[i - 1];
                baseIntervals[i - 1] = toMove;
                setClassIntervals(baseIntervals);
                setIntervalKey(intervalKey + 1);
            }

            function moveDown(): void {
                if (i >= classIntervals.length - 1) {
                    return
                }
                const baseIntervals = cloneDeep(classIntervals);
                const toMove = baseIntervals[i];
                baseIntervals[i] = baseIntervals[i + 1];
                baseIntervals[i + 1] = toMove;
                setClassIntervals(baseIntervals);
                setIntervalKey(intervalKey + 1);
            }

            return (
                <div className="mb-3">
                    <ClassIntervalInput
                        icon={_classInterval.icon}
                        description={_classInterval.description}
                        intervalDuration={_classInterval.intervalDuration}
                        onChange={onChangeHelper}
                        onRemove={onRemove}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                    />
                </div>
            );
        });
    }

    function addClassInterval(): void {
        const baseIntervals = cloneDeep(classIntervals);
        baseIntervals.push(initialClassInterval);
        setClassIntervals(baseIntervals);
    }

    async function submitVideo(): Promise<void> {
        props.dispatch(incrementLoading());

        try {
            let getVideoURLRes: GetUploadVideoSourceURLResponse;
            let createVideoSourceRes: CreateVideoSourceResponse;
            if (video) {
                getVideoURLRes = await new VideoSourceApi(getConfig(props.token)).getUploadVideoSourceURL({
                    getUploadVideoSourceURLBody: {
                        contentType: "video/mp4",
                    },
                });

                const error = await uploadToSignedURL(getVideoURLRes.url, video, (v) => {
                    props.dispatch(setLoadingText("Uploading " + v.toFixed(2) + "%"))
                });

                props.dispatch(setLoadingText("Finalizing Results"));

                if (error) {
                    props.dispatch(addError(error));
                    props.dispatch(decrementLoading());
                    return;
                }

                createVideoSourceRes = await new VideoSourceApi(getConfig(props.token)).createVideoSource({
                    createVideoSourceBody: {
                        fileName: getVideoURLRes.fileName,
                    },
                });
            }

            const req: CreateVideoBody = {
                classID: assignedClass ? assignedClass._id : undefined,
                classNumber: videoNumber.value ? videoNumber.value : undefined,
                name: videoTitle ? videoTitle : undefined,
                description: videoDescription ? videoDescription : undefined,
                instructorID: instructor ? instructor._id : undefined,
                videoSourceID: createVideoSourceRes?.videoSourceId,
                level: requiredLevel.value ? requiredLevel.value : undefined,
                experience: videoExperience.value ? videoExperience.value : undefined,
                categoryIDs: selectedCategories.map((_category) => {
                    return _category.value;
                }),
                equipment: requiredEquipment,
                intervals: classIntervals.map((_interval) => {
                    return {
                        icon: _interval.icon,
                        name: _interval.description,
                        duration: _interval.intervalDuration,
                    };
                }),
                imageID: thumbnail ? thumbnail._id : undefined,
                isTopPick: topPick,
                hidden,
            };

            if (existingVideo) {
                await new VideoApi(getConfig(props.token)).editVideo({
                    editVideoBody: {
                        videoID: fullExistingVideoApiRes._id,
                        ...req,
                        videoSourceID: createVideoSourceRes ? createVideoSourceRes.videoSourceId : (fullExistingVideoApiRes.videoSource as any)._id,
                    },
                });
            } else {
                await new VideoApi(getConfig(props.token)).createVideo({
                    createVideoBody: req,
                });
            }

            history.push("/videos");
            props.dispatch(decrementLoading());

        } catch (e) {
            props.dispatch(decrementLoading());
            props.dispatch(addError(e));
        }

    }

    return (
        <React.Fragment>
            <AssetManager
                isOpen={showAssetManager}
                allowSelect={true}
                onClose={toggleAssetManager}
                onSelect={onThumbnailChange}
            />

            <Container className="my-5">
                <h3>{existingVideo ? "Edit Video" : "Create New Video"}</h3>
                <hr/>
                <div style={{maxWidth: 400}}>

                    <div className="mb-3">
                        <Label>Video Upload</Label>

                        {currentVideoURL && (
                            <div>
                                <div>
                                    <b>Current Video:</b>
                                    <video
                                        src={currentVideoURL}
                                        style={{maxWidth: "100%"}}
                                        controls={true}
                                    />
                                </div>

                                <div className="mt-2">
                                    <b>To change video file, choose a new one below:</b>
                                </div>
                            </div>
                        )}

                        <Input
                            type="file"
                            onChange={onVideoChange}
                        />
                    </div>

                    <div className="mb-3">
                        <Label>Set a Thumbnail</Label>
                        {thumbnail && (
                            <div style={{width: 300}}>
                                <div className="image-thumbnail-container my-2">
                                    <img
                                        src={thumbnail.url}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="d-flex align-items-center mb-3">
                            <Button color="blue" size="sm" onClick={toggleAssetManager} className="mr-3">Choose
                                File</Button>
                            {thumbnail && (
                                <span>
									{thumbnail.name}
								</span>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <Label>Assign to a Class</Label>
                        <div className="react-select-parent">
                            <Select
                                inputValue={assignClassInputValue}
                                onInputChange={onAssignClassInputChange}
                                closeMenuOnSelect={true}
                                options={classes.map((_class: Class) => {
                                    return {
                                        value: _class._id,
                                        label: _class.name,
                                        ..._class,
                                    }
                                })}
                                isClearable={true}
                                onChange={onSelectClass}
                                placeholder="Choose Class..."
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <Label>Class Number</Label>
                        <NumberFormat
                            placeholder="Set Class Number..."
                            customInput={Input}
                            value={videoNumber.value}
                            thousandSeparator={true}
                            decimalScale={0}
                            onValueChange={onVideoNumberChange}
                            maxLength={3}
                        />
                    </div>

                    <div className="mb-3">
                        <Label>Assign Additional Categories</Label>
                        <div className="react-select-parent">
                            <Select
                                value={""}
                                closeMenuOnSelect={true}
                                options={categories.map((_category: Category) => {
                                    return {
                                        value: _category._id,
                                        label: _category.name,
                                    }
                                }).filter((_category) => {
                                    return findIndex(selectedCategories, _category) < 0;
                                })}
                                onChange={onSelectCategory}
                            />
                        </div>
                        {selectedCategories?.length > 0 && (
                            <div className="mt-3">
                                <SelectedPills
                                    list={selectedCategories}
                                    onClick={onRemoveCategory}
                                />
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <Label>Video Title</Label>
                        <Input
                            placeholder="Set Video Title..."
                            value={videoTitle}
                            onChange={onVideTitleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <Label>Video Description</Label>
                        <Input
                            type="textarea"
                            placeholder="Description..."
                            value={videoDescription}
                            onChange={onVideoDescriptionChange}
                        />
                    </div>

                    <div className="mb-3">
                        <Label>Assign an Instructor</Label>
                        <div className="react-select-parent">
                            <Select
                                inputValue={instructorInputValue}
                                onInputChange={onInstructorInputChange}
                                closeMenuOnSelect={true}
                                options={instructors.map((_instructor: Instructor) => {
                                    return {
                                        value: _instructor._id,
                                        label: _instructor.name,
                                        ..._instructor,
                                    }
                                })}
                                isClearable={true}
                                onChange={onSelectInstructor}
                                placeholder="Choose an Instructor..."
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <Label>Video Experience</Label>
                        <NumberFormat
                            placeholder="Set Video Experience..."
                            customInput={Input}
                            value={videoExperience.value}
                            thousandSeparator={true}
                            decimalScale={0}
                            onValueChange={onVideoExperienceChange}
                            maxLength={10}
                        />
                    </div>

                    <div className="mb-3">
                        <Label>Level Required for Viewing</Label>
                        <NumberFormat
                            placeholder="Set Required Level..."
                            customInput={Input}
                            value={requiredLevel.value}
                            thousandSeparator={true}
                            decimalScale={0}
                            onValueChange={onVideoLevelChange}
                            maxLength={5}
                        />
                    </div>

                    <div className="mb-3">
                        <Label>Assign Required Equipment</Label>
                        <div className="react-select-parent">
                            <Select
                                value={""}
                                closeMenuOnSelect={true}
                                options={Object.keys(Equipment).map((_equipment: Equipment) => {
                                    return {
                                        value: Equipment[_equipment],
                                        // label: Equipment[_equipment],
                                        label: parseEquipmentEnumToDisplayString(Equipment[_equipment]),
                                    }
                                }).filter((_equipment) => {
                                    return indexOf(requiredEquipment, _equipment.value) < 0;
                                })}
                                onChange={onSelectEquipment}
                            />
                        </div>
                        {requiredEquipment?.length > 0 && (
                            <div className="mt-3">
                                <SelectedPills
                                    list={requiredEquipment.map((_equipment) => {
                                        return {
                                            value: _equipment.toString(),
                                            label: parseEquipmentEnumToDisplayString(_equipment),
                                            icon: parseEquipmentEnumsToIcon(_equipment),
                                        }
                                    })}
                                    onClick={onRemoveEquipment}
                                />
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <Label>Top Pick</Label>
                        <p className="mb-0">
                            <input
                                type="checkbox"
                                name="setNewVideoAsTopPick"
                                id="setNewVideoAsTopPick"
                                checked={topPick}
                                onChange={toggleTopPick}
                            />
                            <label htmlFor="setNewVideoAsTopPick">This video is a top pick.</label>
                        </p>
                    </div>

                    <div className="mb-3">
                        <Label>Hidden</Label>
                        <p className="mb-0">
                            <input
                                type="checkbox"
                                name="setNewVideoAsHidden"
                                id="setNewVideoAsHidden"
                                checked={hidden}
                                onChange={toggleHidden}
                            />
                            <label htmlFor="setNewVideoAsHidden">This video is hidden.</label>
                        </p>
                    </div>
                </div>

                <div style={{overflowX: "scroll"}} className="mb-3">
                    <Label>Create Class Intervals</Label>
                    <div className="mb-3" style={{width: 800}} key={intervalKey}>
                        {makeClassIntervals(classIntervals)}

                        <div className="d-flex justify-content-end mt-3">
                            <Button color="blue" size="sm" onClick={addClassInterval}>Add Interval</Button>
                        </div>
                    </div>
                </div>

                <hr/>

                <div style={{maxWidth: 400}}>
                    <div className="d-flex justify-content-end">
                        <Button color="blue"
                                onClick={submitVideo}>{existingVideo ? "Update Video" : "Create Video"}</Button>
                    </div>
                </div>

                <div style={{height: 300}}/>
            </Container>
        </React.Fragment>
    );
};

export default connect((store: IStore, props: IProps) => {
    return {
        token: store.metaStore.token,
        ...props,
    }
})(CreateVideoPage)
