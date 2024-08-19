"use client";

import {io} from 'socket.io-client';
import {useRef} from "react";

const Chat = () => {
    const inputRef = useRef();
    const socket = io();

    socket.on('Welcome', () => console.log('Welcomed the fuck'))

    const handleSubmit = async event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {
            socket.emit('chat message', {
                message: message,
                author: 'Phillibus'
            });

            inputRef.current.value = '';
        }
    };

    return (
        <>
            <ul id="messages">
                {/*{*/}
                {/*    currentMessages.map(message => <li key={message}>*/}
                {/*        {message}*/}
                {/*    </li>)*/}
                {/*}*/}
            </ul>
            <form id='form' onSubmit={handleSubmit} action=''>
                <input ref={inputRef} autoComplete='off'/>
                <button>Send</button>
            </form>
        </>
    );
};

export default Chat;