export const POSITIONS = {
    QB: 'QB',
    RB: 'RB',
    WR: 'WR',
    TE: 'TE',
    OP: 'OP',
    K: 'K',
    DE: 'DE',
    LB: 'LB',
    CB: 'CB',
    S: 'S',
    KR: 'KR',
    PR: 'PR'
}

export const PositionEnum = Object.values(POSITIONS);

export const PREVIOUS_YEAR = new Date().getFullYear() - 1;

export const PLAYER_KEYS = {
    NAME: 'NAME',
    POSITION: 'POS',
    PTS: 'FPTS'
};

export const PAGINATION_SIZE = 25;