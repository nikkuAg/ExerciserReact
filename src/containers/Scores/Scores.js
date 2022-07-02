import React, { Component } from "react"
import { Bar } from 'react-chartjs-2';
import { withRouter } from "../../withRouter";
import { connect } from "react-redux";
import { injectIntl, FormattedMessage } from 'react-intl';
import {
	SCORES,
	QUESTION,
	CORRECT_WRONG,
	CORRECT_ANSWER,
	YOUR_ANSWER, TIME, YOUR_RESULTS,
	DETAILS
} from "../translation";
import "../../css/PresenceScores.css"
import "../../css/Scores.css"
import withScoreHOC from './ScoreHoc';

class Scores extends Component {

	constructor(props) {
		super(props);

		let { intl } = this.props;
		this.intl = intl;
		this.modes = {
			SCORE: 'score',
			TIME: 'time',
			DETAILS: 'details'
		};

		this.state = {
			mode: this.modes.SCORE,
			chartScores: {
				chartData: {},
				options: {
					title: {
						display: true,
						text: intl.formatMessage({ id: YOUR_RESULTS }),
						fontSize: 40
					},
					legend: {
						display: false,
						position: 'right'
					},
					scales: {
						yAxes: [{
							id: 'A',
							type: 'linear',
							position: 'left',
							ticks: {
								beginAtZero: true,
								min: 0,
								max: 100,
								callback: function(value, index, ticks) {
									return  value + ' %';
								    }
							}
						}],
						xAxes: [{
							barThickness: 30,
							ticks: {
								fontSize: 15
							}
						}]
					}
				}
			},
			chartTimes: {
				chartData: {},
				options: {
					title: {
						display: true,
						text: intl.formatMessage({ id: YOUR_RESULTS }),
						fontSize: 40
					},
					legend: {
						display: false,
						position: 'right'
					},
					scales: {
						yAxes: [{
							id: 'A',
							type: 'linear',
							position: 'left',
							ticks: {
								beginAtZero: true,
								min: 0,
								max: 0,
								gridLines: {
									drawTicks: false,
								},
								callback: function(value, index, ticks) {
									return  value + ' mn';
								    }
							}
						}],
						xAxes: [{
							barThickness: 30,
							ticks: {
								fontSize: 15
							}
						}]
					}
				}

			}
		}
	}

	componentDidMount() {
		if (this.props.router.location) {
			const { userScore, userTime, noOfQuestions, exercise, userAnswers } = this.props.router.location.state;
			let score = Math.ceil(userScore / noOfQuestions * 100);
			let time = Math.ceil(userTime / 60);
			if (this.props.isShared) {
				this.props.onSharedResult(exercise.id, score, time, userAnswers);
			}
			this.setChart();
		}
	}

	setChart = () => {
		const { userScore, userTime, noOfQuestions } = this.props.router.location.state;
		const { stroke, fill } = this.props.current_user.colorvalue ? this.props.current_user.colorvalue : { stroke: "#00FFFF", fill: "#800080" };

		let score = Math.ceil(userScore / noOfQuestions * 100);
		let time = Math.ceil(userTime / 60);
		let y_limit = Math.max(time, 10);
		const { name } = this.props.current_user;

		this.setState({
			...this.state,
			chartScores: {
				...this.state.chartScores,
				chartData: {
					labels: [name],
					datasets: [
						{
							label: this.intl.formatMessage({ id: SCORES }),
							yAxisID: 'A',
							data: [score],
							backgroundColor: fill,
							borderColor: stroke,
							borderWidth: 5
						}]
				}
			},
			chartTimes: {
				...this.state.chartTimes,
				chartData: {
					labels: [name],
					datasets: [
						{
							label: this.intl.formatMessage({ id: TIME }),
							yAxisID: 'A',
							data: [time],
							backgroundColor: fill,
							borderColor: stroke,
							borderWidth: 5
						}]
				},
				options: {
					scales: {
						yAxes: [{
							id: 'A',
							type: 'linear',
							position: 'left',
							ticks: {
								beginAtZero: true,
								min: 0,
								max: y_limit,
								gridLines: {
									drawTicks: false,
								},
								callback: function(value, index, ticks) {
									return value + ' mn';
								    }
							},
						}],
						xAxes: [{
							barThickness: 30,
							ticks: {
								fontSize: 15
							}
						}]
					}
				}
				
			}

		})

	};

	redo = () => {
		const { type, exercise } = this.props.router.location.state;
		if (type === 'MCQ') {
			this.props.router.navigate('/play/mcq', {state: { exercise: exercise}})
		}
		if (type === 'CLOZE') {
			this.props.router.navigate('/play/cloze', {state: { exercise: exercise}})
		}
		if (type === 'REORDER') {
			this.props.router.navigate('/play/reorder', {state: { exercise: exercise}})
		}
		if (type === 'GROUP_ASSIGNMENT') {
			this.props.router.navigate('/play/group', {state: { exercise: exercise}})
		}
		if (type === 'FREE_TEXT_INPUT') {
			this.props.router.navigate('/play/freeText', {state: { exercise: exercise}})
		}
		if (type === 'MATCHING_PAIR') {
			this.props.router.navigate('/play/match', {state: { exercise: exercise}})
		}
	};

	score = () => {
		this.setState({
			mode: this.modes.SCORE
		}, () => {
			this.setChart();
		})
	};

	time = () => {
		this.setState({
			mode: this.modes.TIME
		}, () => {
			this.setChart();
		})
	};

	detail = () => {
		this.setState({
			mode: this.modes.DETAILS
		}, () => {
			this.setChart();
		})
	}

	onGraphClicked = (event) => {
		if (event.length !== 0) {
			this.setState({
				mode: this.modes.DETAILS
			})
		}
	};

	render() {
		const { getResultsTableElement, getWrongRightMarker } = this.props;
		let score_active = "";
		let time_active = "";
		let detail_active = "";
		let chart = "";

		if (this.state.mode === this.modes.SCORE) {
			score_active = "active";
			chart = (<Bar data={this.state.chartScores.chartData} getElementAtEvent={this.onGraphClicked} options={this.state.chartScores.options} />);
		}
		else if (this.state.mode === this.modes.TIME) {
			time_active = "active";
			chart = (<Bar data={this.state.chartTimes.chartData} options={this.state.chartTimes.options} />);
		}
		else if (this.state.mode === this.modes.DETAILS) {
			detail_active = "active"
			const { userAnswers } = this.props.router.location.state;
			let resultDetails = userAnswers.map((answer, index) => {
				return (
					<tr key={index}>
						<td>
							{getResultsTableElement(answer.question)}
						</td>
						<td>
							{getResultsTableElement(answer.correctAns)}
						</td>
						<td>
							{getResultsTableElement(answer.userAns)}
						</td>
						<td>
							{getWrongRightMarker(answer)}
						</td>
					</tr>
				);
			});

			chart = (
				<div>
					<br></br>
					<br></br>
					<table className="w-100">
						<thead>
							<tr>
								<th><FormattedMessage id={QUESTION} /></th>
								<th><FormattedMessage id={CORRECT_ANSWER} /></th>
								<th><FormattedMessage id={YOUR_ANSWER} /></th>
								<th><FormattedMessage id={CORRECT_WRONG} /></th>
							</tr>
						</thead>
						<tbody>
							{resultDetails}
						</tbody>
					</table>
				</div>
			);

		}


		let score = (<FormattedMessage id={SCORES} defaultMessage={SCORES}>
			{(msg) => (<button type="button" title={msg} className={"score-button " + score_active} onClick={this.score} />)}
		</FormattedMessage>);
		let time = (<FormattedMessage id={TIME} defaultMessage={TIME}>
			{(msg) => (<button type="button" title={msg} className={"time-button " + time_active} onClick={this.time} />)}
		</FormattedMessage>);
		let detail = (<FormattedMessage id={DETAILS} defaultMessage={DETAILS}>
			{(msg) => (<button type="button" title={msg} className={"detail-button " + detail_active} onClick={this.detail} />)}
		</FormattedMessage>);




		return (
			<div className="container">
				<div className="container-fluid">
					<div className="row">
						{score}
						{time}
						{detail}
						{chart}
					</div>
					<div className="row button-container">
						<button className="button-redo" onClick={this.redo} />
					</div>
				</div>
			</div>
		)
	}

}

function MapStateToProps(state) {
	return {
		current_user: state.current_user,
		isShared: state.isShared
	}
}

export default withScoreHOC()(injectIntl(withRouter(
	connect(MapStateToProps, {})(Scores))));