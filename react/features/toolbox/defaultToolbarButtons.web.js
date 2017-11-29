// @flow

import React from 'react';

import { sendAnalyticsEvent } from '../analytics';
import { ParticipantCounter } from '../contact-list';
import { openDeviceSelectionDialog } from '../device-selection';
import { InfoDialogButton, openInviteDialog } from '../invite';
import UIEvents from '../../../service/UI/UIEvents';
import { VideoQualityButton } from '../video-quality';

import ProfileButton from './components/ProfileButton';

declare var APP: Object;
declare var interfaceConfig: Object;

/**
 * The cache of {@link getDefaultButtons()}.
 */
let defaultButtons: Object;

/**
 * Returns a map of all button descriptors and according properties.
 *
 * @returns {Object} - The maps of default button descriptors.
 */
export default function getDefaultButtons() {
    if (defaultButtons) {
        return defaultButtons;
    }

    defaultButtons = {
        /**
         * The descriptor of the camera toolbar button.
         */
        camera: {
            classNames: [ 'button', 'icon-camera' ],
            enabled: true,
            isDisplayed: () => true,
            id: 'toolbar_button_camera',
            onClick() {
                const newVideoMutedState = !APP.conference.isLocalVideoMuted();

                if (newVideoMutedState) {
                    sendAnalyticsEvent('toolbar.video.enabled');
                } else {
                    sendAnalyticsEvent('toolbar.video.disabled');
                }
                APP.UI.emitEvent(UIEvents.VIDEO_MUTED, newVideoMutedState);
            },
            popups: [
                {
                    dataAttr: 'audioOnly.featureToggleDisabled',
                    dataInterpolate: { feature: 'video mute' },
                    id: 'unmuteWhileAudioOnly'
                }
            ],
            shortcut: 'V',
            shortcutAttr: 'toggleVideoPopover',
            shortcutFunc() {
                if (APP.conference.isAudioOnly()) {
                    APP.UI.emitEvent(UIEvents.VIDEO_UNMUTING_WHILE_AUDIO_ONLY);

                    return;
                }

                sendAnalyticsEvent('shortcut.videomute.toggled');
                APP.conference.toggleVideoMuted();
            },
            shortcutDescription: 'keyboardShortcuts.videoMute',
            tooltipKey: 'toolbar.videomute'
        },

        /**
         * The descriptor of the chat toolbar button.
         */
        chat: {
            classNames: [ 'button', 'icon-chat' ],
            enabled: true,
            html: <span className = 'badge-round'>
                <span id = 'unreadMessages' /></span>,
            id: 'toolbar_button_chat',
            onClick() {
                sendAnalyticsEvent('toolbar.chat.toggled');
                APP.UI.emitEvent(UIEvents.TOGGLE_CHAT);
            },
            shortcut: 'C',
            shortcutAttr: 'toggleChatPopover',
            shortcutFunc() {
                sendAnalyticsEvent('shortcut.chat.toggled');
                APP.UI.toggleChat();
            },
            shortcutDescription: 'keyboardShortcuts.toggleChat',
            sideContainerId: 'chat_container',
            tooltipKey: 'toolbar.chat'
        },

        /**
         * The descriptor of the contact list toolbar button.
         */
        contacts: {
            childComponent: ParticipantCounter,
            classNames: [ 'button', 'icon-contactList' ],
            enabled: true,
            id: 'toolbar_contact_list',
            onClick() {
                sendAnalyticsEvent(
                    'toolbar.contacts.toggled');
                APP.UI.emitEvent(UIEvents.TOGGLE_CONTACT_LIST);
            },
            sideContainerId: 'contacts_container',
            tooltipKey: 'bottomtoolbar.contactlist'
        },

        /**
         * The descriptor of the desktop sharing toolbar button.
         */
        desktop: {
            classNames: [ 'button', 'icon-share-desktop' ],
            enabled: true,
            id: 'toolbar_button_desktopsharing',
            onClick() {
                if (APP.conference.isSharingScreen) {
                    sendAnalyticsEvent('toolbar.screen.disabled');
                } else {
                    sendAnalyticsEvent('toolbar.screen.enabled');
                }
                APP.UI.emitEvent(UIEvents.TOGGLE_SCREENSHARING);
            },
            popups: [
                {
                    dataAttr: 'audioOnly.featureToggleDisabled',
                    dataInterpolate: { feature: 'screen sharing' },
                    id: 'screenshareWhileAudioOnly'
                }
            ],
            shortcut: 'D',
            shortcutAttr: 'toggleDesktopSharingPopover',
            shortcutFunc() {
                sendAnalyticsEvent('shortcut.screen.toggled');

                // eslint-disable-next-line no-empty-function
                APP.conference.toggleScreenSharing().catch(() => {});
            },
            shortcutDescription: 'keyboardShortcuts.toggleScreensharing',
            tooltipKey: 'toolbar.sharescreen'
        },

        /**
         * The descriptor of the device selection toolbar button.
         */
        fodeviceselection: {
            classNames: [ 'button', 'icon-settings' ],
            enabled: true,
            isDisplayed() {
                return interfaceConfig.filmStripOnly;
            },
            id: 'toolbar_button_fodeviceselection',
            onClick(dispatch: Function) {
                sendAnalyticsEvent(
                    'toolbar.fodeviceselection.toggled');

                dispatch(openDeviceSelectionDialog());
            },
            sideContainerId: 'settings_container',
            tooltipKey: 'toolbar.Settings'
        },

        /**
         * The descriptor of the dialpad toolbar button.
         */
        dialpad: {
            classNames: [ 'button', 'icon-dialpad' ],
            enabled: true,

            // TODO: remove it after UI.updateDTMFSupport fix
            hidden: true,
            id: 'toolbar_button_dialpad',
            onClick() {
                sendAnalyticsEvent('toolbar.sip.dialpad.clicked');
            },
            tooltipKey: 'toolbar.dialpad'
        },

        /**
         * The descriptor of the etherpad toolbar button.
         */
        etherpad: {
            classNames: [ 'button', 'icon-share-doc' ],
            enabled: true,
            hidden: true,
            id: 'toolbar_button_etherpad',
            onClick() {
                sendAnalyticsEvent('toolbar.etherpad.clicked');
                APP.UI.emitEvent(UIEvents.ETHERPAD_CLICKED);
            },
            tooltipKey: 'toolbar.etherpad'
        },

        /**
         * The descriptor of the toolbar button which toggles full-screen mode.
         */
        fullscreen: {
            classNames: [ 'button', 'icon-full-screen' ],
            enabled: true,
            id: 'toolbar_button_fullScreen',
            onClick() {
                sendAnalyticsEvent('toolbar.fullscreen.enabled');

                APP.UI.emitEvent(UIEvents.TOGGLE_FULLSCREEN);
            },
            shortcut: 'S',
            shortcutAttr: 'toggleFullscreenPopover',
            shortcutDescription: 'keyboardShortcuts.fullScreen',
            shortcutFunc() {
                sendAnalyticsEvent('shortcut.fullscreen.toggled');
                APP.UI.toggleFullScreen();
            },
            tooltipKey: 'toolbar.fullscreen'
        },

        /**
         * The descriptor of the toolbar button which hangs up the
         * call/conference.
         */
        hangup: {
            classNames: [ 'button', 'icon-hangup', 'button_hangup' ],
            enabled: true,
            isDisplayed: () => true,
            id: 'toolbar_button_hangup',
            onClick() {
                sendAnalyticsEvent('toolbar.hangup');
                APP.UI.emitEvent(UIEvents.HANGUP);
            },
            tooltipKey: 'toolbar.hangup'
        },

        /**
         * The descriptor of the toolbar button which opens a dialog for the
         * conference URL and inviting others.
         */
        info: {
            component: InfoDialogButton
        },

        /**
         * The descriptor of the toolbar button which shows the invite user
         * dialog.
         */
        invite: {
            classNames: [ 'button', 'icon-link' ],
            enabled: true,
            id: 'toolbar_button_link',
            onClick(dispatch: Function) {
                sendAnalyticsEvent('toolbar.invite.clicked');

                dispatch(openInviteDialog());
            },
            tooltipKey: 'toolbar.invite'
        },

        /**
         * The descriptor of the microphone toolbar button.
         */
        microphone: {
            classNames: [ 'button', 'icon-microphone' ],
            enabled: true,
            isDisplayed: () => true,
            id: 'toolbar_button_mute',
            onClick() {
                const sharedVideoManager = APP.UI.getSharedVideoManager();

                if (APP.conference.isLocalAudioMuted()) {
                    // If there's a shared video with the volume "on" and we
                    // aren't the video owner, we warn the user
                    // that currently it's not possible to unmute.
                    if (sharedVideoManager
                        && sharedVideoManager.isSharedVideoVolumeOn()
                        && !sharedVideoManager.isSharedVideoOwner()) {
                        APP.UI.showCustomToolbarPopup(
                            'microphone', 'unableToUnmutePopup', true, 5000);
                    } else {
                        sendAnalyticsEvent('toolbar.audio.unmuted');
                        APP.UI.emitEvent(UIEvents.AUDIO_MUTED, false, true);
                    }
                } else {
                    sendAnalyticsEvent('toolbar.audio.muted');
                    APP.UI.emitEvent(UIEvents.AUDIO_MUTED, true, true);
                }
            },
            popups: [
                {
                    dataAttr: 'toolbar.micMutedPopup',
                    id: 'micMutedPopup'
                },
                {
                    dataAttr: 'toolbar.unableToUnmutePopup',
                    id: 'unableToUnmutePopup'
                },
                {
                    dataAttr: 'toolbar.talkWhileMutedPopup',
                    id: 'talkWhileMutedPopup'
                }
            ],
            shortcut: 'M',
            shortcutAttr: 'mutePopover',
            shortcutFunc() {
                sendAnalyticsEvent('shortcut.audiomute.toggled');
                APP.conference.toggleAudioMuted();
            },
            shortcutDescription: 'keyboardShortcuts.mute',
            tooltipKey: 'toolbar.mute'
        },

        /**
         * The descriptor of the profile toolbar button.
         */
        profile: {
            component: ProfileButton,
            sideContainerId: 'profile_container'
        },

        /**
         * The descriptor of the "Raise hand" toolbar button.
         */
        raisehand: {
            classNames: [ 'button', 'icon-raised-hand' ],
            enabled: true,
            id: 'toolbar_button_raisehand',
            onClick() {
                sendAnalyticsEvent('toolbar.raiseHand.clicked');
                APP.conference.maybeToggleRaisedHand();
            },
            shortcut: 'R',
            shortcutAttr: 'raiseHandPopover',
            shortcutDescription: 'keyboardShortcuts.raiseHand',
            shortcutFunc() {
                sendAnalyticsEvent('shortcut.raisehand.clicked');
                APP.conference.maybeToggleRaisedHand();
            },
            tooltipKey: 'toolbar.raiseHand'
        },

        /**
         * The descriptor of the recording toolbar button. Requires additional
         * initialization in the recording module.
         */
        recording: {
            classNames: [ 'button' ],
            enabled: true,

            // will be displayed once the recording functionality is detected
            hidden: true,
            id: 'toolbar_button_record',
            tooltipKey: 'liveStreaming.buttonTooltip'
        },

        /**
         * The descriptor of the settings toolbar button.
         */
        settings: {
            classNames: [ 'button', 'icon-settings' ],
            enabled: true,
            id: 'toolbar_button_settings',
            onClick() {
                sendAnalyticsEvent('toolbar.settings.toggled');
                APP.UI.emitEvent(UIEvents.TOGGLE_SETTINGS);
            },
            sideContainerId: 'settings_container',
            tooltipKey: 'toolbar.Settings'
        },

        /**
         * The descriptor of the "Share YouTube video" toolbar button.
         */
        sharedvideo: {
            classNames: [ 'button', 'icon-shared-video' ],
            enabled: true,
            id: 'toolbar_button_sharedvideo',
            onClick() {
                sendAnalyticsEvent('toolbar.sharedvideo.clicked');
                APP.UI.emitEvent(UIEvents.SHARED_VIDEO_CLICKED);
            },
            popups: [
                {
                    dataAttr: 'toolbar.sharedVideoMutedPopup',
                    id: 'sharedVideoMutedPopup'
                }
            ],
            tooltipKey: 'toolbar.sharedvideo'
        },

        videoquality: {
            component: VideoQualityButton
        }
    };

    Object.keys(defaultButtons).forEach(name => {
        const button = defaultButtons[name];

        if (!button.isDisplayed) {
            button.isDisplayed = _isDisplayed;
        }
    });

    return defaultButtons;
}

/**
 * The default implementation of the {@code isDisplayed} method of the toolbar
 * button definition returned by {@link getDefaultButtons()}.
 *
 * @returns {boolean} If the user intarface is full i.e. not filmstrip-only,
 * then {@code true}; otherwise, {@code false}.
 */
function _isDisplayed() {
    return !interfaceConfig.filmStripOnly;
}
