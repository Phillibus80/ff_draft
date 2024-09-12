"use client";

import {useEffect, useState} from "react";
import {getAllMessages} from "../../../lib/chat/messages.js";
import ChatWindow from "@/components/chat/chat-window.jsx";
import ChatInput from "@/components/chat/chat-input.jsx";
import {useSession} from "next-auth/react";
import {getLeagueFromSession} from "../../../lib/util/utils.js";
import {ROUTES} from "@/app-constants.js";
import {useRouter} from "next/navigation.js";

const ChatContainer = () => {
    const [currentMessages, setCurrentMessages] = useState([]);
    const {data: session, status} = useSession();

    // Used for pagination
    const [lastKey, setLastKey] = useState('');

    const router = useRouter();

    useEffect(() => {
        switch (status) {
            case 'authenticated':
                const sessionLeague = getLeagueFromSession(session, status);
                getAllMessages(sessionLeague, setCurrentMessages, lastKey, setLastKey);

                break;
            case 'unauthenticated':
                router.push(ROUTES.HOME);

                break;
        }

    }, [status]);

    return status === 'loading'
        ? <div>Loading...</div>
        : (<>
                <ChatWindow messages={currentMessages}/>
                <ChatInput/>
            </>
        );
}

export default ChatContainer;