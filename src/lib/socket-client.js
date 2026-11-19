'use client';
import { io } from 'socket.io-client';

/** @type {import('socket.io-client').Socket | null} */
let socket = null;

/**
 * Lazily create the browser socket singleton. Never call during SSR.
 * Callers decide when to connect().
 */
export function getSocket() {
    if (!socket) {
        socket = io({ autoConnect: false, withCredentials: true });
    }
    return socket;
}
