"use client";

import {useEffect, useState} from "react";
import socket from "@/components/socket/socket";

const ChatWindow = () => {
    const [currentMessages, setCurrentMessages] = useState([]);

    useEffect(() => {
        socket.on('message response', ({addedMessage}) => {
            console.log('Added Message:: ', addedMessage)
            setCurrentMessages(messages => [...messages, addedMessage]);
        });

        return () => {
            socket.off('message response');
        };
    }, []);

    return <ul id="messages">
        {
            currentMessages.length > 0
            && currentMessages?.map(
                (message, index) => {
                    console.log(message);
                    return <li key={`${message.content}_${index}`}>
                        {message.content}
                    </li>
                }
            )
        }
    </ul>
}

export default ChatWindow;