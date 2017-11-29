/* @flow */

import { MiddlewareRegistry } from '../base/redux';
import { SET_CALL_OVERLAY_VISIBLE } from '../base/jwt';

import Filmstrip from '../../../modules/UI/videolayout/Filmstrip';

declare var APP: Object;

// eslint-disable-next-line no-unused-vars
MiddlewareRegistry.register(({ getState }) => next => action => {
    switch (action.type) {
    case SET_CALL_OVERLAY_VISIBLE:
        if (typeof APP !== 'undefined') {
            const oldValue
                = Boolean(getState()['features/base/jwt'].callOverlayVisible);
            const result = next(action);
            const newValue
                = Boolean(getState()['features/base/jwt'].callOverlayVisible);

            oldValue === newValue

                // FIXME The following accesses the private state filmstrip of
                // Filmstrip. It is written with the understanding that
                // Filmstrip will be rewritten in React and, consequently, will
                // not need the middleware implemented here, Filmstrip.init, and
                // UI.start.
                || (Filmstrip.filmstrip
                    && Filmstrip.toggleFilmstrip(!newValue, false));

            return result;
        }
        break;
    }

    return next(action);
});
