import {onValue, ref, set} from "firebase/database";
import {database as db} from "../firebaseConfig.js";

export function getAllMessages(updateMessageState) {
    const messageRef = ref(db, `/messages`);

    try {
        onValue(messageRef, snapshot => {
            const data = snapshot.val();
            if (data) {
                const transformedData = Object.values(data);

                updateMessageState(transformedData);
            }
        });
    } catch (e) {
        console.error('Issue getting messages from the database.');
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