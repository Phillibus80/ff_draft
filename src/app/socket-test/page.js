// Throwaway dev page for Phase 1 Checkpoint 1. Delete once the draft room uses sockets (Phase 7).
import { notFound } from 'next/navigation';
import SocketTestClient from './socket-test-client.jsx';

export default function SocketTestPage() {
    if (process.env.NODE_ENV === 'production') notFound();
    return <SocketTestClient/>;
}
