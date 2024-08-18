import styles from "./page.module.scss";
import PlayerList from "@/components/player-list/player-list";
import Chat from "@/components/chat/chat";

export default function Home() {
  return (
    <main className={styles.main}>
      <PlayerList />
        <Chat />
    </main>
  );
}
