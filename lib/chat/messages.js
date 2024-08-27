import {onValue, ref, set, query, orderByKey, endAt, limitToLast} from "firebase/database";
import {database as db} from "../firebaseConfig.js";
import {PAGINATION_SIZE} from "../../app-constants.js";

export function getAllMessages(updateMessageState, lastKey, updateLastKey) {
    const messageRef = ref(db, `/messages`);
    const messageQuery = lastKey
        ? query(messageRef, orderByKey(), endAt(lastKey), limitToLast(PAGINATION_SIZE + 1))
        : query(messageRef, orderByKey(), limitToLast(PAGINATION_SIZE));

    try {
        onValue(messageQuery, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                if (data) {
                    // Extract keys and data
                    const entries = Object.entries(data); // Array of [key, value] pairs
                    const keys = entries.map(entry => entry[0]); // Extract keys
                    const transformedData = entries.map(entry => entry[1]); // Extract values

                    if (lastKey) {
                        // Remove the duplicate last key entry
                        transformedData.pop();
                        keys.pop();
                    }

                    // Update the state with messages
                    updateMessageState(transformedData);

                    // Update the last key
                    updateLastKey(keys[0]); // First key in the array is the new lastKey
                }
            }
        }, {
            onlyOnce: true
        });
    } catch (e) {
        console.error('Issue getting messages from the database.', e);
    }
}

export async function addMessage(message, author = 'Phillibus') {
    const timeStamp = new Date().valueOf();
    const newMessageRef = ref(db, `/messages/${timeStamp}`);
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