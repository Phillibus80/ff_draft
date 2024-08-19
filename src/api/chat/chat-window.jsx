"use client";

import {io} from 'socket.io-client';
import {useState} from "react";

const ChatWindow = () => {
    const [currentMessages, setCurrentMessages] = useState([]);
    const socket = io();

    socket.on('Welcome', ({messages}) => {
        console.log('Messages:: ', messages)
        setCurrentMessages(messages);
    });

    socket.on('message response', ({messages}) => {
        console.log('Messages:: ', messages)
        setCurrentMessages(messages);
    });

    return <ul id="messages">
        {
            currentMessages.length > 0
            && currentMessages?.map(
                (message, index) => <li key={`${message.content}_${index}`}>
                    {message.content}
                </li>)
        }
    </ul>
};

export default ChatWindow;