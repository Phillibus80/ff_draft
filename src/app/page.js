import styles from "./page.module.scss";
import PlayerList from "@/components/player-list/player-list";
import Chat from "@/components/chat/chat";
import Roster from "@/components/roster/roster.jsx";

export default function Home() {
    return (
        <main className={styles.main}>
            <Roster/>
            <PlayerList/>
            <Chat/>
        </main>
    );
}
