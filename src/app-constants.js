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
    DEF: 'DEF'
}

export const DB_TYPES = {
    STATS: 'stats',
    USERS: 'users',
    MESSAGES: 'messages',
    LEAGUES: 'leagues',
    RULES: 'league_rules',
    DRAFT_POOL: 'draft-pool'
};

export const DB_TYPE_ENUM = Object.values(DB_TYPES);

export const PositionEnum = Object.values(POSITIONS);

export const PREVIOUS_YEAR = new Date().getFullYear() - 1;

export const PLAYER_KEYS = {
    NAME: 'NAME',
    POSITION: 'POS',
    PTS: 'FPTS'
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
    POSITIONS.K
];

export const ROUTES = {
    HOME: '/',
    DRAFT_ROOM: '/draft-room'
};

export const databaseRoutes = {
    LEAGUES: DB_TYPES.LEAGUES,
    MESSAGES: DB_TYPES.MESSAGES,
    PLAYER_STATS_2022: 'players_stats_2022',
    PLAYER_STATS_2023: 'players_stats_2023',
    RULES: DB_TYPES.RULES,
    USERS: DB_TYPES.USERS,
    DRAFT_POOL: DB_TYPES.DRAFT_POOL
};

export const SESSION_CONSTANTS = {
    LOADING: 'loading',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated'

}