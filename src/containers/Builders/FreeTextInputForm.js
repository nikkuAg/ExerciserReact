import React, { Component } from "react";
import { connect } from "react-redux";
import { incrementExerciseCounter } from "../../store/actions/increment_counter";
import { addNewExercise, editExercise } from "../../store/actions/exercises";
import { FormattedMessage } from 'react-intl';
import {
	QUESTION,
	FINISH_EXERCISE,
	TITLE_OF_EXERCISE,
	NEXT_QUESTION,
	PREVIOUS_QUESTION,
	TEST_EXERCISE,
	TITLE_ERROR,
	QUESTION_ERROR,
	ANSWER_ERROR,
	ENTER_ANSWER,
	FREE_TEXT_INPUT,
	ANSWER,
} from "../translation";
import { withRouter } from "../../withRouter"
import "../../css/FreeTextInputForm.css";
import datastore from 'lib/sugar-web/datastore';
import chooser from 'lib/sugar-web/graphics/journalchooser';
import env from 'lib/sugar-web/env';
import meSpeak from 'mespeak';
import withMultimedia from '../../components/WithMultimedia';
import { QuestionOptionsJSX } from '../../components/MultimediaJSX';
import { QuestionJSX } from '../../components/MultimediaJSX';
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class FreeTextInputForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			edit: false,
			id: -1,
			title: '',
			noOfQuestions: 0,
			currentQuestionNo: 1,
			questions: [],
			scores: [],
			times: [],
			isFormValid: false,
			errors: {
				question: false,
				answers: false,
				title: false
			},
			currentQuestion: {
				id: 1,
				question: {
					type: '',
					data: ''
				},
				answer: "",
			}
		};
	}

	// in case of edit load the exercise
	componentDidMount() {
		if (this.props.router.location.state) {
			const { id, title, questions, scores, times } = this.props.router.location.state.exercise;

			let updatedQuestions = questions.map((ques) => {
				return {
					...ques,
					question: setDefaultMedia(ques.question)
				}
			})
			const currentQuestion = updatedQuestions[0];
			this.setState({
				...this.state,
				id: id,
				title: title,
				edit: true,
				isFormValid: true,
				questions: updatedQuestions,
				scores: scores,
				times: times,
				noOfQuestions: questions.length,
				currentQuestion: {
					id: currentQuestion.id,
					question: currentQuestion.question,
					answer: currentQuestion.answer
				}
			});
		}
	}

	handleChangeAns = e => {
		let ans = e.target.value;
		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			currentQuestion: { ...this.state.currentQuestion, answer: ans },
			errors: {
				...this.state.errors,
				answers: error
			}
		}, () => {
			this.checkFormValidation();
		});
	};

	handleChangeTitle = e => {
		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			title: e.target.value,
			errors: {
				...this.state.errors,
				title: error
			}
		}, () => {
			this.checkFormValidation();
		});
	};

	handleChangeQues = e => {
		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			errors: {
				...this.state.errors,
				question: error
			},
			currentQuestion: {
				...this.state.currentQuestion,
				question: {
					...this.state.currentQuestion.question,
					data: e.target.value
				}
			}
		}, () => {
			this.checkFormValidation();
		});
	};


	handleNewEvent = event => {
		event.preventDefault();
	};

	// save current question
	saveCurrentForm = () => {
		this.checkFormValidation();

		if (this.state.isFormValid) {
			const { currentQuestionNo, noOfQuestions } = this.state;
			const { question, answer } = this.state.currentQuestion;

			let id = currentQuestionNo;

			let Ques = {
				id: id,
				answer: answer,
				question: question
			};

			if (currentQuestionNo > noOfQuestions) {
				this.setState({
					...this.state,
					questions: [
						...this.state.questions,
						Ques
					],

					noOfQuestions: id,
					currentQuestionNo: id + 1,
					isFormValid: false,
					currentQuestion: {
						id: id + 1,
						question: { type: '', data: '' },
						answer: '',
					}
				});
			}
			else {
				const { questions } = this.state;
				let index = currentQuestionNo;

				const updatedQuestions = questions.map((ques, i) => (
					ques.id === index ? Ques : ques
				));
				if (currentQuestionNo === noOfQuestions) {
					this.setState({
						...this.state,
						questions: updatedQuestions,
						currentQuestionNo: currentQuestionNo + 1,
						isFormValid: false,
						currentQuestion: {
							id: currentQuestionNo + 1,
							question: { type: '', data: '' },
							answer: '',
						}
					});
				} else {
					const { question, answer } = this.state.questions[index];

					this.setState({
						...this.state,
						questions: updatedQuestions,
						currentQuestionNo: index + 1,
						isFormValid: true,
						currentQuestion: {
							id: index + 1,
							question: question,
							answer: answer
						}
					});
				}
			}
		}
	};

	// check if current form is valid
	checkFormValidation = () => {
		const { currentQuestion, title } = this.state;
		const { question, answer } = currentQuestion;
		let isFormValid = true;

		if (question.type === '' || question.data === '') {
			isFormValid = false;
		}

		if (title === '') {
			isFormValid = false;
		}

		if (answer === '') {
			isFormValid = false;
		}

		this.setState({
			...this.state,
			isFormValid: isFormValid
		});
	};

	// submit exercise
	submitExercise = (bool, e) => {
		e.preventDefault();
		const { srcThumbnail, userLanguage } = this.props;
		let { currentQuestion, questions } = this.state;

		let id = this.state.id;
		if (this.state.id === -1) {
			id = this.props.counter;
		}

		// To save changes before testing the exercise
		if (currentQuestion.id <= questions.length) {
			let updatedCurrentQuestion = {
				id: currentQuestion.id,
				question: currentQuestion.question,
				answer: currentQuestion.answer
			};
			questions[currentQuestion.id - 1] = updatedCurrentQuestion;
		} else {
			questions.push({
				id: currentQuestion.id,
				question: currentQuestion.question,
				answer: currentQuestion.answer
			});
		}

		let exercise = {
			title: this.state.title,
			id: id,
			type: "FREE_TEXT_INPUT",
			questions: questions,
			scores: this.state.scores,
			times: this.state.times,
			thumbnail: srcThumbnail,
			userLanguage: userLanguage
		};

		if (this.state.edit) {
			this.props.editExercise(exercise);
		} else {
			this.props.addNewExercise(exercise);
			this.props.incrementExerciseCounter();
		}

		if (bool)
			this.props.router.navigate('/play/freeText', {state:{ exercise: exercise, edit: true }});
		else
			this.props.router.navigate('/');
	}

	// move to previous question
	previousQues = () => {
		const { currentQuestionNo } = this.state;
		let previousQuestionNo = currentQuestionNo - 1;

		let previousQuestion = this.state.questions[previousQuestionNo - 1];
		const { id, question, answer } = previousQuestion;
		let currentQuestion = {
			id: id,
			question: question,
			answer: answer
		};

		this.setState({
			...this.state,
			isFormValid: true,
			currentQuestionNo: id,
			currentQuestion: currentQuestion
		})
	};

	showJournalChooser = (mediaType) => {
		const { currentQuestion } = this.state;
		let image, audio, video = false;
		if (mediaType === MULTIMEDIA.image)
			image = true;
		if (mediaType === MULTIMEDIA.audio)
			audio = true;
		if (mediaType === MULTIMEDIA.video)
			video = true;
		env.getEnvironment((err, environment) => {
			if (environment.user) {
				// Display journal dialog popup
				chooser.show((entry) => {
					if (!entry) {
						return;
					}
					var dataentry = new datastore.DatastoreObject(entry.objectId);
					dataentry.loadAsText((err, metadata, text) => {
						if (mediaType === MULTIMEDIA.image)
							this.props.showMedia(text, 'img', this.setSourceFromImageEditor);
						this.setState({
							...this.state,
							currentQuestion: {
								...currentQuestion,
								question: {
									type: mediaType,
									data: text
								}
							}
						}, () => {
							this.checkFormValidation();
						});
					});
				}, (image ? { mimetype: 'image/png' } : audio ? { mimetype: 'audio/mp3' } : null),
					(image ? { mimetype: 'image/jpeg' } : audio ? { mimetype: 'audio/mpeg' } : null),
					(audio ? { mimetype: 'audio/wav' } : video ? { mimetype: 'video/mp4' } : null),
					(video ? { mimetype: 'video/webm' } : null));
			}
		});
	};

	speak = (e, text) => {
		let audioElem = e.target;
		let myDataUrl = meSpeak.speak(text, { rawdata: 'data-url' });
		let sound = new Audio(myDataUrl);
		audioElem.classList.remove("button-off");
		audioElem.classList.add("button-on");
		sound.play();
		sound.onended = () => {
			audioElem.classList.remove("button-on");
			audioElem.classList.add("button-off");
		}
	}

	selectQuestionType = (mediaType) => {
		const { currentQuestion } = this.state;
		if (mediaType === MULTIMEDIA.text || mediaType === MULTIMEDIA.textToSpeech) {
			this.setState({
				...this.state,
				currentQuestion: {
					...currentQuestion,
					question: {
						type: mediaType,
						data: ''
					}
				}
			}, () => {
				this.checkFormValidation();
			});
		} else {
			this.showJournalChooser(mediaType)
		}
	}

	setSourceFromImageEditor = (url) => {
		this.setState({
			...this.state,
			currentQuestion: {
				...this.state.currentQuestion,
				question: {
					...this.state.currentQuestion.question,
					data: url
				}
			}
		}, () => {
			this.checkFormValidation();
			this.props.closeModal();
		})
	}

	onDeleteQuestion = () => {
		const { currentQuestion, questions } = this.state;
		let updatedQuestions = [];
		let newCurrentQuestion;

		if ((questions.length === 0 || questions.length === 1) && currentQuestion.id === 1) {
			updatedQuestions = [];
			newCurrentQuestion = {
				id: 1,
				question: {
					type: '',
					data: ''
				},
				answer: ""
			}
		}
		else if (currentQuestion.id > questions.length) {
			newCurrentQuestion = questions[questions.length - 1];
			updatedQuestions = questions;
		} else {
			questions.forEach((question) => {
				if (question.id !== currentQuestion.id)
					updatedQuestions.push(question);
			})
			updatedQuestions = updatedQuestions.map((question, index) => {
				if (question.id !== (index + 1)) {
					question.id = index + 1;
					return question;
				}
				return question;
			})

			if (currentQuestion.id === (updatedQuestions.length + 1)) {
				newCurrentQuestion = updatedQuestions[currentQuestion.id - 2];
			} else {
				newCurrentQuestion = updatedQuestions[currentQuestion.id - 1];
			}
		}

		this.setState({
			...this.state,
			questions: updatedQuestions,
			noOfQuestions: updatedQuestions.length,
			currentQuestion: newCurrentQuestion,
			currentQuestionNo: newCurrentQuestion.id
		}, () => {
			this.checkFormValidation();
		})
	}

	render() {
		const { currentQuestion, errors } = this.state;
		const { thumbnail, insertThumbnail, showMedia, ShowEditableModalWindow } = this.props;
		const { id } = currentQuestion;
		let questionType = currentQuestion.question.type;
		let placeholder_string = ENTER_ANSWER;

		let title_error = '';
		let question_error = '';
		let answer_error = '';

		if (errors['title']) {
			title_error = <span style={{ color: "red" }}><FormattedMessage id={TITLE_ERROR} /></span>;
		}
		if (errors['question']) {
			question_error = <span style={{ color: "red" }}><FormattedMessage id={QUESTION_ERROR} /></span>;
		}
		if (errors['answers']) {
			answer_error = <span style={{ color: "red" }}><FormattedMessage id={ANSWER_ERROR} /></span>;
		}

		return (
			<div className={"container" + (this.props.inFullscreenMode? " fullScreenMargin" : "")} id="freeTextInput-form">
				<div className="container-fluid">
					<div className="row align-items-center justify-content-center">
						<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")}>
							<div>
								<p><strong><FormattedMessage id={FREE_TEXT_INPUT} /></strong></p>
								<hr className="my-3" />
								<div className="col-md-12">
									<form onSubmit={this.handleNewEvent}>
										<div className="row">
											<div className="form-group">
												{thumbnail}
												<label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE} /></label>
												<button style={{ display: 'none' }} />
												<button className="btn button-finish button-thumbnail"
													onClick={insertThumbnail}
												/>
												<input
													className="input-freeText"
													type="text"
													id="title"
													required
													value={this.state.title}
													onChange={this.handleChangeTitle}
												/>
												{title_error}
											</div>
										</div>
										<div className="row">
											<div className="form-group">
												<label htmlFor="question">{id}. <FormattedMessage id={QUESTION} />:</label>
												<button className="btn button-delete"
													onClick={this.onDeleteQuestion}
													disabled={this.state.questions.length === 0}
												/>
												{questionType && <button className="btn button-edit"
													onClick={() => { this.setState({ ...this.state, currentQuestion: { ...currentQuestion, question: { type: '', data: '' } } }) }}>
												</button>}
												{!questionType &&
													<QuestionOptionsJSX
														selectQuestionType={this.selectQuestionType}
													/>}
												{questionType &&
													<QuestionJSX
														questionType={this.state.currentQuestion.question.type}
														questionData={this.state.currentQuestion.question.data}
														showMedia={showMedia}
														handleChangeQues={this.handleChangeQues}
														speak={this.speak}
														setImageEditorSource={this.setSourceFromImageEditor}
													/>
												}
												{question_error}
											</div>
										</div>
										<div className="row">
											<div className="form-group">
												<label htmlFor="answer"><FormattedMessage id={ANSWER} />:</label>
												<FormattedMessage id={placeholder_string}>
													{placeholder => <input
														className="answers input-ans"
														name={`answer`}
														type="text"
														value={this.state.currentQuestion.answer}
														required
														placeholder={placeholder}
														onChange={this.handleChangeAns} />}
												</FormattedMessage>
												<div>
													{answer_error}
												</div>
											</div>
										</div>
										<div className="form-group row justify-content-between">
											<button
												onClick={this.previousQues}
												className={"btn button-previous mb-2"}
												disabled={this.state.currentQuestionNo === 1}
											>
												<FormattedMessage id={PREVIOUS_QUESTION} />
											</button>
											<div className="justify-content-end">
												<button
													onClick={this.saveCurrentForm}
													className={"btn button-next mb-2"}
													disabled={!this.state.isFormValid}
												>
													<FormattedMessage id={NEXT_QUESTION} />
												</button>
											</div>
										</div>
										<div className="form-group row justify-content-between">
											<button
												onClick={(e) => this.submitExercise(false, e)}
												className={"btn button-finish mb-2"}
												disabled={!this.state.isFormValid}
											>
												<FormattedMessage id={FINISH_EXERCISE} />
											</button>
											<button
												onClick={(e) => this.submitExercise(true, e)}
												className={"btn button-finish mb-2"}
												disabled={!this.state.isFormValid}
											>
												<FormattedMessage id={TEST_EXERCISE} />
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
				<ShowEditableModalWindow />
			</div>
		)
	}

}

function MapStateToProps(state) {
	return {
		counter: state.exercise_counter
	}
}

export default withMultimedia(require('../../media/template/freetext_input_image.svg'))(withRouter(
	connect(MapStateToProps,
		{ addNewExercise, incrementExerciseCounter, editExercise }
	)(FreeTextInputForm)));