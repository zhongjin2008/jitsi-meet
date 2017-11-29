/* @flow */

import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect as reactReduxConnect } from 'react-redux';

import { connect, disconnect } from '../../base/connection';
import { DialogContainer } from '../../base/dialog';
import { Filmstrip } from '../../filmstrip';
import { LargeVideo } from '../../large-video';
import { NotificationsContainer } from '../../notifications';
import { OverlayContainer } from '../../overlay';
import { showToolbox, Toolbox } from '../../toolbox';
import { HideNotificationBarStyle } from '../../unsupported-browser';

declare var $: Function;
declare var APP: Object;
declare var interfaceConfig: Object;

/**
 * The conference page of the Web application.
 */
class Conference extends Component<*> {
    _onShowToolbar: Function;
    _originalOnShowToolbar: Function;

    /**
     * Conference component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * Whether or not the current local user is recording the conference.
         *
         */
        _isRecording: PropTypes.bool,

        dispatch: PropTypes.func
    };

    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Throttle and bind this component's mousemove handler to prevent it
        // from firing too often.
        this._originalOnShowToolbar = this._onShowToolbar;
        this._onShowToolbar = _.throttle(
            () => this._originalOnShowToolbar(),
            100,
            {
                leading: true,
                trailing: false
            });
    }

    /**
     * Until we don't rewrite UI using react components
     * we use UI.start from old app. Also method translates
     * component right after it has been mounted.
     *
     * @inheritdoc
     */
    componentDidMount() {
        APP.UI.start();

        APP.UI.registerListeners();
        APP.UI.bindEvents();

        this.props.dispatch(connect());
    }

    /**
     * Disconnect from the conference when component will be
     * unmounted.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        APP.UI.stopDaemons();
        APP.UI.unregisterListeners();
        APP.UI.unbindEvents();

        APP.conference.isJoined() && this.props.dispatch(disconnect());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { filmStripOnly, VIDEO_QUALITY_LABEL_DISABLED } = interfaceConfig;
        const hideVideoQualityLabel = filmStripOnly
            || VIDEO_QUALITY_LABEL_DISABLED
            || this.props._isRecording;

        return (
            <div
                id = 'videoconference_page'
                onMouseMove = { this._onShowToolbar }>
                <div id = 'videospace'>
                    <LargeVideo
                        hideVideoQualityLabel = { hideVideoQualityLabel } />
                    <Filmstrip filmstripOnly = { filmStripOnly } />
                </div>

                { filmStripOnly ? null : <Toolbox /> }

                <DialogContainer />
                <NotificationsContainer />
                <OverlayContainer />

                {/*
                  * Temasys automatically injects a notification bar, if
                  * necessary, displayed at the top of the page notifying that
                  * WebRTC is not installed or supported. We do not need/want
                  * the notification bar in question because we have whole pages
                  * dedicated to the respective scenarios.
                  */}
                <HideNotificationBarStyle />
            </div>
        );
    }

    /**
     * Displays the toolbar.
     *
     * @private
     * @returns {void}
     */
    _onShowToolbar() {
        this.props.dispatch(showToolbox());
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code Conference} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _isRecording: boolean
 * }}
 */
function _mapStateToProps(state) {
    return {
        _isRecording: state['features/base/config'].iAmRecorder
    };
}

export default reactReduxConnect(_mapStateToProps)(Conference);
