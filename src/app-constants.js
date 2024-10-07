export const POSITIONS = {
    QB: 'QB',
    RB: 'RB',
    WR: 'WR',
    TE: 'TE',
    OP: 'OP',
    FLEX: 'FLEX',
    K: 'K',
    DE: 'DE',
    LB: 'LB',
    CB: 'CB',
    S: 'S',
    KR: 'KR',
    PR: 'PR',
    DEF: 'DEF',
    BENCH: 'BENCH'
}

export const DB_TYPES = {
    STATS: 'stats',
    USERS: 'users',
    MESSAGES: 'messages',
    LEAGUES: 'leagues',
    RULES: 'league_rules',
    DRAFT_POOL: 'draft-pool'
};

export const DRAFT_TYPES = {
    SNAKE: 'snake',
    AUCTION: 'auction',
    REGULAR: 'regular'
}

export const DB_TYPE_ENUM = Object.values(DB_TYPES);
export const POSITION_ENUM = Object.values(POSITIONS);
export const DRAFT_TYPE_ENUM = Object.values(DRAFT_TYPES);

export const PREVIOUS_YEAR = new Date().getFullYear() - 1;

export const PLAYER_KEYS = {
    NAME: 'NAME',
    POSITION: 'POS',
    PTS: 'FPTS',
    TEAM: 'TEAM'
};

export const PAGINATION_SIZE = 25;

export const positionVisualOrder = [
    POSITIONS.QB,
    POSITIONS.RB,
    POSITIONS.WR,
    POSITIONS.TE,
    POSITIONS.OP,
    POSITIONS.FLEX,
    POSITIONS.DEF,
    POSITIONS.K,
    POSITIONS.BENCH
];

export const ROUTES = {
    HOME: '/',
    DRAFT_ROOM: '/draft-room'
};

export const databaseRoutes = {
    LEAGUES: DB_TYPES.LEAGUES,
    MESSAGES: DB_TYPES.MESSAGES,
    PLAYER_STATS: 'players_stats',
    RULES: DB_TYPES.RULES,
    USERS: DB_TYPES.USERS,
    DRAFT_POOL: DB_TYPES.DRAFT_POOL
};

export const SESSION_CONSTANTS = {
    LOADING: 'loading',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated'
}