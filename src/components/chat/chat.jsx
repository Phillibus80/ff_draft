"use client";

import {io} from 'socket.io-client';
import {useRef, useState} from "react";

const Chat = () => {
    const inputRef = useRef();
    const socket = io();
    const [currentMessages, setCurrentMessages] = useState([]);
    const updateCurrentMessages = message => setCurrentMessages(messages => [...messages, message]);

    socket.on('Welcome', () => console.log('Welcomed the fuck'))

    const handleSubmit = event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {
            socket.emit('chat message', {
                message: message,
                author: 'Phillibus'
            });

            updateCurrentMessages(message);
            inputRef.current.value = '';
        }
    };

    return (
        <>
            <ul id="messages">
                {
                    currentMessages.map(message => <li key={message}>
                        {message}
                    </li>)
                }
            </ul>
            <form id='form' onSubmit={handleSubmit} action=''>
                <input ref={inputRef} autoComplete='off'/>
                <button>Send</button>
            </form>
        </>
    );
};

export default Chat;