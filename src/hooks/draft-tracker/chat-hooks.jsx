import {useEffect} from "react";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {getLeagueFromSession} from "../../../lib/util/utils.js";
import {getAllMessages} from "../../../lib/chat/messages.js";

/**
 * A GETTER hooks used to get all the league's chat messages and establish a connection
 * to the database for any live update.
 *
 * @param {DraftSession} session - the returned session cookie from the server.
 * @param {SessionAuthStatus} status - authentication status of the session cookie.
 * @param {function} setMessageCallback - a setState function for holding all messages.
 * @param {string} lastKey - the last key of message for this page.
 * @param {function} setKeyCallback - a setState function for the last key used in pagination.
 */
export const useGetAllMessages = (session, status, setMessageCallback, lastKey, setKeyCallback) => {
    useEffect(() => {
        let unsubscribe;

        switch (status) {
            case SESSION_CONSTANTS.AUTHENTICATED:
                const sessionLeague = getLeagueFromSession(session, status);
                unsubscribe = getAllMessages(sessionLeague, setMessageCallback, lastKey, setKeyCallback);

                break;
        }

        return () => unsubscribe && unsubscribe();

    }, [status]);
}