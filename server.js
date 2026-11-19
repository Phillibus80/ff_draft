import { createServer } from 'node:http';
import next from 'next';
import { createIo } from './server/realtime/io.js';

const dev = process.env.NODE_ENV !== 'production';
// HOST, not HOSTNAME: Docker sets HOSTNAME to the container ID.
const hostname = process.env.HOST || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '3000', 10);
const SHUTDOWN_TIMEOUT_MS = 10_000;

// Next needs hostname/port when proxy.js (formerly middleware) is used.
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

await app.prepare();

const httpServer = createServer(handler);
const io = createIo(httpServer);

httpServer.listen(port, hostname, () => {
    const shown = hostname === '0.0.0.0' ? 'localhost' : hostname;
    console.log(`> Ready on http://${shown}:${port} (${dev ? 'development' : 'production'})`);
});

let shuttingDown = false;

/**
 * Stop accepting connections, close sockets, then exit.
 * Later phases hook in here to flush in-flight picks and close the DB pool.
 *
 * @param {string} signal
 */
async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`> ${signal} received, shutting down...`);

    const forceExit = setTimeout(() => {
        console.error('> Shutdown timed out, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
        // io.close() disconnects all sockets and closes the attached HTTP server.
        await io.close();
        httpServer.closeAllConnections?.();
        // TODO(Phase 4): await draftRegistry.drain();
        // TODO(Phase 2): await db.$client.end();
        console.log('> Shutdown complete');
        process.exit(0);
    } catch (err) {
        console.error('> Error during shutdown', err);
        process.exit(1);
    }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
