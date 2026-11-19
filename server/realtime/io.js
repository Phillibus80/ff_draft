import { Server } from 'socket.io';
import { EVENTS } from '../../lib/realtime/events.js';

/**
 * Create the Socket.IO server and attach it to the HTTP server.
 * Same origin as Next, so no CORS config is needed.
 *
 * Phase 3 adds the auth middleware (session cookie → socket.data.user).
 *
 * @param {import('node:http').Server} httpServer
 * @return {Server}
 */
export function createIo(httpServer) {
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        socket.on(EVENTS.PING, (payload, ack) => {
            if (typeof ack !== 'function') return;
            ack({ ok: true, serverNow: Date.now(), echo: payload ?? null });
        });
    });

    return io;
}
