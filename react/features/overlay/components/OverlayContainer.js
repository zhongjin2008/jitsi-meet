/* global interfaceConfig */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { CallOverlay } from '../../base/jwt';

import PageReloadFilmstripOnlyOverlay from './PageReloadFilmstripOnlyOverlay';
import PageReloadOverlay from './PageReloadOverlay';
import SuspendedFilmstripOnlyOverlay from './SuspendedFilmstripOnlyOverlay';
import SuspendedOverlay from './SuspendedOverlay';
import UserMediaPermissionsFilmstripOnlyOverlay
    from './UserMediaPermissionsFilmstripOnlyOverlay';
import UserMediaPermissionsOverlay from './UserMediaPermissionsOverlay';

/**
 * The lazily-initialized list of overlay React {@link Component} types used The
 * user interface is filmstrip-only.
 *
 * XXX The value is meant to be compile-time defined so it does not contradict
 * our coding style to not have global values that are runtime defined and
 * merely works around side effects of circular imports.
 *
 * @type Array
 */
let _filmstripOnlyOverlays;

/**
 * The lazily-initialized list of overlay React {@link Component} types used The
 * user interface is not filmstrip-only.
 *
 * XXX The value is meant to be compile-time defined so it does not contradict
 * our coding style to not have global values that are runtime defined and
 * merely works around side effects of circular imports.
 *
 * @type Array
 */
let _nonFilmstripOnlyOverlays;

/**
 * Implements a React {@link Component} that will display the correct overlay
 * when needed.
 */
class OverlayContainer extends Component {
    /**
     * OverlayContainer component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * Type of overlay that should be rendered.
         */
        overlay: PropTypes.element
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @public
     * @returns {ReactElement|null}
     */
    render() {
        const { overlay } = this.props;

        return overlay ? React.createElement(overlay, {}) : null;
    }
}

/**
 * Returns the list of overlay React {@link Component} types to be rendered by
 * {@code OverlayContainer}. The list is lazily initialized the first time it is
 * required in order to works around side effects of circular imports.
 *
 * @param {boolean} filmstripOnly - The indicator which determines whether the
 * user interface is filmstrip-only.
 * @returns {Array} The list of overlay React {@code Component} types to be
 * rendered by {@code OverlayContainer}.
 */
function _getOverlays(filmstripOnly) {
    let overlays;

    if (filmstripOnly) {
        if (!(overlays = _filmstripOnlyOverlays)) {
            overlays = _filmstripOnlyOverlays = [
                PageReloadFilmstripOnlyOverlay,
                SuspendedFilmstripOnlyOverlay,
                UserMediaPermissionsFilmstripOnlyOverlay
            ];
        }
    } else if (!(overlays = _nonFilmstripOnlyOverlays)) {
        overlays = _nonFilmstripOnlyOverlays = [
            PageReloadOverlay,
            SuspendedOverlay,
            UserMediaPermissionsOverlay,
            CallOverlay
        ];
    }

    return overlays;
}

/**
 * Maps (parts of) the redux state to the associated {@code OverlayContainer}'s
 * props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     overlay: ?Object
 * }}
 */
function _mapStateToProps(state) {
    // XXX In the future interfaceConfig is expected to not be a global variable
    // but a redux state like config. Hence, the variable filmStripOnly
    // naturally belongs here in preparation for the future.
    const filmstripOnly
        = typeof interfaceConfig === 'object' && interfaceConfig.filmStripOnly;
    let overlay;

    for (const o of _getOverlays(filmstripOnly)) {
        // react-i18n / react-redux wrap components and thus we cannot access
        // the wrapped component's static methods directly.
        const component = o.WrappedComponent || o;

        if (component.needsRender(state)) {
            overlay = o;
            break;
        }
    }

    return {
        /**
         * The React {@link Component} type of overlay to be rendered by the
         * associated {@code OverlayContainer}.
         */
        overlay
    };
}

export default connect(_mapStateToProps)(OverlayContainer);
