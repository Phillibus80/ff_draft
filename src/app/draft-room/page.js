import styles from "./page.module.scss";
import RosterContainer from "@/components/roster/rosterContainer.jsx";
import DraftRoomContext from "@/context/draft-room-context/draft-room-context.jsx";
import DraftTracker from "@/components/draft-tracker/draft-tracker.jsx";
import PlayerList from "@/components/player-list/player-list.jsx";
import ChatContainer from "@/components/chat/chat-container.jsx";
import {SessionProvider} from "next-auth/react";

export default function DraftRoom() {
    return (
        <main className={styles.main}>
            <SessionProvider>
                <DraftRoomContext>
                    <DraftTracker/>
                </DraftRoomContext>

                <RosterContainer/>

                <DraftRoomContext>
                    <PlayerList/>
                    <ChatContainer/>
                </DraftRoomContext>
            </SessionProvider>
        </main>
    );
}
