"use client";

import {useEffect, useState} from "react";
import {getAllMessages} from "../../../lib/chat/messages.js";
import ChatWindow from "@/components/chat/chat-window.jsx";
import ChatInput from "@/components/chat/chat-input.jsx";
import {useSession} from "next-auth/react";
import {getLeagueFromSession} from "../../../lib/util/utils.js";

const ChatContainer = () => {
    const [currentMessages, setCurrentMessages] = useState([]);
    const {data: session, status} = useSession();

    // Used for pagination
    const [lastKey, setLastKey] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            const sessionLeague = getLeagueFromSession(session, status);

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