"use client";

import {useEffect, useRef, useState} from "react";
import ChatWindow from "@/components/chat/chat-window";
import socket from "@/components/socket/socket";
import {debounce} from "@/util/utils";

const Chat = () => {
    const inputRef = useRef();
    const [currentMessages, setCurrentMessages] = useState([]);

    const dedupMessages = (messages = [], messageToAdd = '') => messageToAdd
        ? [...new Set(
            [...messages,
                {content: messageToAdd}]
                .map(({content}) => content)
        )].map(txt => ({content: txt}))
        : [];

    useEffect(() => {
        // Joining the room
        socket.emit('join room', {
            room: 'Draft room'
        });

        socket.on('welcome message', ({message: greeting, messages}) => {
            setCurrentMessages(prevMessages => (messages.length === 0)
                ? dedupMessages(prevMessages, greeting)
                : dedupMessages(messages, greeting));
        });

        socket.on("room message", ({messageToSend}) =>
            setCurrentMessages(messages => dedupMessages(messages, messageToSend))
        );

        // Response from adding a message
        socket.on('message response', ({addedMessage}) =>
            setCurrentMessages(messages => [...messages, addedMessage]));

        return () => {
            // socket.emit("leave room", {
            //     room: 'Draft room'
            // });
            socket.off('join room');
            socket.off('welcome message');
            socket.off('message');
            socket.off('message response');
        };
    }, []);

    const debouncedSubmit = debounce(message => {
        socket.emit('add message', {
            message: message,
            author: 'Phillibus'
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