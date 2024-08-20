"use client";

import {useEffect, useState} from "react";
import socket from "@/components/socket/socket";

const ChatWindow = () => {
    const [currentMessages, setCurrentMessages] = useState([]);

    useEffect(() => {
        socket.on('Welcome', ({messages}) => {
            console.log('Messages:: ', messages)
            setCurrentMessages(messages);
        });

        socket.on('message response', ({message}) => {
            console.log('Messages:: ', message)
            setCurrentMessages(messages => [...messages, message]);
        });

        return () => {
            socket.off('Welcome');
            socket.off('message response');
        };
    }, []);

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