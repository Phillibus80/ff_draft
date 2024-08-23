import xss from "xss";
import sql from "better-sqlite3";
const db = sql('stats.db');

export function getAllMessages() {
    try {
        return db.prepare(`
            SELECT *
            FROM messages
        `).all();

    } catch (e) {
        console.error('Error getting the messages. ', e.errorMessage);
    }
}

export function addMessage(message, author = 'Phillibus') {
    try {
        const cleanedMessage = xss(message);

        return db.prepare(`
            INSERT INTO messages
            VALUES (null, 0, @content, @author)
        `).run({content: cleanedMessage, author})

    } catch (e) {
        console.error('Error adding the new message. ', e.errorMessage);
    }
}