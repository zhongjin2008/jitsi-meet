/* @flow */

import UIEvents from '../../../../service/UI/UIEvents';

import {
    CONFERENCE_JOINED,
    CONFERENCE_LEFT
} from '../conference';
import { MiddlewareRegistry } from '../redux';

import { localParticipantIdChanged } from './actions';
import {
    KICK_PARTICIPANT,
    MUTE_REMOTE_PARTICIPANT,
    PARTICIPANT_DISPLAY_NAME_CHANGED
} from './actionTypes';
import { LOCAL_PARTICIPANT_DEFAULT_ID } from './constants';
import { getLocalParticipant } from './functions';

declare var APP: Object;

/**
 * Middleware that captures CONFERENCE_JOINED and CONFERENCE_LEFT actions and
 * updates respectively ID of local participant.
 *
 * @param {Store} store - Redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const { conference } = store.getState()['features/base/conference'];

    switch (action.type) {
    case CONFERENCE_JOINED:
        store.dispatch(localParticipantIdChanged(action.conference.myUserId()));
        break;

    case CONFERENCE_LEFT:
        store.dispatch(localParticipantIdChanged(LOCAL_PARTICIPANT_DEFAULT_ID));
        break;

    case KICK_PARTICIPANT:
        conference.kickParticipant(action.id);
        break;

    case MUTE_REMOTE_PARTICIPANT:
        conference.muteParticipant(action.id);
        break;

    // TODO Remove this middleware when the local display name update flow is
    // fully brought into redux.
    case PARTICIPANT_DISPLAY_NAME_CHANGED: {
        if (typeof APP !== 'undefined') {
            const participant = getLocalParticipant(store.getState());

            if (participant && participant.id === action.id) {
                APP.UI.emitEvent(UIEvents.NICKNAME_CHANGED, action.name);
            }
        }

        break;
    }
    }

    return next(action);
});
