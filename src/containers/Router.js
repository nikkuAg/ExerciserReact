import React from "react";
import { Routes, Route } from "react-router-dom";
import useDimensions from "react-use-dimensions";
import {withRouter} from "../withRouter"
import ExerciseList from "./ExerciseList";
import Scores from "./Scores/Scores"

import MCQForm from "./Builders/MCQForm";
import CLOZEForm from "./Builders/CLOZEForm";
import REORDERForm from "./Builders/REORDERForm";
import GroupAssignmentForm from "./Builders/GroupAssignmentForm";
import FreeTextInputForm from "./Builders/FreeTextInputForm";
import MATCHINGPAIRForm from "./Builders/MatchingForm";

import MCQPlay from "./Players/MCQPlayer";
import CLOZEPlay from "./Players/CLOZEPlayer";
import REORDERPlay from "./Players/REORDERPlayer";
import GroupAssignmentPlayer from "./Players/GroupAssignmentPlayer";
import FreeTextInputPlayer from "./Players/FreeTextInputPlayer";
import MATCHINGPAIRPlayer from "./Players/MatchingPlayer";

import { injectIntl } from 'react-intl';
import '../css/index.css';

import NewExerciseTemplate from "./Builders/Template";
import PresenceScores from "./Scores/PresenceScores";

const Main = (props) => {
	const [ref, containerSize] = useDimensions();

	let zoom = '100%';
	if (props.inFullscreenMode){
		let boardSize = containerSize.height + (props.inFullscreenMode?55:0);
		const paddingPercent = 3;
		zoom = `${((boardSize/containerSize.height) + paddingPercent/100) * 100}%`;
	}
	const { onUpdate, onSharedResult, inEditMode, inFullscreenMode } = props;
	return (
		<div className="main-container" ref={ref} style={{zoom: zoom, padding: (props.inFullscreenMode && "0px")}}>
			<Routes>
				<Route exact path="/" element={ <ExerciseList onUpdate={onUpdate} inEditMode={inEditMode} inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/new" element={<NewExerciseTemplate inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/scores" element={<Scores onSharedResult={onSharedResult} inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* MCQ */}
				<Route exact path="/new/mcq" element={<MCQForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/mcq" element={<MCQForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/mcq" element={<MCQPlay inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* CLOZE */}
				<Route exact path="/new/cloze" element={<CLOZEForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/cloze" element={<CLOZEForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/cloze" element={<CLOZEPlay inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* REORDER */}
				<Route exact path="/new/reorder" element={<REORDERForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/reorder" element={<REORDERForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/reorder" element={<REORDERPlay inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* // GROUP ASSIGNMENT */}
				<Route exact path="/new/group" element={<GroupAssignmentForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/group" element={<GroupAssignmentForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/group" element={<GroupAssignmentPlayer inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* // FREE TEXT INPUT */}
				<Route exact path="/new/freeText" element={<FreeTextInputForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/freeText" element={<FreeTextInputForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/freeText" element={<FreeTextInputPlayer inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* MATCHING_PAIR */}
				<Route exact path="/new/match" element={<MATCHINGPAIRForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/match" element={<MATCHINGPAIRForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/match" element={<MATCHINGPAIRPlayer inFullscreenMode={inFullscreenMode} {...props} />} />

				<Route exact path="/presence/scores" element={<PresenceScores inFullscreenMode={inFullscreenMode} {...props} />} />

			</Routes>
		</div>
	)
};



export default injectIntl(withRouter(Main));