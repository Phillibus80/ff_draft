# Socket.IO Draft Room: Review & Phased Implementation Plan

_Written 2026-11-08, revised 2026-11-09. **Baseline: branch `dev` (b3f9f0a).** `dev` was cut from `main` and is byte-identical to it today, so every file and line reference below was verified against `dev`. The old `sockets-draft` prototype (32361ec) is referenced only for context._

Goal: replace Firebase Realtime Database with a self-hosted Socket.IO + database stack that supports:

- Live draft board: a pick disappears from every manager's player pool in near real time.
- A per-pick timer. When it expires, the server auto-drafts the top **eligible** player in the pool.
- Roster limits (e.g. max 2 QB) enforced on every pick, both manual and automatic.
- Chat to the whole league and direct messages between managers.

---

## TL;DR: key decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | **Build on `dev` (cut from `main`). Do not revive `sockets-draft`.** | `sockets-draft` is an ancestor of `main` (0 unique commits, 82 behind). All the domain work (auth, rules, draft queue, roster, timer, commissioner controls, UI) lives on `main`/`dev`. The socket code on `sockets-draft` is ~100 lines and will be rewritten anyway. |
| 2 | **The server is authoritative.** Clients send *intents* (`draft:pick`), and the server validates, persists, and broadcasts. | Today every rule (turn order, timer, pick writes) runs in the browser. That causes the bugs under **Defects found** and can't support a server-side auto-pick. |
| 3 | **One long-running Node process** serves Next.js and Socket.IO together (keep the custom `server.js` pattern). | Same origin means the auth cookie reaches the socket for free. A fantasy league is ~8–14 concurrent users, so one process is plenty. |
| 4 | **Move hosting off Vercel** to Fly.io, Railway, Render, or a small VPS. | Vercel can't host a persistent WebSocket server or a custom `server.js`. |
| 5 | **PostgreSQL + Drizzle ORM** replace Firebase RTDB. | Free or cheap managed tiers (Neon, Supabase, Railway), real transactions and unique constraints to keep picks safe under concurrency, and Docker for local dev in place of the Firebase emulator. |
| 6 | **Better Auth** replaces `next-auth@5.0.0-beta.x` + Firebase custom tokens. | next-auth v5 is still beta (`5.0.0-beta.32` on npm today). The locked `@auth/core` has critical advisories. The Firebase custom-token step goes away entirely. Better Auth has a Drizzle adapter, a username plugin, and `auth.api.getSession({ headers })`, which makes socket handshake auth one line. (Fallback: stay on next-auth beta. See Phase 3.) |
| 7 | **Upgrade Next 15.1.7 → 16.x** immediately. | `npm audit` on `main`'s lockfile reports critical issues in the installed version, including a **middleware authorization bypass** (GHSA-f82v-jwr5-mffw) and **RCE in the React flight protocol** (GHSA-9qr9-h5gf-34mp). This app depends on both middleware auth and server actions. |

---

## Current state review

### Branches

| Branch | State | Notes |
|--------|-------|-------|
| **`dev`** (baseline) | Next 15.1.7 / React 19.0 / Firebase RTDB / next-auth v5 beta | Identical to `main` at b3f9f0a. Login, draft room, roster, draft queue, commissioner controls, chat via Firebase. `server.js` exists but no longer starts Socket.IO. |
| `main` | same as `dev` | Production branch. `dev` merges into it. |
| `sockets-draft` | Next 14.2.5 / React 18 / Socket.IO 4.7 | Early socket chat prototype (Aug 2024). Fully contained in `main`'s history. Reference only. |
| `origin/draft-sqlite` | Next 14 / better-sqlite3 | Older experiment. The SQLite packages were later removed (commit 4cd2ce8). |

### What `sockets-draft` has (reference only, not the baseline)

- `server.js`: custom HTTP server wrapping Next with a Socket.IO `Server`. Handles `join room`, `add message`, `disconnect`.
- `src/components/socket/socket.js`: module-level `io()` singleton.
- `src/components/chat/chat.jsx`: joins a hard-coded room, listens for welcome/new-user/new-message events.
- `lib/chat/messages.js`: `getAllMessages` / `addMessage` are **empty stubs**.

### What `dev` has that we keep (logic ports over; Firebase calls are replaced)

| Area | Files on `dev` | Keep / change |
|------|-----------------|---------------|
| Draft order generation (snake/regular) | `lib/util/draft-queue-utils.js` | Keep the algorithm. Change it to compute "who picks at pick N" on the server instead of each client building a queue. |
| Roster slot template | `lib/util/roster-utils.js` | Keep, after fixing the bench bug (Defect #5). |
| Roster slot assignment (starter → FLEX → OP → bench) | `lib/players/draftPlayer.js` `getDraftedPlayers` | Extract into a pure, shared function. |
| League rules shape | `lib/data/mock-data/league-rules-mock.json` | Keep the shape. `positionMaxAllowed` is already defined but never enforced. |
| UI components | `draft-tracker/*`, `player-list/*`, `roster/*`, `chat/*`, `login-form/*` | Keep the markup. Rewire to a socket-driven context. |
| Commissioner controls | `draft-controls.jsx` | Keep the UI. Actions become socket events checked on the server. |
| Constants, JSDoc types | `src/app-constants.js`, `lib/jsdoc/types.js` | Keep and extend. |

### Defects found (all fixed by the phases below)

Items 1–13 are on `dev` (paths shown as `main:` resolve identically on `dev`). Items 14–17 are in the `sockets-draft` prototype only and are listed so that code isn't copied forward as-is.

| # | Where | Problem | Impact | Fixed in |
|---|-------|---------|--------|----------|
| 1 | `main:src/components/player-list/player-list.jsx:25,30` | `isOnTheClock` reads `draftQueue[0]`, but the queue is only sliced in the **drafting** client's local state. Other clients never advance. | In a snake draft the 2nd manager is never "on the clock", so the **draft deadlocks after pick 1**. | Phase 4 |
| 2 | `main:lib/players/draftPlayer.js:26-38` | Read-then-write of `CURRENT_DRAFT_POSITION` across 4 separate, non-transactional writes. No server-side turn or availability check. | Double picks, the same player drafted twice, out-of-turn picks from devtools. | Phase 4 |
| 3 | `main` (whole repo) | `positionMaxAllowed` is never read. | No roster limits. | Phase 6 |
| 4 | `main:src/hooks/draft-tracker/timer-hooks.jsx:16-18` | Each browser runs its own `setInterval`. At 0 it silently wraps back to `timeAllowed`. | Clocks drift between users, and nothing auto-drafts on expiry. | Phase 5 |
| 5 | `main:lib/util/roster-utils.js:28-29` | Bench = `total − number of position *types*` (16 − 8 = **8**) instead of `total − starter *slots*` (16 − 11 = **5**). | Rosters show 3 phantom bench slots. | Phase 6 |
| 6 | `main:src/hooks/draft-tracker/draft-tracker-hooks.jsx:36,98,129`, `players-hooks.jsx:17` | Cleanup is written as `() => !!unsubscribe ?? unsubscribe()`, which always returns a boolean and never unsubscribes. `getDraftedPlayers` is also `async`, so it returns a Promise rather than a function. | Listener leaks and duplicate updates on remount. | Phase 7 (hooks replaced) |
| 7 | `main:src/components/draft-tracker/draft-controls.jsx:19` | `draftStarted` lives in local `useState`. | After a commissioner refresh, "Start Draft" is enabled again mid-draft. | Phase 5 |
| 8 | `main:lib/league/leagueDraft.js:64-73` | "Resume" sets `TIMESTAMP_OF_LAST_SELECTION = now`. | Pause/resume gives a **full** clock instead of the remaining time. | Phase 5 |
| 9 | `main:src/context/draft-room-context/draft-room-context.jsx:20`, `lib/util/utils.js:39` | League key is hard-coded to `'da_league'`. | Only one league works. | Phase 4/7 |
| 10 | `main:lib/data/seedFireBaseDB.js:2-7` | `import … assert { type: 'json' }` | SyntaxError on Node 22+ (verified on the local Node 24.16). | Phase 2 |
| 11 | `main:lib/chat/messages.js:64-65` | Messages are keyed by millisecond timestamp. | Two messages in the same ms overwrite each other. | Phase 8 |
| 12 | `main:lib/players/draftPlayer.js:67-69` | FLEX accepts QBs. Standard FLEX is RB/WR/TE, while OP (superflex) accepts QB. | Rule ambiguity. See open questions. | Phase 6 |
| 13 | `main:lib/data/mock-data/2023.json` | No `DEF` entries, only 1 `K`, and `OLB`/`LB`/`S` positions are not in the rules. `TIME_PER_SELECTION` is stored as a string. | Required DEF slot can't be filled. Auto-pick needs a position filter. | Phase 2 |
| 14 | `sockets-draft:server.js:51` | `io.emit(...)` broadcasts to **every** socket, ignoring rooms. | Chat leaks across leagues. | Phase 8 |
| 15 | `sockets-draft:server.js` + `chat.jsx:46` | No socket auth. The author is sent by the client (hard-coded `'Phillibus'`). | Anyone can impersonate anyone. | Phase 3 |
| 16 | `sockets-draft:src/util/utils.js:15-24` | `dedupMessages` dedups by content and drops `author`. | Legitimate repeated messages ("lol") disappear. | Phase 8 |
| 17 | `sockets-draft:src/components/player-list/player-list.jsx:4` / `lib/players/playerStats.js:21-23` | Component takes `(season = 2024)` but receives a props object. `Object.values(undefined)` throws when the DB is empty. | Crash on an empty DB. | Phase 7 |
| 18 | Both: `server.js` | Port `3000` and hostname are hard-coded. | Hosts like Fly/Railway inject `PORT`. | Phase 1 |

---

## Target architecture

```
 Browser (React client components)
   │  HTTP: pages, auth, static player list
   │  WebSocket (Socket.IO): draft + chat + presence
   ▼
 Node process  (server.js, single instance)
   ├── Next.js request handler           ← pages, /api/auth/*, server actions
   ├── Socket.IO server
   │     ├── auth middleware (session cookie → user)      [Phase 3]
   │     ├── rooms: league:<id>, user:<id>
   │     └── handlers: draft.*, chat.*, presence.*
   ├── DraftEngine (one in-memory instance per active draft)
   │     ├── state: status, pickNumber, deadlineAt, picks
   │     ├── per-draft serial lock (no concurrent mutations)
   │     └── setTimeout → auto-pick on expiry
   └── Repository layer (Drizzle) ──► PostgreSQL
```

**Principles**

1. **The database is the source of truth. Memory is a cache.** Every state change is written in a transaction *before* it is broadcast. On restart, active drafts are rehydrated from the DB and their timers rescheduled.
2. **Clients never compute authority.** They render server snapshots. Pure helpers (pick → manager, roster slotting, eligibility) are *shared* so the UI can grey out ineligible players, but the server re-checks everything.
3. **The player pool is derived, not mutated.** Available players = season players − drafted player IDs. Clients load the static player list once and subtract `picks` from state, so nothing is deleted from a "pool" node.
4. **Snapshots plus events.** On join or reconnect, the client receives a full `draft:state` snapshot. After that it receives small events (`draft:pick`, `draft:status`). Every payload carries a monotonically increasing `version`, and clients drop stale ones.

**Proposed layout**

```
server.js                      # boots Next + Socket.IO (stays at root)
server/
  realtime/io.js               # creates Server, auth middleware, registers handlers
  realtime/draft-handlers.js
  realtime/chat-handlers.js
  realtime/presence.js
  draft/draft-engine.js        # DraftEngine class + registry Map<draftId, DraftEngine>
  draft/draft-timer.js
lib/
  db/schema.js  db/client.js  db/repos/*.js
  draft/order.js               # pure: managerForPick(n, order, style)
  draft/roster.js              # pure: buildRosterTemplate, assignRosterSlots, canDraft
  draft/autopick.js            # pure: chooseAutoPick(available, roster, rules)
  realtime/events.js           # event name constants (shared client/server)
  realtime/schemas.js          # zod payload schemas
src/                           # Next app (client components + pages)
docs/
```

### Multi-client manual testing setup

The draft only gets interesting with several managers connected at once. Every checkpoint below assumes this setup.

**Seed data for multiple clients** (built in Phase 2):

| User | League | Role | Purpose |
|------|--------|------|---------|
| `alice` | `test-league` | commissioner + manager | Start, pause, resume, undo |
| `bob`, `carol`, `dave` | `test-league` | manager | 4-team snake, so the reversal at each round turn is visible |
| `erin` | `other-league` | commissioner + manager | Outsider for isolation tests (chat, membership, wrong slug) |

All share one dev password (`password123`), shown in `.env.example`. Add `npm run seed -- --teams=N` so you can test larger leagues (e.g. 10 or 12 teams) with bots filling the extra seats.

**Ways to run independent clients.** Tabs in the same browser profile share a session cookie, so they are the *same user*:

| Method | Gives you | Use for |
|--------|-----------|---------|
| Different browsers (Chrome, Firefox, Edge…) | 1 user each | The default 2–3 human clients |
| Chrome **profiles** (`--user-data-dir=/tmp/ff-bob`) or Firefox containers | 1 user per profile/container | 4+ humans on one machine |
| Private/incognito window | 1 extra user (one per browser) | Quick extra seat, or the logged-out case |
| Second tab in the same profile | Same user, second socket | Multi-tab tests: DMs reach both tabs, stale-UI picks |
| Phone/second laptop on the LAN (`http://<your-LAN-IP>:3000`) | Real second device | Network drops (wifi off), mobile layout |
| **Bot clients** (`npm run bots`, below) | Any number of headless managers | Filling seats so you only have to drive 1–2 browsers |

LAN access needs `HOST=0.0.0.0` (the default from Phase 1 › Custom server hardening). In dev, also add the LAN origin to Better Auth's `trustedOrigins`, or the phone's login will be rejected.

**Bot clients: `scripts/bots.js`** (login + connect in Phase 3, picking in Phase 4, extended in Phases 5 and 8). A small Node script that signs in through Better Auth's API as each given seed user, opens a `socket.io-client` connection with the session cookie, and `draft:join`s:

```bash
npm run bots -- --league=test-league --users=bob,carol,dave --mode=pick --delay=2000
```

- `--mode=pick`: when on the clock, picks the top eligible player (via `chooseAutoPick`) after `--delay` ms.
- `--mode=idle`: connects and does nothing, which lets the server timer auto-pick (Phase 5).
- `--mode=chaos`: double-submits, picks out of turn, and picks stale players, then logs every rejection code.
- `--chat`: posts an occasional league message (Phase 8).
- Logs each event received with its `version`, so you can confirm ordering by watching the console.

This uses the same handshake as a browser, so it also smoke-tests auth. It is dev-only and must refuse to run when `NODE_ENV=production`.

**Debug overlay.** In dev, add a small corner panel to the draft room showing the user, socket ID, connection state, snapshot `version`, and clock offset. When several windows sit side by side, it shows at a glance which window is which user and whether they have diverged.

**Reset between runs.** Add `npm run draft:reset -- --league=test-league`, which deletes the picks and sets the draft back to `scheduled` without a full reseed.

> **Module-resolution rule:** `server.js` runs under plain Node, which does **not** understand the `@/` alias from `jsconfig.json`. Anything under `server/` or `lib/` must use **relative imports**. Seven `lib/` files on `dev` currently import `@/app-constants.js` and must change: `lib/players/playerStats.js`, `lib/players/draftPlayer.js`, `lib/rules/rules.js`, `lib/util/draft-queue-utils.js`, `lib/league/getUser.js`, `lib/league/leagueDraft.js`, `lib/chat/messages.js`. `src/` can keep `@/`. Moving `app-constants.js` to `lib/constants.js` and re-exporting it from `src/app-constants.js` keeps both sides happy.

---

## Phase 1: Stack upgrades & infrastructure

**Goal:** `dev` on current, patched dependencies, with the custom server running Next 16 + Socket.IO, Postgres running locally, and tooling ready. The app still uses Firebase at the end of this phase. Nothing user-facing changes yet.

### 1.1 Branching

`dev` is the integration branch. Do each phase on a short-lived branch off `dev` and merge back when its exit criteria pass:

```bash
git switch dev && git pull
git switch -c phase-1/stack-upgrades     # then phase-2/data-layer, phase-3/auth, ...
```

Phases 6 (roster rules) and 8 (chat) can branch in parallel with 4–5. Archive `sockets-draft` with a tag (`git tag archive/sockets-draft sockets-draft`) once Phase 7 is merged. It has no unique commits.

### 1.2 Dependency changes

Versions are the npm `latest` tags as of 2026-11-08. Pin with `^` and commit the lockfile.

**Upgrade**

| Package | From (`main` lock) | To | Notes |
|---------|-------------------|----|-------|
| `next` | 15.1.7 | **16.4.x** | Security (see **Key decisions**). Run `npx @next/codemod@canary upgrade latest`. Relevant v16 changes: `middleware.js` → `proxy.js` rename, `next lint` removed (call `eslint` directly), Turbopack is the default bundler, Node ≥ 20.9 required. |
| `react`, `react-dom` | 19.0.0 | **19.3.x** | Keep in lockstep with Next. |
| `eslint-config-next` | 15.1.7 | **16.4.x** | Flat config. Replace the `"lint": "next lint"` script with `"lint": "eslint ."`. |
| `zod` | 3.24 | **4.x** | Used for socket payload validation. Minor API changes (`z.string().min()` is unchanged). |
| `next-auth` | 5.0.0-beta.25 | **5.0.0-beta.32** | _Done in Phase 1._ beta.25 only accepts Next 14/15 as a peer, so it blocks the Next 16 install. beta.32 accepts Next 16. Temporary: it is removed in Phase 3. |
| `bcrypt` | 5.1.1 | **6.0.x** | _Done in Phase 1._ npm 12 blocks install scripts by default, and bcrypt 5 downloads its native binary in one, so it failed to load. bcrypt 6 ships prebuilt binaries inside the package and loads them without the script. Same API, and it verifies existing `$2a$`/`$2b$` hashes (checked against the OpenBSD test vectors and `bcryptjs`). Temporary: it is removed in Phase 3. |

**Add**

| Package | Purpose |
|---------|---------|
| `socket.io` / `socket.io-client` **4.8.x** | Realtime transport: rooms, acknowledgements (request/response over the socket), auto-reconnect, and `connectionStateRecovery`. |
| `drizzle-orm` + `postgres` (postgres.js driver) **3.4.x** | Typed, lightweight data layer. Plain JS-friendly, and the schema lives in JS. **Stay on `postgres@3`:** with 4.x (released 2026-10-29), `drizzle-kit migrate` exits 1 without printing an error. Revisit when drizzle-kit supports it. |
| `drizzle-kit` (dev) | Migrations: `drizzle-kit generate` / `migrate`. |
| `better-auth` **1.7.x** | Sessions, username/password login, Drizzle adapter. Replaces next-auth + firebase-admin custom tokens. |
| `vitest` (dev) | Unit and integration tests for the engine and socket handlers. |
| `@playwright/test` (dev) | Multi-browser e2e: two managers drafting against each other. |
| `nodemon` (dev) | Restarts the custom server when `server/` or `lib/` changes. Replaces `node --watch`, which aborts with a core dump on Ctrl+C under Node 24.16 (see 1.3). |

**Remove** (at the end of Phase 3, once the replacements work)

| Package / file | Reason |
|----------------|--------|
| `firebase`, `firebase-admin`, `firebase-functions` | Replaced by Postgres + Socket.IO. |
| `next-auth`, `bcrypt` | Replaced by Better Auth, which handles hashing itself (no native build step). |
| `xss`, `slugify` | Unused on `main`. React escapes text output, so chat needs no HTML sanitizer as long as we never use `dangerouslySetInnerHTML`. |
| `functions/`, `firebase.json`, `.firebaserc`, `firestore.*`, `database.rules.json`, `lib/firebaseConfig.js`, `lib/initFirebaseAdmin.js`, `npm run emul` | Firebase-only. |

**Not adding (and why)**

- **Redis / `@socket.io/redis-adapter`.** Only needed for more than one server instance. Defer; see Phase 9 "Scaling".
- **A state library (Redux, Zustand).** `useReducer` + context is enough for one draft room.
- **TypeScript.** Not required. The codebase uses JSDoc; keep that and add `// @ts-check` to the new `lib/draft/*` files for editor type checking at no cost.
- **dotenv.** Node ≥ 22.9 loads env files natively (`node --env-file-if-exists=.env server.js`), Next loads `.env` itself, and `drizzle-kit` reads `.env` on its own.

**Install commands (Phase 1)**

```bash
# upgrades (the codemod is interactive, so this was done by hand, plus the proxy.js rename and eslint.config.mjs)
npm i next@^16.4.6 react@^19.3.1 react-dom@^19.3.1 zod@^4 next-auth@5.0.0-beta.32 bcrypt@^6
npm i -D eslint-config-next@^16.4.6 eslint@^9

# additions
npm i socket.io socket.io-client drizzle-orm postgres@^3.4.9 better-auth
npm i -D drizzle-kit vitest @playwright/test nodemon
npx playwright install chromium

# Phase 9 (deferred): npm i pino
# End of Phase 3: npm rm firebase firebase-admin firebase-functions next-auth bcrypt xss slugify
```

### 1.3 Custom server hardening (`server.js`)

- Read `PORT` and `HOST` from env (defaults `3000` / `0.0.0.0`). Not `HOSTNAME`: Docker sets that to the container ID.
- Create the Socket.IO server in `server/realtime/io.js` and attach it to the same `httpServer`.
- Graceful shutdown on `SIGTERM`: stop accepting sockets, flush in-flight picks, close the DB pool.
- Dev: `npm run dev` runs `nodemon` (config in `nodemon.json`), which watches `server/`, `lib/` and `server.js` and restarts with SIGTERM. Next HMR handles `src/`. **Don't use `node --watch`/`--watch-path`:** on Node 24.16, every watch mode aborts (`Assertion failed: (wrap) != nullptr` in `FSWatcher.close`) on Ctrl+C, even after the app has shut down cleanly.
- `engines.node` is `>=22.9.0` (needed for `--env-file-if-exists`).

### 1.4 Local infrastructure

- `docker-compose.yml` with `postgres:17` (volume-backed) replaces the Firebase emulator.
- `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `PORT`, `HOST`, plus `POSTGRES_*` (including `POSTGRES_PORT`, so two checkouts can run side by side).
- Scripts: `db:up` (`docker compose up -d --wait`), `db:down`, `db:generate`, `db:migrate`, `db:studio`, `test`, `test:watch`, `test:e2e`.
- `drizzle.config.js` pointing at `lib/db/schema.js`.

### 1.5 Hosting decision

| Option | Rough cost | Notes |
|--------|------------|-------|
| Fly.io / Railway / Render (1 small instance) + Neon/Supabase Postgres free tier | ~$0–7/mo | Easiest. All support WebSockets and long-running Node. Use a single instance. |
| $5 VPS (Hetzner, DigitalOcean) running Docker Compose (app + Postgres) | ~$5/mo | Cheapest at scale, but you manage backups and TLS (Caddy makes TLS easy). |

Either is a large saving over Firebase RTDB bandwidth billing. **Not Vercel**, for the reasons in **Key decisions**.

### Exit criteria
- `npm run dev` boots Next 16 + Socket.IO. A test page connects and receives a `ping` ack.
- `npm audit --omit=dev` shows no critical/high advisories for `next`, `react`, or the auth packages.
- `docker compose up -d && npx drizzle-kit migrate` succeeds against an empty schema.
- `npm run lint` (eslint flat config) passes.

### ✋ Checkpoint 1 (manual)
1. `npm run dev`, then click through the **existing** app: log in via Firebase, open the draft room, see the player list. Nothing should look different from before the upgrade.
2. Open `/socket-test` (throwaway dev page): it shows "connected" and a round-trip `ping → pong` ack with latency.
3. `docker compose ps` shows the `postgres` container healthy; `docker compose down && docker compose up -d` and the data volume survives.
4. Stop the dev server with Ctrl+C: it exits cleanly within a couple of seconds (graceful shutdown works).

---

## Phase 2: Data layer (Postgres + Drizzle)

**Goal:** all data that lived in Firebase lives in Postgres, with a working seed script.

### 2.1 Schema (sketch)

```
users            id, username (unique), name, email, … (Better Auth tables: user/session/account)
leagues          id, slug (unique), name, commissioner_user_id
league_members   id, league_id, user_id, team_name, team_motto, draft_slot (int)
                 unique(league_id, user_id), unique(league_id, draft_slot)
league_rules     league_id (pk), draft jsonb, roster_construction jsonb, scoring jsonb
players          id, season, name, slug, position, nfl_team, fpts, stats jsonb
                 unique(season, slug)
drafts           id, league_id, season, style ('snake'|'regular'),
                 status ('scheduled'|'running'|'paused'|'complete'),
                 seconds_per_pick, total_picks, current_pick (0-based),
                 pick_deadline_at timestamptz null, paused_remaining_ms int null,
                 started_at, completed_at, version int
draft_picks      id, draft_id, pick_number, member_id, player_id, is_auto bool, made_at
                 unique(draft_id, pick_number), unique(draft_id, player_id)   ← DB-level double-pick guard
messages         id (bigserial), league_id, sender_user_id, recipient_user_id null,
                 body (≤ 500 chars), created_at
                 index(league_id, id), index(league_id, recipient_user_id, sender_user_id, id)
```

Notes:
- **Rules stay as JSON** (`jsonb`). The shape is already defined and only read as a whole. Validate it with zod on load.
- `draft_order` is not stored: it is derived from `league_members.draft_slot` + `drafts.style`.
- `TIME_PER_SELECTION` (string ms) becomes `seconds_per_pick` (int).

### 2.2 Tasks
1. `lib/db/schema.js`, `lib/db/client.js`, the first migration.
2. Repositories (`lib/db/repos/`): `users`, `leagues`, `rules`, `players`, `drafts`, `picks`, `messages`. These are the only modules that touch the DB.
3. Port `seedFireBaseDB.js` → `lib/db/seed.js`:
   - Use `import … with { type: 'json' }` (fixes Defect #10).
   - Normalize player positions. Map `OLB` → `LB`. Decide whether IDP positions are draftable (open question). Add **32 team DEF entries** and a fuller **K** list so required slots can be filled (Defect #13).
   - Create users through Better Auth's API so passwords are hashed correctly (requires Phase 3; in the meantime seed with a temporary hash).
4. `npm run seed` and `npm run db:reset` scripts. Seed the multi-client fixture from **Multi-client manual testing setup**: 5 users, `test-league` with 4 members, `other-league` with 1, and a `--teams=N` option.

### Exit criteria
- `npm run db:reset && npm run seed` produces 5 users, 2 leagues, rules, ~100+ players, and 1 `scheduled` draft per league.
- Repository unit tests (Vitest against the Docker DB) pass.

### ✋ Checkpoint 2 (manual)
1. `npm run db:reset && npm run seed`, then `npx drizzle-kit studio` and browse the tables in the browser.
2. Verify: all 5 seed users exist, `test-league` has 4 members with distinct `draft_slot`s, rules JSON looks right, player count is sane, and there are **32 DEF** rows and a usable number of **K** rows.
3. Run the seed twice in a row — the second run either cleanly resets or no-ops, but never duplicates rows.

---

## Phase 3: Auth & authenticated sockets

**Goal:** log in without Firebase. Every socket connection is tied to a verified user.

### 3.1 Better Auth (recommended)
- `lib/auth.js`: `betterAuth({ database: drizzleAdapter(db, …), emailAndPassword: { enabled: true }, plugins: [username()] })`.
- `src/app/api/auth/[...all]/route.js`: `export const { GET, POST } = toNextJsHandler(auth)`.
- `proxy.js` (Next 16's replacement for `middleware.js`): a cheap cookie-presence redirect only. Do the real session check in the draft-room server component via `auth.api.getSession({ headers: await headers() })`.
- Login form: call `authClient.signIn.username(...)`, then `router.push('/draft-room')`. Delete `src/app/actions/actions.js` (the Firebase custom-token flow).

### 3.2 Socket handshake auth

```js
// server/realtime/io.js
io.use(async (socket, next) => {
  const session = await auth.api.getSession({ headers: new Headers(socket.handshake.headers) });
  if (!session) return next(new Error('UNAUTHORIZED'));
  socket.data.user = { id: session.user.id, username: session.user.username };
  next();
});
io.on('connection', socket => socket.join(`user:${socket.data.user.id}`));
```

The browser sends the session cookie automatically on the same-origin handshake. **The server never trusts a user ID or author from a payload** (fixes Defect #15).

### 3.3 Fallback: stay on next-auth v5 beta
If you'd rather not switch: upgrade to `next-auth@5.0.0-beta.32`, drop `customToken`, and in `io.use` decode the cookie with `decode` from `next-auth/jwt` (`salt` = cookie name, `authjs.session-token` or `__Secure-authjs.session-token` in prod). This works, but you stay on a beta.

### Exit criteria
- Both seed users can log in and out. `/draft-room` redirects when logged out.
- A socket connection without a cookie is rejected. With a cookie, `socket.data.user` is populated.
- All `firebase*` packages and files are removed. `grep -r firebase src lib server` returns nothing.

### ✋ Checkpoint 3 (manual)
1. Two different browsers (not two tabs — e.g. Chrome + Firefox): log in as `alice` and `bob`. Then open a third client (Chrome profile or private window) as `carol`. Each window stays its own user after a refresh. Log out and confirm `/draft-room` redirects to login.
2. Logged in, open DevTools → Network → WS: the Socket.IO handshake succeeds. In a private window **without** logging in, the handshake is rejected (connect error in console).
3. Wrong password shows a sensible error on the login form.
4. The Firebase emulator is no longer running anywhere and the app works entirely against local Postgres.
5. From a phone on the LAN (`http://<LAN-IP>:3000`), log in as `dave`. This confirms `trustedOrigins` and the LAN binding work.
6. `npm run bots -- --users=bob --mode=idle` connects and logs a successful handshake. With a bad password, it logs `UNAUTHORIZED`.

---

## Phase 4: Server-authoritative draft engine

**Goal:** picks are validated, atomic, and broadcast. This fixes the turn deadlock and double picks.

### 4.1 Pure shared helpers (`lib/draft/`)

```js
// order.js: replaces generating the whole queue on every client
export function managerSlotForPick(pickNumber, teamCount, style) {
  const round = Math.floor(pickNumber / teamCount);
  const idx = pickNumber % teamCount;
  return style === 'snake' && round % 2 === 1 ? teamCount - 1 - idx : idx;
}
export const upcomingPicks = (from, count, teamCount, style) => /* for the DraftQueue UI */;
```

`generateDraftQueue` stays useful for rendering the full board, but turn checks use `managerSlotForPick`.

### 4.2 DraftEngine (`server/draft/draft-engine.js`)

One instance per active draft, kept in a `Map<draftId, DraftEngine>` registry. Loaded on first join and on server boot for `running`/`paused` drafts.

State machine:

```
scheduled ──start──► running ──pause──► paused ──resume──► running
                        │                                     │
                        └──── last pick made ─────► complete ◄┘
```

**Serialization.** Each engine owns a promise-chain lock (`this.queue = this.queue.then(fn)`), so a manual pick, an auto-pick, and a commissioner pause can never interleave. Unique constraints on `draft_picks` are the backstop.

`makePick({ userId, playerId, expectedPickNumber, isAuto })` steps:
1. `status === 'running'`, or reject `DRAFT_NOT_RUNNING`.
2. `expectedPickNumber === state.currentPick`, or reject `STALE_PICK`. This guards double-clicks and the race with auto-pick.
3. `!isAuto` ⇒ the user owns the member whose slot is on the clock, or reject `NOT_YOUR_TURN`.
4. Player exists, is in this season, and is not drafted, or reject `PLAYER_UNAVAILABLE`.
5. `canDraft(roster, player, rules)` passes, or reject `ROSTER_LIMIT` (Phase 6).
6. **In one DB transaction:** insert into `draft_picks`, update `drafts` (`current_pick + 1`, new `pick_deadline_at`, `version + 1`, `status = 'complete'` if it was the last pick).
7. Update memory, reschedule the timer, broadcast.

### 4.3 Event contract (`lib/realtime/events.js` + zod schemas)

Client → server events use **acknowledgements**, so every intent gets `{ ok: true }` or `{ ok: false, code, message }`.

| Event | Direction | Payload | Notes |
|-------|-----------|---------|-------|
| `draft:join` | C→S (ack) | `{ leagueSlug }` | Verifies membership, joins `league:<id>`, acks with a **full snapshot**. |
| `draft:pick` | C→S (ack) | `{ draftId, playerId, expectedPickNumber }` | |
| `draft:start` / `draft:pause` / `draft:resume` | C→S (ack) | `{ draftId }` | Commissioner only. |
| `draft:undo` _(optional)_ | C→S (ack) | `{ draftId }` | Commissioner fixes a mis-click. |
| `draft:state` | S→room | full snapshot | Sent after status changes. |
| `draft:pick-made` | S→room | `{ version, pick, currentPick, onTheClock, deadlineAt, serverNow }` | Hot path. Small payload. |
| `presence:update` | S→room | `{ online: [userId…] }` | Phase 9. |
| `chat:*` | | | Phase 8. |

Snapshot shape:

```js
{
  version, draftId, leagueId, status, style,
  teams: [{ memberId, userId, teamName, teamMotto, draftSlot }],
  totalPicks, currentPick, onTheClock: { memberId, teamName },
  deadlineAt, pausedRemainingMs, serverNow,
  picks: [{ pickNumber, memberId, playerId, isAuto }],
  rules: { rosterConstruction, draft }
}
```

### Exit criteria
- Two browsers in a 2-team snake draft alternate correctly through all rounds (fixes Defect #1).
- Firing 20 concurrent `draft:pick` calls for the same pick produces exactly 1 success. Covered by a Vitest integration test using `socket.io-client` against an in-process server.
- Out-of-turn picks and picks of already-drafted players are rejected with the correct codes.

### ✋ Checkpoint 4 (manual)
_(UI may still be rough here — a minimal pick button/list is enough; the polished room lands in Phase 7.)_
1. **Two humans + two bots.** `alice` (Chrome) and `bob` (Firefox), then `npm run bots -- --users=carol,dave --mode=pick --delay=3000`. Alice starts the draft. Order: A, B, C, D, D, C, B, A, A… through at least 3 rounds. Each pick appears in both browsers and the bot logs without a refresh, and every client's debug-overlay `version` matches.
2. While it's A's turn, B attempts a pick → rejected with "not your turn". A double-clicks a pick → exactly one pick recorded.
3. Refresh either browser mid-draft → the full board state comes back and the right manager is on the clock. Kill and restart the bot process → the bots rejoin and carry on.
4. In B, try to pick a player A already drafted (stale UI simulated via a second tab) → rejected, pool corrects itself.
5. **Chaos run.** `npm run bots -- --users=bob,carol,dave --mode=chaos` while you drive `alice`. Every rejection logs the expected code (`NOT_YOUR_TURN`, `STALE_PICK`, `PLAYER_UNAVAILABLE`), and the board never shows duplicates or gaps.
6. As `bob`, try `draft:start` → rejected (commissioner only).

---

## Phase 5: Draft timer & auto-draft

**Goal:** one authoritative clock. When it expires, the server drafts for the manager.

### 5.1 Server
- On each new pick or resume: `deadlineAt = now + secondsPerPick*1000`, persist `pick_deadline_at`, then `clearTimeout(old)` and `setTimeout(onExpire, deadlineAt - now)`.
- `onExpire` runs **inside the engine lock** and re-checks `status === 'running'` and that the pick number is unchanged (a manual pick may have just landed). Then it calls `makePick({ playerId: chooseAutoPick(...), isAuto: true })`.
- **Pause:** `pausedRemainingMs = deadlineAt - now`, clear the timer, `deadlineAt = null`.
  **Resume:** `deadlineAt = now + pausedRemainingMs` (fixes Defect #8).
- **Restart recovery:** on boot, for each `running` draft whose `deadlineAt` is in the past, auto-pick immediately. Otherwise reschedule.
- Optional: per-league "auto-pick for disconnected managers" toggle. If the on-the-clock manager has no live socket, shorten their clock to N seconds.

### 5.2 Auto-pick selection (`lib/draft/autopick.js`, pure)

```js
export function chooseAutoPick(availablePlayers /* sorted by fpts desc */, teamRoster, rules) {
  return availablePlayers.find(p => canDraft(teamRoster, p, rules)) ?? null;
}
```

- This is "top player in the pool", **subject to roster limits**. If the top player is a 3rd QB and the QB max is 2, it takes the next eligible player.
- If no eligible player exists, record a **skipped** pick (`player_id null`, `is_auto true`) so the draft keeps moving.
- Later: a per-manager **pick queue / watchlist** consulted first, and ADP instead of last-season FPTS.

### 5.3 Client clock display
- Compute `clockOffset = serverNow - Date.now()` on each snapshot or pick event.
- `remaining = max(0, deadlineAt - (Date.now() + clockOffset))`, rendered via a 250 ms interval in the `Timer` component only, so the rest of the tree doesn't re-render every tick (the problem fixed in commit b65aa40).
- While paused, show `pausedRemainingMs` statically.
- Commissioner controls derive their enabled/disabled state from `status` in the snapshot, not local state (fixes Defect #7).

### Exit criteria
- With `seconds_per_pick = 5`, an idle draft auto-completes. Every pick respects roster limits.
- A manual pick submitted at T−50 ms never produces two picks for that slot.
- Pause at 0:42, then resume, shows 0:42 on every client (±1 s).
- Killing the server mid-pick and restarting resumes the clock correctly.

### ✋ Checkpoint 5 (manual)
1. Seed with `seconds_per_pick = 10`. Start the draft and don't touch anything: the clock counts down in sync in both browsers and an auto-pick fires at 0 (marked "auto").
2. Pause with ~0:07 left, wait 30 s, resume → both browsers resume from ~0:07, not a fresh clock.
3. Refresh the commissioner's browser mid-draft → Start stays disabled, Pause/Resume reflect the real status.
4. Ctrl+C the server mid-countdown, restart it → the draft is still `running` and the clock picks up where the deadline says it should (or auto-picks immediately if it expired while down).
5. Make a manual pick with ~1 s left a few times → never two picks for the same slot.
6. Run `npm run bots -- --users=bob,carol,dave --mode=idle` with you as `alice`. Only the bots' turns auto-pick, and you can still pick manually on yours. Lay 3 windows side by side (two browsers plus a phone) and check the clocks agree within ~1 s.
7. Close `bob`'s browser entirely while he's on the clock → the server still auto-picks for him (and uses the shortened clock, if that toggle is built).

---

## Phase 6: Roster construction & limits

**Goal:** a single, shared, tested rules module used by the UI, manual picks, and auto-pick.

`lib/draft/roster.js`:

```js
buildRosterTemplate(rosterConstruction)       // fixes bench math: total - sum(starterPositions)
assignRosterSlots(template, draftedPlayers)   // port of main's getDraftedPlayers algorithm, made pure
countByPosition(draftedPlayers)
canDraft(draftedPlayers, player, rules) → { ok, reason }
```

`canDraft` checks, in order:
1. **Roster size:** `drafted.length < totalNumberOfPlayersAllowed`.
2. **Position max:** `count[player.position] < positionMaxAllowed[player.position]`. Positions with no entry are **not draftable** (this filters `LB`/`S`/etc. unless the league adds them).
3. **Starter feasibility** (optional, recommended): after this pick, the remaining open roster spots must still be ≥ the number of *required starter slots that can't otherwise be filled*. This stops a manager (or auto-pick) from filling the roster with WRs and leaving K/DEF empty. Gate it behind `rules.roster_construction.enforceStarterFeasibility`.

UI use: `PlayerList` greys out rows where `canDraft` fails and shows the reason as a tooltip ("QB limit reached (2/2)").

### Exit criteria
- Unit tests: bench count = 5 for the mock rules; FLEX/OP overflow; position max; feasibility edge cases; auto-pick skipping ineligible top players.

### ✋ Checkpoint 6 (manual)
1. Draft 2 QBs as one manager → every remaining QB row greys out with the tooltip "QB limit reached (2/2)"; clicking one is rejected server-side too (try from a stale tab).
2. The roster panel shows **5** bench slots (not 8) and drafted players land in the right slots (starter → FLEX/OP → bench).
3. Set the clock short and let auto-pick run while the top available player is at a maxed position → it drafts the next eligible player instead.

---

## Phase 7: Client draft room rewrite

**Goal:** replace the Firebase hooks with one socket-driven provider. Reuse the existing components.

1. **Socket singleton** at `src/lib/socket-client.js`: `io({ autoConnect: false, withCredentials: true })`. Call `connect()` from the provider after the session is confirmed, so no socket is created during SSR.
2. **`DraftRoomProvider`** (replaces `draft-room-context.jsx`):
   - `useReducer(draftReducer, initial)` with actions `SNAPSHOT`, `PICK_MADE`, `STATUS`, `PRESENCE`, `ERROR`. The reducer ignores events with `version <= state.version`.
   - On `connect` (including every reconnect), emit `draft:join` and dispatch the snapshot from the ack. This is simpler and more robust than replaying missed events.
   - Exposes derived values via `useMemo`: `availablePlayers`, `myRoster` (via `assignRosterSlots`), `isOnTheClock`, `upcomingPicks`.
   - Exposes actions: `pick(playerId)`, `start()`, `pause()`, `resume()`. Each returns the ack promise so the UI can toast errors.
3. **Routing:** `/draft-room/[leagueSlug]` (removes the hard-coded `'da_league'`, Defect #9). The page is a **server component** that checks the session and membership and passes the static, season-cached player list as props to the client `DraftRoom`. This is the only SSR in the room. Everything live comes over the socket.
4. **Components:** `DraftTracker`, `DraftQueue`, `TeamDraftCard`, `Timer`, `DraftControls`, `PlayerList`, `Roster` keep their markup and read from the new context. Add a **Draft Board** grid (rounds × teams) built from `picks`; it falls out of the snapshot for free.
5. Delete `src/hooks/draft-tracker/*`, `src/hooks/players-hooks.jsx`, `src/hooks/hooks.jsx` (Firebase sign-in), and `lib/players/draftPlayer.js` / `lib/league/leagueDraft.js`.
6. **Connection UX:** a banner for "Reconnecting…" and "Disconnected". Disable the Draft buttons while disconnected.

### Exit criteria
- No component imports `firebase` or the old hooks.
- Playwright: two browser contexts, each logged in as a different manager. A pick in A removes the row in B in < 500 ms (local), and B goes on the clock.

### ✋ Checkpoint 7 (manual)
1. Run a complete short mock draft end-to-end in the real UI, two browsers side by side: picks vanish from the other pool in well under a second, the on-the-clock highlight moves correctly, the draft board grid fills in, rosters build as you go.
2. Kill the server for ~10 s mid-draft → both browsers show the "Reconnecting…" banner and the draft buttons disable; restart → the room recovers on its own, no refresh, no duplicated state.
3. Visit `/draft-room/<wrong-slug>` and a league you're not a member of → clean error/redirect, not a crash.
4. Open the room with a fresh DB (no picks) → no crash from an empty state (old Defect #17 class of bug).
5. **Full-league run.** `npm run seed -- --teams=10`, drive 2–3 browsers yourself, and run `npm run bots -- --mode=pick --delay=1500` for the remaining 7–8 seats. Run the whole draft to `complete`. Afterwards, the draft board, every roster, and the DB (`drizzle-kit studio`) all agree.
6. Turn off wifi on the phone client for ~15 s mid-draft, then turn it back on → it catches up without a refresh, and the other clients never notice.

---

## Phase 8: Chat (league + direct messages)

**Goal:** persistent, authenticated, room-scoped chat.

| Event | Direction | Payload | Behavior |
|-------|-----------|---------|----------|
| `chat:send` | C→S (ack) | `{ leagueId, body, toUserId? }` | zod: body 1–500 chars, trimmed. Sender comes from `socket.data.user`. Persist, then emit `chat:message`: **league** → `io.to('league:<id>')`; **DM** → `io.to(['user:<from>', 'user:<to>'])` (covers multiple tabs). Recipient must be a member of the league. |
| `chat:history` | C→S (ack) | `{ leagueId, withUserId?, beforeId?, limit≤50 }` | Keyset pagination by `id`. Replaces the Firebase `endAt/limitToLast` logic. |
| `chat:message` | S→client | `{ id, leagueId, from, to, body, createdAt }` | Client dedups by **`id`** (replaces `dedupMessages`, Defect #16). |
| `chat:typing` _(optional)_ | C→S→room | `{ leagueId, toUserId? }` | Volatile emit (dropped rather than queued if the client is busy). Not persisted. |

- **Rate limit** per socket (e.g. 5 messages per 5 s, token bucket in memory). Reject with `RATE_LIMITED`.
- **System messages:** the draft engine posts "Crom Laughing selected CeeDee Lamb (WR) — Rd 1, Pk 1 (auto)" into league chat.
- UI: a tab strip ("League", plus one tab per manager) with unread badges, and infinite scroll upward via `chat:history`.

### Exit criteria
- League messages never reach sockets in other leagues (test with 2 leagues).
- DMs reach only sender and recipient, including all their tabs.
- 500 messages paginate correctly and keys never collide (fixes Defect #11).

### ✋ Checkpoint 8 (manual)
1. League chat between A and B works both ways; messages survive a refresh (persisted + history).
2. A DMs B → only B sees it, and `carol` (a third browser/profile) does not. With B open in two tabs, both tabs get it. `erin` (`other-league`) sees neither the DM nor `test-league`'s chat.
6. Run `npm run bots -- --users=carol,dave --chat` during a live draft → chat traffic doesn't delay picks or the clock.
3. Paste-spam ~10 messages in 2 s → rate-limit error appears, then sending works again after the window.
4. Let an auto-pick happen → the system message ("… selected … (auto)") shows up in league chat.
5. Scroll up in a long conversation → older pages load without duplicates or jumps.

---

## Phase 9: Resilience, testing, deployment

### 9.1 Resilience
- Enable Socket.IO `connectionStateRecovery` (e.g. 2 min) so brief blips don't even need a re-join. The snapshot-on-reconnect path remains the fallback.
- **Presence:** `Map<leagueId, Map<userId, socketCount>>`, broadcast `presence:update` on join/disconnect. Show online dots on team cards and in the commissioner view.
- Structured logging (`pino`) for picks, auto-picks, and rejections, including draft/pick IDs.
- Health endpoint `/healthz` (DB ping + engine registry size).

### 9.2 Test pyramid
| Layer | Tool | What |
|-------|------|------|
| Unit | Vitest | `order.js`, `roster.js`, `autopick.js`, reducer |
| Integration | Vitest + real Postgres + in-process Socket.IO + `socket.io-client` | engine concurrency, timer expiry (`vi.useFakeTimers`), auth rejection, chat room isolation |
| E2E | Playwright (2–3 browser contexts) | full mini-draft, reconnect mid-draft, pause/resume |

Add a GitHub Actions workflow: Postgres service container, `npm ci`, lint, unit, integration, then e2e.

### 9.3 Deployment
- `Dockerfile` (multi-stage: `npm ci` → `next build` → `node server.js`). Run a **single instance** (on Fly: `fly scale count 1`).
- Run migrations as a release step (`drizzle-kit migrate`).
- Set `BETTER_AUTH_URL` to the public origin. Socket.IO's CORS can stay off because it's same-origin.

### ✋ Checkpoint 9 (manual, on the deployed app)
1. From two different devices (e.g. laptop + phone on cellular), log in as two managers on the public URL and run a short mock draft, including chat and a DM.
2. `/healthz` returns OK. Trigger a redeploy mid-draft → the draft resumes afterward with the correct clock.
3. Put the phone in airplane mode for ~30 s mid-draft → on reconnect the room catches up by itself.
4. Confirm HTTPS/WSS everywhere and that logging shows picks/auto-picks with IDs on the host's log viewer.

### 9.4 Scaling (only if ever needed)
More than one instance requires: `@socket.io/redis-adapter` (cross-instance broadcasts), **sticky sessions** (HTTP long-polling fallback), and a single timer owner per draft (Redis lock or Postgres advisory lock, `pg_try_advisory_lock(draftId)`). Picks stay correct because of the DB unique constraints. This is unnecessary for a handful of leagues.

---

## Suggested sequencing & effort

| Phase | Depends on | Rough size |
|-------|-----------|------------|
| 1. Stack upgrades & infra | — | S–M |
| 2. Data layer | 1 | M |
| 3. Auth & socket auth | 2 | M |
| 4. Draft engine | 3 | **L** (core of the project) |
| 5. Timer & auto-draft | 4, 6 (`canDraft`) | M |
| 6. Roster limits | 2 (can run in parallel with 3–4; pure functions) | S–M |
| 7. Client rewrite | 4 (5/6 for full UX) | M–L |
| 8. Chat | 3 (independent of 4–7) | M |
| 9. Resilience/test/deploy | all | M |

Phases 6 and 8 can be built in parallel with the engine work. Phase 6 is pure functions plus tests, and Phase 8 only needs authenticated sockets.

---

## Open questions (need product decisions)

1. **Rounds vs. roster size.** The mock rules say `numberOfRounds: 5` but `totalNumberOfPlayersAllowed: 16`. Should rounds equal roster size (standard), or is a short draft intentional?
2. **FLEX eligibility.** Should FLEX accept QB (current code) or only RB/WR/TE, with QB only in OP/superflex?
3. **IDP positions.** The data includes LB/OLB/S. Draftable or filtered out? If draftable, they need `starterPositions` / `positionMaxAllowed` entries.
4. **Auto-pick ranking.** Last season's FPTS (current data), or a projections/ADP source for the current season?
5. **Disconnected manager on the clock.** Full timer, or a shortened one?
6. **Trades.** `tradesAllowed` exists in the rules. In scope for draft day, or post-MVP?
7. **Hosting provider and DB host.** These decide the Phase 1 deploy target and `DATABASE_URL`.
