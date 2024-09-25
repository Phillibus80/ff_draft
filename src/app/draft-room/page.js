import styles from "./page.module.scss";
import DraftRoomContext from "@/context/draft-room-context/draft-room-context.jsx";
import DraftTracker from "@/components/draft-tracker/draft-tracker.jsx";
import PlayerList from "@/components/player-list/player-list.jsx";
import ChatContainer from "@/components/chat/chat-container.jsx";
import {SessionProvider} from "next-auth/react";
import Roster from "@/components/roster/roster.jsx";

export default function DraftRoom() {
    return (
        <main className={styles.main}>
            <SessionProvider>
                <DraftRoomContext>
                    <DraftTracker/>
                    <Roster/>
                    <PlayerList/>
                    <ChatContainer/>
                </DraftRoomContext>
            </SessionProvider>
        </main>
    );
}
