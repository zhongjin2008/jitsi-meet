// @flow

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Audio } from '../../media';
import { Avatar } from '../../participants';
import { Container, Text } from '../../react';
import UIEvents from '../../../../../service/UI/UIEvents';

import styles from './styles';

declare var $: Object;
declare var APP: Object;
declare var interfaceConfig: Object;

/**
 * Implements a React {@link Component} which depicts the establishment of a
 * call with a specific remote callee.
 *
 * @extends Component
 */
class CallOverlay extends Component<*, *> {
    /**
     * {@code CallOverlay} component's property types.
     *
     * @static
     */
    static propTypes = {
        _callee: PropTypes.object
    };

    /**
     * Determines whether this overlay needs to be rendered (according to a
     * specific redux state). Called by {@link OverlayContainer}.
     *
     * @param {Object} state - The redux state.
     * @returns {boolean} - If this overlay needs to be rendered, {@code true};
     * {@code false}, otherwise.
     */
    static needsRender(state) {
        return state['features/base/jwt'].callOverlayVisible;
    }

    /**
     * The (reference to the) {@link Audio} which plays/renders the audio
     * depicting the ringing phase of the call establishment represented by this
     * {@code CallOverlay}.
     */
    _audio: ?Audio

    _onLargeVideoAvatarVisible: Function

    _playAudioInterval: ?number

    _ringingTimeout: ?number

    _setAudio: Function

    state: {

        /**
         * The CSS class (name), if any, to add to this {@code CallOverlay}.
         *
         * @type {string}
         */
        className: ?string,

        /**
         * The indicator which determines whether this {@code CallOverlay}
         * should play/render audio to indicate the ringing phase of the
         * call establishment between the local participant and the
         * associated remote callee.
         *
         * @type {boolean}
         */
        renderAudio: boolean,

        /**
         * The indicator which determines whether this {@code CallOverlay}
         * is depicting the ringing phase of the call establishment between
         * the local participant and the associated remote callee or the
         * phase afterwards when the callee has not answered the call for a
         * period of time and, consequently, is considered unavailable.
         *
         * @type {boolean}
         */
        ringing: boolean
    }

    /**
     * Initializes a new {@code CallOverlay} instance.
     *
     * @param {Object} props - The read-only React {@link Component} props with
     * which the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            className: undefined,
            renderAudio:
                typeof interfaceConfig !== 'object'
                    || !interfaceConfig.DISABLE_RINGING,
            ringing: true
        };

        this._onLargeVideoAvatarVisible
            = this._onLargeVideoAvatarVisible.bind(this);
        this._setAudio = this._setAudio.bind(this);

        if (typeof APP === 'object') {
            APP.UI.addListener(
                UIEvents.LARGE_VIDEO_AVATAR_VISIBLE,
                this._onLargeVideoAvatarVisible);
        }
    }

    /**
     * Sets up timeouts such as the timeout to end the ringing phase of the call
     * establishment depicted by this {@code CallOverlay}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        // Set up the timeout to end the ringing phase of the call establishment
        // depicted by this CallOverlay.
        if (this.state.ringing && !this._ringingTimeout) {
            this._ringingTimeout
                = setTimeout(
                    () => {
                        this._pauseAudio();

                        this._ringingTimeout = undefined;
                        this.setState({
                            ringing: false
                        });
                    },
                    30000);
        }

        this._playAudio();
    }

    /**
     * Cleans up before this {@code Calleverlay} is unmounted and destroyed.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._pauseAudio();

        if (this._ringingTimeout) {
            clearTimeout(this._ringingTimeout);
            this._ringingTimeout = undefined;
        }

        if (typeof APP === 'object') {
            APP.UI.removeListener(
                UIEvents.LARGE_VIDEO_AVATAR_VISIBLE,
                this._onLargeVideoAvatarVisible);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { className, ringing } = this.state;
        const { avatarUrl, avatar, name } = this.props._callee;

        return (
            <Container
                { ...this._style('ringing', className) }
                id = 'ringOverlay'>
                <Container
                    { ...this._style('ringing__content') }>
                    <Text { ...this._style('ringing__text') }>
                        { ringing ? 'Calling...' : '' }
                    </Text>
                    <Avatar
                        { ...this._style('ringing__avatar') }
                        uri = { avatarUrl || avatar } />
                    <Container
                        { ...this._style('ringing__caller-info') }>
                        <Text
                            { ...this._style('ringing__text') }>
                            { name }
                            { ringing ? '' : ' isn\'t available' }
                        </Text>
                    </Container>
                </Container>
                { this._renderAudio() }
            </Container>
        );
    }

    /**
     * Notifies this {@code CallOverlay} that the visibility of the
     * participant's avatar in the large video has changed.
     *
     * @param {boolean} largeVideoAvatarVisible - If the avatar in the large
     * video (i.e. of the participant on the stage) is visible, then
     * {@code true}; otherwise, {@code false}.
     * @private
     * @returns {void}
     */
    _onLargeVideoAvatarVisible(largeVideoAvatarVisible: boolean) {
        this.setState({
            className: largeVideoAvatarVisible ? 'solidBG' : undefined
        });
    }

    /**
     * Stops the playback of the audio which represents the ringing phase of the
     * call establishment depicted by this {@code CallOverlay}.
     *
     * @private
     * @returns {void}
     */
    _pauseAudio() {
        const audio = this._audio;

        if (audio) {
            audio.pause();
        }
        if (this._playAudioInterval) {
            clearInterval(this._playAudioInterval);
            this._playAudioInterval = undefined;
        }
    }

    /**
     * Starts the playback of the audio which represents the ringing phase of
     * the call establishment depicted by this {@code CallOverlay}.
     *
     * @private
     * @returns {void}
     */
    _playAudio() {
        if (this._audio) {
            this._audio.play();
            if (!this._playAudioInterval) {
                this._playAudioInterval
                    = setInterval(() => this._playAudio(), 5000);
            }
        }
    }

    /**
     * Renders an audio element to represent the ringing phase of the call
     * establishment represented by this {@code CallOverlay}.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderAudio() {
        if (this.state.renderAudio && this.state.ringing) {
            return (
                <Audio
                    ref = { this._setAudio }
                    src = './sounds/ring.ogg' />
            );
        }

        return null;
    }

    /**
     * Sets the (reference to the) {@link Audio} which renders the ringing phase
     * of the call establishment represented by this {@code CallOverlay}.
     *
     * @param {Audio} audio - The (reference to the) {@code Audio} which
     * plays/renders the audio depicting the ringing phase of the call
     * establishment represented by this {@code CallOverlay}.
     * @private
     * @returns {void}
     */
    _setAudio(audio) {
        this._audio = audio;
    }

    /**
     * Attempts to convert specified CSS class names into React
     * {@link Component} props {@code style} or {@code className}.
     *
     * @param {Array<string>} classNames - The CSS class names to convert
     * into React {@code Component} props {@code style} or {@code className}.
     * @returns {{
     *     className: string,
     *     style: Object
     * }}
     */
    _style(...classNames: Array<?string>) {
        let className = '';
        let style;

        for (const aClassName of classNames) {
            if (aClassName) {
                // Attemp to convert aClassName into style.
                if (styles && aClassName in styles) {
                    // React Native will accept an Array as the value of the
                    // style prop. However, I do not know about React.
                    style = {
                        ...style,
                        ...styles[aClassName]
                    };
                } else {
                    // Otherwise, leave it as className.
                    className += aClassName;
                }
            }
        }

        // Choose which of the className and/or style props has a value and,
        // consequently, must be returned.
        const props = {};

        if (className) {
            props.className = className;
        }
        if (style) {
            props.style = style;
        }

        return props;
    }
}

/**
 * Maps (parts of) the redux state to {@code CallOverlay}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _callee: Object
 * }}
 */
function _mapStateToProps(state) {
    return {
        /**
         *
         * @private
         * @type {Object}
         */
        _callee: state['features/base/jwt'].callee
    };
}

export default connect(_mapStateToProps)(CallOverlay);
