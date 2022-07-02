import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from '../withRouter'
import '../css/Navbar.css'
import { injectIntl } from 'react-intl';
import { UNFULLSCREEN } from "../containers/translation";
import MainToolbar from './MainToolbar';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isfullScreen: false,
			showTutorial: false
		}
	}

	// redirect to new exercise template
	directToNew = () => {
		this.props.router.navigate('/new');
	};

	// redirect to home screen
	directToHome = () => {
		this.props.router.navigate('/');
	};

	enterEditMode = () => {
		this.props.toggleEditMode(true);
	}

	exitEditMode = () => {
		this.props.toggleEditMode(false);
		this.props.router.navigate('/');
	}

	startTutorial = () => {
		this.setState({
			showTutorial: true
		});
	}

	stopTutorial = () => {
		this.setState({
			showTutorial: false
		});
	}
	goFullscreen = () => {
		this.setState({
			isfullScreen: true
		})
	}
	gounFullScreen = () => {
		this.setState({
			isfullScreen: false
		})
	}

	render() {
		let unFullScreen = this.props.intl.formatMessage({ id: UNFULLSCREEN });
		let navFunctions = {
			directToNew: this.directToNew,
			directToHome: this.directToHome,
			enterEditMode: this.enterEditMode,
			exitEditMode: this.exitEditMode,
			startTutorial: this.startTutorial,
			stopTutorial: this.stopTutorial
		};
		return (
			<React.Fragment>
				<MainToolbar
					{...this.props}
					{...navFunctions}
					showTutorial={this.state.showTutorial}
				/>
				<button
					className={"toolbutton" + (!this.props.inFullscreenMode ? " toolbar-hide" : "")}
					id="unfullscreen-button"
					title={unFullScreen}
					onClick={this.props.toggleFullscreen} />
			</React.Fragment>
		);
	}
}

function mapStateToProps(state) {
	return {
		exercises: state.exercises
	};
}

export default injectIntl(withRouter(connect(mapStateToProps)(Navbar)));
