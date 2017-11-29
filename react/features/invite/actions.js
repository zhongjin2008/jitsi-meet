// @flow

import { openDialog } from '../../features/base/dialog';

import {
    SET_INFO_DIALOG_VISIBILITY,
    UPDATE_DIAL_IN_NUMBERS_FAILED,
    UPDATE_DIAL_IN_NUMBERS_SUCCESS
} from './actionTypes';
import { InviteDialog } from './components';

declare var $: Function;

/**
 * Opens the Invite Dialog.
 *
 * @returns {Function}
 */
export function openInviteDialog() {
    return openDialog(InviteDialog);
}

/**
 * Opens the inline conference info dialog.
 *
 * @param {boolean} visible - Whether or not the dialog should be displayed.
 * @param {boolean} autoClose - Whether or not the dialog should automatically
 * close after a set period of time.
 * @returns {{
 *     type: SET_INFO_DIALOG_VISIBILITY,
 *     autoClose: boolean,
 *     visible: boolean
 * }}
 */
export function setInfoDialogVisibility(
        visible: boolean,
        autoClose: boolean = false) {
    return {
        type: SET_INFO_DIALOG_VISIBILITY,
        autoClose,
        visible
    };
}

/**
 * Sends AJAX requests for dial-in numbers and conference ID.
 *
 * @returns {Function}
 */
export function updateDialInNumbers() {
    return (dispatch: Dispatch<*>, getState: Function) => {
        const state = getState();
        const { dialInConfCodeUrl, dialInNumbersUrl, hosts }
            = state['features/base/config'];
        const mucURL = hosts && hosts.muc;

        if (!dialInConfCodeUrl || !dialInNumbersUrl || !mucURL) {
            // URLs for fetching dial in numbers not defined
            return;
        }

        const { room } = state['features/base/conference'];
        const conferenceIDURL
            = `${dialInConfCodeUrl}?conference=${room}@${mucURL}`;

        Promise.all([
            $.getJSON(dialInNumbersUrl),
            $.getJSON(conferenceIDURL)
        ])
            .then(([ dialInNumbers, { conference, id, message } ]) => {
                if (!conference || !id) {
                    return Promise.reject(message);
                }

                dispatch({
                    type: UPDATE_DIAL_IN_NUMBERS_SUCCESS,
                    conferenceID: id,
                    dialInNumbers
                });
            })
            .catch(error => {
                dispatch({
                    type: UPDATE_DIAL_IN_NUMBERS_FAILED,
                    error
                });
            });
    };
}
