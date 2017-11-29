// @flow

import { equals, set, ReducerRegistry } from '../redux';

import { SET_CALL_OVERLAY_VISIBLE, SET_JWT } from './actionTypes';

/**
 * The initial redux state of the feature jwt.
 *
 * @private
 * @type {{
 *     callOverlayVisible: ?boolean
 *     isGuest: boolean
 * }}
 */
const _INITIAL_STATE = {
    /**
     * The indicator which determines whether (the) {@code CallOverlay} is
     * visible.
     *
     * @type {boolean|undefined}
     */
    callOverlayVisible: undefined,

    /**
     * The indicator which determines whether the local participant is a guest
     * in the conference.
     *
     * @type {boolean}
     */
    isGuest: true
};

/**
 * Reduces redux actions which affect the JSON Web Token (JWT) stored in the
 * redux store.
 *
 * @param {Object} state - The current redux state.
 * @param {Object} action - The redux action to reduce.
 * @returns {Object} The next redux state which is the result of reducing the
 * specified {@code action}.
 */
ReducerRegistry.register(
    'features/base/jwt',
    (state = _INITIAL_STATE, action) => {
        switch (action.type) {
        case SET_CALL_OVERLAY_VISIBLE:
            return set(state, 'callOverlayVisible', action.callOverlayVisible);

        case SET_JWT: {
            // eslint-disable-next-line no-unused-vars
            const { type, ...payload } = action;
            const nextState = {
                ..._INITIAL_STATE,
                ...payload
            };

            return equals(state, nextState) ? state : nextState;
        }
        }

        return state;
    });
