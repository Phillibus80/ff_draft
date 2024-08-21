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

        // Join a specific room
        socket.on("join room", ({room}) => {
            socket.join(room);

            // Emit a welcome message to just the client in the room
            socket.emit("welcome message", {
                message: `Welcome User -> ${socket.id} to room:: ${room}`,
                messages: currentMessages
            });

            // Broadcast to everyone in the room except the sender
            socket.to(room).emit("room message", {messageToSend: `${socket.id} has joined the room`});
        });

        // Handle a message sent to a specific room
        // socket.on("send message", ({room: {room}, message}) => {
        //     io.to(room).emit("message", {messageToSend: `${socket.id}: ${message}`});
        // });

        // Leave a room
        // socket.on("leave room", ({room}) => {
        //     socket.leave(room);
        //     console.log(`User ${socket.id} left room: ${room}`);
        //     socket.to(room).emit("message", `${socket.id} has left the room`);
        // });

        // Adding a new message
        socket.on('add message', ({message, author}) => {
            addMessage(message);
            io.emit('message response', {
                addedMessage: {
                    content: message
                }
            });
        });

        // Disconnecting
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
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