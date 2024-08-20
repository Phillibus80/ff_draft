import {createServer} from "node:http";
import next from "next";
import {Server} from "socket.io";
import sql from "better-sqlite3";
import xss from "xss";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();

const db = sql('stats.db');

function getAllMessages() {
    try {
        return db.prepare(`
            SELECT *
            FROM messages
        `).all();

    } catch (e) {
        console.error('Error getting the messages. ', e.errorMessage);
    }
}

function addMessage(message) {
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

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        const currentMessages = getAllMessages();
        socket.emit('Welcome', {
            greeting: 'Welcome Fucking Fucker',
            messages: currentMessages
        });

        socket.on('add message', ({message, author}) => {
            console.log('Payload:: ', message, author);
            addMessage(message);
            io.emit('message response', {
                addedMessage: {
                    content: message
                }
            });
        });

        socket.on('end', () => {
            socket.disconnect();
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});