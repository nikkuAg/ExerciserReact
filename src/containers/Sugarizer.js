import React, { Component } from "react";
import { connect } from "react-redux";
import { MemoryRouter as Router } from "react-router-dom";

// Localization Dependencies
import { IntlProvider } from "react-intl";
import { addLocaleData } from "react-intl";
import messages from "../translations/lang";
import locale_en from "react-intl/locale-data/en";
import locale_fr from "react-intl/locale-data/fr";
import locale_es from "react-intl/locale-data/es";

import default_activities from "../default_activities";

// Sugarizer Dependencies
import activity from "lib/sugar-web/activity/activity";
import env from "lib/sugar-web/env";
import presencepalette from "lib/sugar-web/graphics/presencepalette";

//Components
import Main from "./Router";
import Navbar from "../components/Navbar";

import "../css/index.css";
import meSpeak from "mespeak";
import LZ from "lz-string";

// actions
import { setExercises } from "../store/actions/exercises";
import {
	setUser,
	setRunAllExercise,
	setExerciseIndex,
} from "../store/actions/sugarizer";
import { setExerciseCounter } from "../store/actions/increment_counter";
import {
	setEvaluationMode,
	setEvaluationExercise,
	addEvaluationExercise,
} from "../store/actions/evaluation";
import {
	setIsHost,
	setIsShared,
	addUser,
	removeUser,
	addSharedResult,
	shareAllExercise,
	addSharedExercise,
} from "../store/actions/presence";
import { MULTIMEDIA } from "../utils";

class Sugarizer extends Component {
	constructor(props) {
		super(props);

		addLocaleData([...locale_en, ...locale_fr, ...locale_es]);

		this.language = navigator.language.split(/[-_]/)[0];

		this.isHost = false;
		this.isRunAll = false;
		this.presence = null;
		this.onNetworkDataReceived = this.onNetworkDataReceived.bind(this);
		this.onNetworkUserChanged = this.onNetworkUserChanged.bind(this);

		this.state = {
			inEditMode: false,
			inFullscreenMode: false,
		};
	}

	toggleEditMode(edit) {
		this.setState({ inEditMode: edit });
	}

	componentDidMount() {
		const {
			setExercises,
			setExerciseCounter,
			setIsHost,
			setIsShared,
			setUser,
			setRunAllExercise,
			setExerciseIndex,
			setEvaluationMode,
			setEvaluationExercise,
		} = this.props;

		let temp = this;
		window.setTimeout(function () {
			activity.setup();
			meSpeak.loadConfig(require("../mespeak_config.json"));
			env.getEnvironment(function (err, environment) {
				if (environment.user) {
					let user = {
						name: environment.user.name,
						colorvalue: environment.user.colorvalue,
					};
					setUser(user);
					temp.language = environment.user.language;
					// setting default lang
					if (!messages[temp.language]) {
						temp.language = "en";
					}
				}

				// Load from datastore
				if (!environment.objectId) {
					// console.log("New instance");
					if (!environment.sharedId) temp.setDefaultExercises();
					temp.stopActivity();
				} else {
					activity
						.getDatastoreObject()
						.loadAsText(function (error, metadata, data) {
							if (error === null && data !== null) {
								// console.log("object found!");
								// Decompressing jsonData to be stored in Local Storage
								let uncompressedData = LZ.decompressFromUTF16(data);
								let json = JSON.parse(uncompressedData);
								setExercises(json.exercises);
								setExerciseCounter(json.counter);
								setRunAllExercise(json.is_run_all_click);
								setExerciseIndex(json.exercise_index);
								if (json.evaluation) {
									if (json.evaluation.mode === "async") {
										setEvaluationMode(json.evaluation.mode);
										temp.evaluateExercise(json.evaluation.mode);
									} else {
										setEvaluationMode("");
									}
									setEvaluationExercise(json.evaluation.exercises);
								}
							}
						});
				}

				if (environment.sharedId) {
					// console.log("Shared instance");
					temp.presence = activity.getPresenceObject(function (error, network) {
						setIsShared(true);
						network.onDataReceived(temp.onNetworkDataReceived);
						network.onSharedActivityUserChanged(temp.onNetworkUserChanged);
					});
				}
			});

			let palette = new presencepalette.PresencePalette(
				document.getElementById("network-button"),
				undefined
			);
			palette.addEventListener("shared", function () {
				palette.popDown();
				// console.log("Want to share");
				temp.presence = activity.getPresenceObject(function (error, network) {
					if (error) {
						// console.log("Sharing error");
						return;
					}
					network.createSharedActivity(
						"org.sugarlabs.Exerciser",
						function (groupId) {
							// console.log("Activity shared");
							setIsHost(true);
							setIsShared(true);
							temp.isHost = true;
							// console.log("after sharing:");
						}
					);
					network.onDataReceived(temp.onNetworkDataReceived);
					network.onSharedActivityUserChanged(temp.onNetworkUserChanged);
				});
			});
		}, 500);
	}

	onNetworkDataReceived(msg) {
		if (this.presence.getUserInfo().networkId === msg.user.networkId) {
			return;
		}
		switch (msg.content.action) {
			case "init":
				this.props.setExercises(msg.content.data.shared_exercises);
				this.props.setRunAllExercise(false);
				break;
			case "update":
				this.props.setExercises(msg.content.data.shared_exercises);
				if (
					msg.content.data.shared_exercises[0] &&
					msg.content.data.shared_exercises[0].run_all
				) {
					this.props.shareAllExercise(msg.content.data.shared_exercises);
				}
				break;
			case "result":
				if (this.isHost) {
					this.props.addSharedResult(msg.content.result);
				}
				break;
			case "init_evaluation":
				this.props.setEvaluationMode(msg.content.data);
				if (msg.content.data === "async") {
					document.getElementById("evaluation_heading").innerHTML =
						"Asynchronous";
				} else if (msg.content.data === "real") {
					document.getElementById("evaluation_heading").innerHTML = "Realtime";
				}
				break;
			case "update_evaluation":
				this.props.setEvaluationExercise(msg.content.data.evaluation_exercises);
				break;
			default:
				break;
		}
	}

	onNetworkUserChanged(msg) {
		if (this.isHost) {
			const { shared_exercises } = this.props;
			let data = {
				shared_exercises: shared_exercises,
			};
			let presence = this.presence;
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: "init",
					data: data,
				},
			});
			if (this.props.evaluationMode === "real") {
				data = {
					mode: "real",
				};
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: "init_evaluation",
						data: data,
					},
				});

				if (this.props.evaluationExercise.length !== 0) {
					data = {
						evaluation_exercises: this.props.evaluationExercise,
					};
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: "update_evaluation",
							data: data,
						},
					});
				}
			}
		}

		if (msg.move === 1) this.props.addUser(msg.user);
		else this.props.removeUser(msg.user);
		// console.log("User " + msg.user.name + " " + (msg.move === 1 ? "join" : "leave"));
	}

	onExerciseUpdate = () => {
		const { shared_exercises } = this.props;
		let data = {
			shared_exercises: shared_exercises,
		};
		let presence = this.presence;
		presence.sendMessage(presence.getSharedInfo().id, {
			user: presence.getUserInfo(),
			content: {
				action: "update",
				data: data,
			},
		});
	};

	toggleFullscreen = () => {
		this.setState((state) => {
			return {
				inFullscreenMode: !state.inFullscreenMode,
			};
		});
	};

	onExerciseResult = (id, score, time, userAnswers) => {
		let presence = this.presence;
		presence.sendMessage(presence.getSharedInfo().id, {
			user: presence.getUserInfo(),
			content: {
				action: "result",
				result: {
					user: presence.getUserInfo(),
					id: id,
					score: score,
					time: time,
					userAnswers: userAnswers,
				},
			},
		});
	};

	evaluateExercise = (mode) => {
		document.getElementById("network-button").disabled = true;
		this.props.setEvaluationMode(mode);
		if (mode === "async") {
			this.stopActivity();
		} else if (mode === "real") {
			if (!this.props.isShared) {
				document.getElementById("shared-button").click();
			}
			let presence = this.presence;
			let data = {
				mode: "real",
			};
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: "init_evaluation",
					data: data,
				},
			});
		}
	};

	onShareAllExercise = () => {
		if (!this.props.isShared) {
			document.getElementById("shared-button").click();
		}
		let presence = this.presence;
		let data = {
			shared_exercises: this.props.exercises,
		};
		this.props.shareAllExercise(this.props.exercises);
		this.props.exercises.forEach((exercise) => {
			if (!this.props.shared_exercises.find((x) => x.id === exercise.id)) {
				exercise["run_all"] = true;
				exercise["shared"] = true;
				this.props.addSharedExercise(exercise);
			}
		});
		presence.sendMessage(presence.getSharedInfo().id, {
			user: presence.getUserInfo(),
			content: {
				action: "update",
				data: data,
			},
		});
	};

	presenceEvaluationExercise = (id) => {
		if (this.props.isShared && this.props.evaluationMode === "real") {
			let exercise = this.props.exercises.find((x) => x.id === id);
			let exercises = this.props.evaluationExercise;

			if (!this.props.evaluationExercise.find((x) => x.id === exercise.id)) {
				this.props.addEvaluationExercise(exercise);
				exercises.push(exercise);
			}

			let presence = this.presence;
			let data = {
				evaluation_exercises: exercises,
			};

			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: "update_evaluation",
					data: data,
				},
			});
		}
	};

	onRunAllExercise = () => {
		this.props.setRunAllExercise(true);
		if (this.props.evaluationMode !== "") {
			this.props.exercises.forEach((exercise) => {
				if (!this.props.evaluationExercise.find((x) => x.id === exercise.id)) {
					this.props.addEvaluationExercise(exercise);
				}
			});
		}
	};

	stopActivity() {
		const { counter, exercises, isRunAll, exerciseIndex } = this.props;

		let journalExercises = exercises.map((exercise) => {
			return {
				...exercise,
				shared: false,
			};
		});
		let evaluationExercise = this.props.evaluationExercise.map((exercise) => {
			return {
				...exercise,
				shared: false,
			};
		});

		let json = {
			counter: counter,
			exercises: journalExercises,
			is_run_all_click: isRunAll,
			exercise_index: exerciseIndex,
			evaluation: {
				mode: this.props.evaluationMode,
				exercises: evaluationExercise,
			},
		};
		if (this.props.evaluationMode !== "async") {
			json.evaluation.exercises = {};
		}
		let jsonData = JSON.stringify(json);
		// Compressing jsonData to be stored in Local Storage
		jsonData = LZ.compressToUTF16(jsonData);
		activity.getDatastoreObject().setDataAsText(jsonData);
		activity.getDatastoreObject().save(function (error) {
			if (error === null) {
				// console.log("write done.");
			} else {
				// console.log("write failed.");
			}
		});
	}

	setDefaultExercises() {
		// Default Exercises list
		let defaultExercises = default_activities;

		// Translate questions/answers

		let temp = this;
		let translate = function (text) {
			if (!messages[temp.language]) return text;
			let translated = messages[temp.language][text];
			return translated || text;
		};

		let translateItem = function (item) {
			let localized = [
				"title",
				"question",
				"clozeText",
				"answers",
				"groups",
				"list",
				"answer",
				"correctAns",
				"options",
				"correctGroup",
			];
			for (let property in item) {
				if (localized.indexOf(property) === -1) {
					continue;
				}
				if (!Array.isArray(item[property])) {
					if (
						typeof item[property] === "object" &&
						item[property].type === MULTIMEDIA.text
					)
						item[property].data = translate(item[property].data);
					else if (typeof item[property] !== "object")
						item[property] = translate(item[property]);
				} else {
					let elements = [];
					for (let j = 0; j < item[property].length; j++) {
						if (
							typeof item[property][j] === "object" &&
							item[property][j].type === MULTIMEDIA.text
						)
							item[property][j].data = translate(item[property][j].data);
						else if (typeof item[property][j] !== "object")
							item[property][j] = translate(item[property][j]);
						elements.push(translate(item[property][j]));
					}
					item[property] = elements;
				}
			}
			return item;
		};

		for (let i = 0; i < defaultExercises.length; i++) {
			let exercise = defaultExercises[i];
			exercise = translateItem(exercise);
			if (
				exercise.type === "MCQ" ||
				exercise.type === "FREE_TEXT_INPUT" ||
				exercise.type === "GROUP_ASSIGNMENT"
			) {
				for (let index = 0; index < exercise.questions.length; index++)
					exercise.questions[index] = translateItem(exercise.questions[index]);
			} else if (exercise.type === "MATCHING_PAIR") {
				for (let index = 0; index < exercise.pairs.length; index++)
					exercise.pairs[index] = translateItem(exercise.pairs[index]);
			}
		}
		// Add to Exercise list
		this.props.setExercises(defaultExercises);
		this.props.setExerciseCounter(defaultExercises.length + 1);
	}

	render() {
		return (
			<IntlProvider locale={this.language} messages={messages[this.language]}>
				<Router>
					<div className='App-container'>
						<Navbar
							onStop={() => this.stopActivity()}
							inFullscreenMode={this.state.inFullscreenMode}
							toggleFullscreen={this.toggleFullscreen}
							inEditMode={this.state.inEditMode}
							toggleEditMode={(edit) => this.toggleEditMode(edit)}
							runAllExercise={this.onRunAllExercise}
							onShareAll={this.onShareAllExercise}
							evaluate={(mode) => this.evaluateExercise(mode)}
						/>
						<Main
							inFullscreenMode={this.state.inFullscreenMode}
							inEditMode={this.state.inEditMode}
							onUpdate={this.onExerciseUpdate}
							onSharedResult={this.onExerciseResult}
							setExercises={this.props.setExercises}
							presenceEvaluation={(id) => this.presenceEvaluationExercise(id)}
							runNextExercise={(id) => this.runNextExercise(id)}
						/>
					</div>
				</Router>
			</IntlProvider>
		);
	}
}

function MapStateToProps(state) {
	return {
		counter: state.exercise_counter,
		exercises: state.exercises,
		shared_exercises: state.shared_exercises,
		isHost: state.isHost,
		isRunAll: state.isRunAll,
		exerciseIndex: state.exerciseRunning,
		isShared: state.isShared,
		evaluationMode: state.evaluation_mode,
		evaluationExercise: state.evaluation_exercise,
	};
}

export default connect(MapStateToProps, {
	setExercises,
	setExerciseCounter,
	setRunAllExercise,
	setIsHost,
	setIsShared,
	setExerciseIndex,
	addUser,
	setUser,
	removeUser,
	addSharedResult,
	shareAllExercise,
	addSharedExercise,
	setEvaluationMode,
	setEvaluationExercise,
	addEvaluationExercise,
})(Sugarizer);
