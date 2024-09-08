"use client";

import {useEffect, useState} from "react";
import {getAllMessages} from "../../../lib/chat/messages.js";
import ChatWindow from "@/components/chat/chat-window.jsx";
import ChatInput from "@/components/chat/chat-input.jsx";
import {useSession} from "next-auth/react";

const ChatContainer = () => {
    const [currentMessages, setCurrentMessages] = useState([]);
    const {data: session, status} = useSession();

    // Used for pagination
    const [lastKey, setLastKey] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            // TODO make this dynamic
            const currentLeague = 'da_league';
            const sessionLeague = !!session?.user?.leagues[currentLeague]
                ? currentLeague
                : '';

            console.log('Here', sessionLeague);
            getAllMessages(sessionLeague, setCurrentMessages, lastKey, setLastKey);
        }

    }, [status]);

    return (
        <>
            <ChatWindow messages={currentMessages}/>
            <ChatInput/>
        </>
    );
}

export default ChatContainer;