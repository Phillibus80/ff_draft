"use client";

import {useEffect, useRef, useState} from "react";
import ChatWindow from "@/components/chat/chat-window";
import socket from "@/components/socket/socket";
import {debounce, dedupMessages} from "@/util/utils";
import {socketConstants, TEST_SOCKET_ROOM} from "../../../constants/app-constants.mjs";

const Chat = () => {
    const inputRef = useRef();
    const [currentMessages, setCurrentMessages] = useState([]);

    useEffect(() => {
        // Joining the room
        socket.emit(socketConstants.JOIN_ROOM, {
            room: TEST_SOCKET_ROOM
        });

        socket.on(socketConstants.WELCOME_MESSAGE, ({greeting, messages}) => {
            setCurrentMessages(prevMessages => (messages.length === 0)
                ? dedupMessages(prevMessages, greeting)
                : dedupMessages(messages, greeting));
        });

        socket.on(socketConstants.NEW_USER_JOINED, ({message}) =>
            setCurrentMessages(
                pastMessages => dedupMessages(pastMessages, message))
        );

        // Response from adding a message
        socket.on(socketConstants.NEW_MESSAGE_RECEIVED, ({addedMessage}) =>
            setCurrentMessages(messages => [...messages, addedMessage]));

        return () => {
            // socket.emit("leave room", {
            //     room: TEST_SOCKET_ROOM
            // });
            socket.off(socketConstants.JOIN_ROOM);
            socket.off(socketConstants.WELCOME_MESSAGE);
            socket.off(socketConstants.NEW_USER_JOINED);
            socket.off(socketConstants.NEW_MESSAGE_RECEIVED);
        };
    }, []);

    // TODO implement the author
    const debouncedSubmit = debounce((message, author = 'Phillibus') => {
        socket.emit(socketConstants.ADD_MESSAGE, {
            message: message,
            author: author
        });
    }, 300);

    const handleSubmit = async event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {
            // Send the signal to update the database
            debouncedSubmit(message);

            // Reset the field
            inputRef.current.value = '';
        }
    };

    return (
        <>
            <ChatWindow messages={currentMessages}/>
            <form id='form' onSubmit={handleSubmit} action=''>
                <input ref={inputRef} autoComplete='off'/>
                <button>Send</button>
            </form>
        </>
    );
};

export default Chat;