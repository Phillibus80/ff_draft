'use server';

import sql from "better-sqlite3";
import xss from "xss";

const db = sql('stats.db');

export const getAllMessages = async () => {
    try {

        return db.prepare(`
            SELECT *
            FROM messages
        `).all();

    } catch (e) {
        console.error('Error getting the messages. ', e.errorMessage);
    }
};

// TODO update the author name
export const addMessage = message => {
    console.log('Message:: ', message)
    try {
        const cleanedMessage = xss(message);
        console.log('Clean:: ', cleanedMessage)

        return db.prepare(`
            INSERT INTO messages
            VALUES (null, 0, @content, @author)
        `).run({content: cleanedMessage, author: 'Phillibus'})

    } catch (e) {
        console.error('Error adding the new message. ', e.errorMessage);
    }
}