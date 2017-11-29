/* @flow */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FeedbackButton } from '../../feedback';
import UIEvents from '../../../../service/UI/UIEvents';

import {
    toggleSideToolbarContainer
} from '../actions';
import { getToolbarClassNames } from '../functions';
import Toolbar from './Toolbar';

declare var APP: Object;
declare var config: Object;

/**
 * Implementation of secondary toolbar React component.
 *
 * @class SecondaryToolbar
 * @extends Component
 */
class SecondaryToolbar extends Component<*, *> {
    state: Object;

    /**
     * Secondary toolbar property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * Application ID for callstats.io API. The {@code FeedbackButton} will
         * display if defined.
         */
        _callStatsID: PropTypes.string,

        /**
         * The indicator which determines whether the local participant is a
         * guest in the conference.
         */
        _isGuest: PropTypes.bool,

        /**
         * Handler dispatching toggle toolbar container.
         */
        _onSideToolbarContainerToggled: PropTypes.func,

        /**
         * Contains map of secondary toolbar buttons.
         */
        _secondaryToolbarButtons: PropTypes.instanceOf(Map),

        /**
         * Shows whether toolbox is visible.
         */
        _visible: PropTypes.bool
    };

    /**
     * Register legacy UI listener.
     *
     * @returns {void}
     */
    componentDidMount(): void {
        APP.UI.addListener(
            UIEvents.SIDE_TOOLBAR_CONTAINER_TOGGLED,
            this.props._onSideToolbarContainerToggled);
    }

    /**
     * Unregisters legacy UI listener.
     *
     * @returns {void}
     */
    componentWillUnmount(): void {
        APP.UI.removeListener(
            UIEvents.SIDE_TOOLBAR_CONTAINER_TOGGLED,
            this.props._onSideToolbarContainerToggled);
    }

    /**
     * Renders secondary toolbar component.
     *
     * @returns {ReactElement}
     */
    render(): React$Element<*> | null {
        const { _callStatsID, _secondaryToolbarButtons } = this.props;

        // The number of buttons to show in the toolbar isn't fixed, it depends
        // on the availability of features and configuration parameters. So
        // there may be nothing to render.
        if (_secondaryToolbarButtons.size === 0) {
            return null;
        }

        const { secondaryToolbarClassName } = getToolbarClassNames(this.props);

        return (
            <Toolbar
                className = { secondaryToolbarClassName }
                toolbarButtons = { _secondaryToolbarButtons }
                tooltipPosition = 'right'>
                { _callStatsID
                    ? <FeedbackButton tooltipPosition = 'right' /> : null }
            </Toolbar>
        );
    }
}

/**
 * Maps some of Redux actions to component's props.
 *
 * @param {Function} dispatch - Redux action dispatcher.
 * @returns {{
 *     _onSideToolbarContainerToggled
 * }}
 * @private
 */
function _mapDispatchToProps(dispatch: Function): Object {
    return {

        /**
         * Dispatches an action signalling that side toolbar container is
         * toggled.
         *
         * @param {string} containerId - Id of side toolbar container.
         * @returns {Object} Dispatched action.
         */
        _onSideToolbarContainerToggled(containerId: string) {
            dispatch(toggleSideToolbarContainer(containerId));
        }
    };
}

/**
 * Maps part of Redux state to component's props.
 *
 * @param {Object} state - Snapshot of Redux store.
 * @returns {{
 *     _isGuest: boolean,
 *     _secondaryToolbarButtons: Map,
 *     _visible: boolean
 * }}
 * @private
 */
function _mapStateToProps(state: Object): Object {
    const { isGuest } = state['features/base/jwt'];
    const { secondaryToolbarButtons, visible } = state['features/toolbox'];
    const { callStatsID } = state['features/base/config'];

    return {
        /**
         * Application ID for callstats.io API.
         */
        _callStatsID: callStatsID,

        /**
         * The indicator which determines whether the local participant is a
         * guest in the conference.
         *
         * @private
         * @type {boolean}
         */
        _isGuest: isGuest,

        /**
         * Default toolbar buttons for secondary toolbar.
         *
         * @private
         * @type {Map}
         */
        _secondaryToolbarButtons: secondaryToolbarButtons,

        /**
         * The indicator which determines whether the {@code SecondaryToolbar}
         * is visible.
         *
         * @private
         * @type {boolean}
         */
        _visible: visible
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(SecondaryToolbar);
