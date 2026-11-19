'use client';
// Throwaway dev page for Phase 1 Checkpoint 1. Delete once the draft room uses sockets (Phase 7).
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket-client.js';
import { EVENTS } from '../../../lib/realtime/events.js';

export default function SocketTestClient() {
    const [status, setStatus] = useState('connecting…');
    const [socketId, setSocketId] = useState(null);
    const [lastPing, setLastPing] = useState(null);

    useEffect(() => {
        const socket = getSocket();
        const onConnect = () => { setStatus('connected'); setSocketId(socket.id); };
        const onDisconnect = (reason) => { setStatus(`disconnected (${reason})`); setSocketId(null); };
        const onError = (err) => setStatus(`connect error: ${err.message}`);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onError);
        socket.connect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onError);
            socket.disconnect();
        };
    }, []);

    const ping = async () => {
        const sentAt = Date.now();
        try {
            const res = await getSocket().timeout(5000).emitWithAck(EVENTS.PING, { sentAt });
            setLastPing({ ...res, latencyMs: Date.now() - sentAt });
        } catch (err) {
            setLastPing({ ok: false, error: err.message });
        }
    };

    return (
        <main style={{ padding: 24, fontFamily: 'monospace' }}>
            <h1>Socket test</h1>
            <p>Status: <strong>{status}</strong></p>
            <p>Socket ID: {socketId ?? '—'}</p>
            <button onClick={ping} disabled={status !== 'connected'}>Ping</button>
            {lastPing && <pre>{JSON.stringify(lastPing, null, 2)}</pre>}
        </main>
    );
}
