"use client";

import {io} from 'socket.io-client';
import {useRef} from "react";
import ChatWindow from "@/api/chat/chat-window";

const Chat = () => {
    const inputRef = useRef();
    const socket = io();

    socket.on('Welcome',
        ({greeting, messages}) => {
            console.log(greeting, ' : ', messages)
        }
    )

    const handleSubmit = async event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {

            // Send the signal to update the database
            socket.emit('add message', {
                message: message,
                author: 'Phillibus'
            });


            // Reset the field
            inputRef.current.value = '';
        }
    };

    return (
        <>
            <ChatWindow />
            <form id='form' onSubmit={handleSubmit} action=''>
                <input ref={inputRef} autoComplete='off'/>
                <button>Send</button>
            </form>
        </>
    );
};

export default Chat;