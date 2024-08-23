import {createServer} from "node:http";
import next from "next";
import {Server} from "socket.io";
import {socketConstants} from "./constants/app-constants.mjs";
import {addMessage, getAllMessages} from "./lib/chat/messages.mjs";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on(socketConstants.CONNECTION, (socket) => {
        const currentMessages = getAllMessages();

        // Join a specific room
        socket.on(socketConstants.JOIN_ROOM, ({room}) => {
            socket.join(room);

            // Emit a welcome message to just the client in the room
            socket.emit(socketConstants.WELCOME_MESSAGE, {
                greeting: `Welcome User -> ${socket.id} to room:: ${room}`,
                messages: currentMessages
            });

            // Broadcast to everyone in the room except the sender
            socket.to(room).emit(socketConstants.NEW_USER_JOINED, {message: `${socket.id} has joined the room`});
        });

        // Handle a message sent to a specific room
        // socket.on(socketConstants.SEND_ROOM_MESSAGE, ({room: {room}, message}) => {
        //     io.to(room).emit(socketConstants.MESSAGE, {messageToSend: `${socket.id}: ${message}`});
        // });

        // Leave a room
        // socket.on(socketConstants.LEAVE_ROOM, ({room}) => {
        //     socket.leave(room);
        //     console.log(`User ${socket.id} left room: ${room}`);
        //     socket.to(room).emit(socketConstants.MESSAGE, `${socket.id} has left the room`);
        // });

        // Adding a new message
        socket.on(socketConstants.ADD_MESSAGE, ({message, author}) => {
            addMessage(message, author);
            io.emit(socketConstants.NEW_MESSAGE_RECEIVED, {
                addedMessage: {
                    content: message,
                    author
                }
            });
        });

        // Disconnecting
        socket.on(socketConstants.DISCONNECT, () => {
            console.log(`User disconnected: ${socket.id}`);
        });

        socket.on(socketConstants.END, () => {
            socket.disconnect();
        });
    });

    httpServer
        .once(socketConstants.ERROR, (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});