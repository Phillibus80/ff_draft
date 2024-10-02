import {endAt, limitToLast, off, onValue, orderByKey, query, ref, set} from "firebase/database";
import {database as db} from "../firebaseConfig.js";
import {databaseRoutes, PAGINATION_SIZE} from "@/app-constants.js";

/**
 * A GETTER function that retrieves all the chat messages for a given league. Returns
 * a function that cuts the connection to the Realtime Database.
 *
 * @param {string} leagueName - the league name key.
 * @param {function} updateMessageState - a setState function for holding all messages.
 * @param {string} lastKey - the last key of message for this page.
 * @param {function} updateLastKey - a setState function for the last key used in pagination.
 * @return {function(): void} A clean up function that cuts the connection to the database.
 */
export function getAllMessages(leagueName, updateMessageState, lastKey, updateLastKey) {
    const messageRef = ref(db, `/${databaseRoutes.MESSAGES}/${leagueName}/`);
    const messageQuery = lastKey
        ? query(messageRef, orderByKey(), endAt(lastKey), limitToLast(PAGINATION_SIZE - 1))
        : query(messageRef, orderByKey(), limitToLast(PAGINATION_SIZE));

    try {
        onValue(messageQuery, snapshot => {

            if (snapshot.exists()) {
                const data = snapshot.val();

                if (data) {
                    const entries = Object.entries(data);
                    const keyArr = entries.map(([key]) => key);
                    const transformedData = entries
                        .filter(([key, value]) => key !== 'LEAGUE' && !!key && !!value)
                        .map(([, value]) => value);

                    if (lastKey) {
                        // Remove the duplicate last key entry
                        transformedData.pop();
                        keyArr.pop();
                    }

                    // Update the state with messages
                    updateMessageState(transformedData);

                    // Update the last key
                    updateLastKey(keyArr[0]);
                }
            }
        });

        return () => off(messageQuery, 'value');
    } catch (e) {
        console.error('Issue getting messages from the database.', e);
    }
}

/**
 * An ADD function that adds a new message to the league chat.
 *
 * @param {string} message - the actual message.
 * @param {string} author - the username of the person sending the message.
 * @param {string} leagueName - the league name key.
 * @return {Promise<void>} - a promise that, when successful, will resolve when the database has been updated.
 */
export async function addMessage(message, author, leagueName) {
    const timeStamp = new Date().valueOf();
    const newMessageRef = ref(db, `${databaseRoutes.MESSAGES}/${leagueName}/${timeStamp}`);
    const requestBody = ({
        "USERNAME": author,
        "MESSAGE": message,
        "TIMESTAMP": timeStamp
    });

    try {
        await set(newMessageRef, requestBody);
    } catch (e) {
        console.error('Issues trying to upload new message.')
    }
}