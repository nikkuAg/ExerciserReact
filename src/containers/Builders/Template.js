import React from 'react';
import { withRouter } from "../../withRouter";
import { connect } from "react-redux";
import "../../css/NewExerciseTemplate.css"
import { FormattedMessage } from 'react-intl';
import {
	MCQ_TEMPLATE_STRING,
	CLOZE_TEMPLATE_STRING,
	REORDER_TEMPLATE_STRING,
	GROUP_ASSIGNMENT_TEMPLATE_STRING,
	FREE_TEXT_INPUT_TEMPLATE_STRING,
	MATCHING_PAIR_STRING,
	CHOOSE,
	CLOZE_TEXT,
	MCQ,
	REORDER_LIST,
	GROUP_ASSIGNMENT,
	FREE_TEXT_INPUT,
	MATCHING_PAIR
} from "../translation";

const mcqSelected = (history) => {
	history.navigate('/new/mcq')
};


const clozeSelected = (history) => {
	history.navigate('/new/cloze')
};

const reorderSelected = (history) => {
	history.navigate('/new/reorder')
};

const groupAssignmentSelected = (history) => {
	history.navigate('/new/group');
};

const freeTextSelected = (history) => {
	history.navigate('/new/freeText');
}

const matchingPairSelected = (history) => {
	history.navigate('/new/match')
};

function Template(props) {
	let styles = { "backgroundColor": props.current_user.colorvalue ? props.current_user.colorvalue.stroke : "#FFFFFF" };
	let fullScreenStyles = {
		backgroundSize: "100%"
	}
	return (
		<div className="template-container" style={styles}>
			<div className="col-md-10 mx-auto">
				<div className="row justify-content-center align-self-center">
					<div className="col-sm-4">
						<div className="card grow" onClick={() => mcqSelected(props.router)}>
							<div className="card-img-container">
								<div className="card-img-top background-mcq" style={props.inFullscreenMode? fullScreenStyles : {}}/>
							</div>
							<div className="card-body">
								<h5 className="card-title"><FormattedMessage id={MCQ} /></h5>
								<p className="card-text">
									<FormattedMessage id={MCQ_TEMPLATE_STRING} />
								</p>
								<button className="button-choose" onClick={() => mcqSelected(props.router)}>
									<FormattedMessage id={CHOOSE} />
								</button>
							</div>
						</div>
					</div>
					<div className="col-sm-4">
						<div className="card grow" onClick={() => clozeSelected(props.router)}>
							<div className="card-img-container">
								<div className="card-img-top background-cloze" style={props.inFullscreenMode? fullScreenStyles : {}}/>
							</div>
							<div className="card-body">
								<h5 className="card-title"><FormattedMessage id={CLOZE_TEXT} /></h5>
								<p className="card-text">
									<FormattedMessage id={CLOZE_TEMPLATE_STRING} />
								</p>
								<button className="button-choose" onClick={() => clozeSelected(props.router)}>
									<FormattedMessage id={CHOOSE} />
								</button>
							</div>
						</div>
					</div>
					<div className="col-sm-4">
						<div className="card grow" onClick={() => reorderSelected(props.router)}>
							<div className="card-img-container">
								<div className="card-img-top background-reorder" style={props.inFullscreenMode? fullScreenStyles : {}}/>
							</div>
							<div className="card-body">
								<h5 className="card-title"><FormattedMessage id={REORDER_LIST} /></h5>
								<p className="card-text">
									<FormattedMessage id={REORDER_TEMPLATE_STRING} />
								</p>
								<button className="button-choose" onClick={() => reorderSelected(props.router)}>
									<FormattedMessage id={CHOOSE} />
								</button>
							</div>
						</div>
					</div>
					<div className="col-sm-4">
						<div className="card grow" onClick={() => groupAssignmentSelected(props.router)}>
							<div className="card-img-container">
								<div className="card-img-top background-group" style={props.inFullscreenMode? fullScreenStyles : {}}/>
							</div>
							<div className="card-body">
								<h5 className="card-title"><FormattedMessage id={GROUP_ASSIGNMENT} /></h5>
								<p className="card-text">
									<FormattedMessage id={GROUP_ASSIGNMENT_TEMPLATE_STRING} />
								</p>
								<button className="button-choose" onClick={() => groupAssignmentSelected(props.router)}>
									<FormattedMessage id={CHOOSE} />
								</button>
							</div>
						</div>
					</div>
					<div className="col-sm-4">
						<div className="card grow" onClick={() => freeTextSelected(props.router)}>
							<div className="card-img-container">
								<div className="card-img-top background-freetext" style={props.inFullscreenMode? fullScreenStyles : {}}/>
							</div>
							<div className="card-body">
								<h5 className="card-title"><FormattedMessage id={FREE_TEXT_INPUT} /></h5>
								<p className="card-text">
									<FormattedMessage id={FREE_TEXT_INPUT_TEMPLATE_STRING} />
								</p>
								<button className="button-choose" onClick={() => freeTextSelected(props.router)}>
									<FormattedMessage id={CHOOSE} />
								</button>
							</div>
						</div>
					</div>
					<div className="col-sm-4">
						<div className="card mb-3 grow" onClick={() => matchingPairSelected(props.router)}>
							<div className="card-img-container">
								<div className="card-img-top background-match" style={props.inFullscreenMode? fullScreenStyles : {}}/>
							</div>
							<div className="card-body">
								<h5 className="card-title"><FormattedMessage id={MATCHING_PAIR} /></h5>
								<p className="card-text">
									<FormattedMessage id={MATCHING_PAIR_STRING} />
								</p>
								<button className="button-choose" onClick={() => matchingPairSelected(props.router)}>
									<FormattedMessage id={CHOOSE} />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		current_user: state.current_user
	};
}


export default withRouter(connect(mapStateToProps)(Template));
