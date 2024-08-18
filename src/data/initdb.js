const sql = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const db = sql('stats.db');

const data_22_path = path.join(__dirname, '2022.json');
const data_23_path = path.join(__dirname, '2023.json');

db.prepare(`
    CREATE TABLE IF NOT EXISTS stats
    (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME          TEXT    NOT NULL,
        YEAR          INTEGER NOT NULL,
        TEAM          TEXT    DEFAULT 'FA',
        POS           TEXT    NOT NULL,
        GP            INTEGER DEFAULT 0,
        PASSING_YDS   INTEGER DEFAULT 0,
        PASSING_TD    INTEGER DEFAULT 0,
        PASSING_INT   INTEGER DEFAULT 0,
        RUSHING_YDS   INTEGER DEFAULT 0,
        RUSHING_TD    INTEGER DEFAULT 0,
        REC           INTEGER DEFAULT 0,
        RECEIVING_YDS INTEGER DEFAULT 0,
        SCK           INTEGER DEFAULT 0,
        DEFENSIVE_INT INTEGER DEFAULT 0,
        FF            INTEGER DEFAULT 0,
        FR            INTEGER DEFAULT 0,
        FPTSG         INTEGER DEFAULT 0,
        FPTS          INTEGER DEFAULT 0
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS messages
    (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content       TEXT,
        author        TEXT
    )
`).run();

const readData = (filePath, seasonYear) => {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data).map(playerStat => ({...playerStat, YEAR: seasonYear}));
}

const stats22 = readData(data_22_path, 2022);
const stats23 = readData(data_23_path, 2023);

async function initData() {
    const statement = db.prepare(`
        INSERT INTO stats
        VALUES (null,
                @NAME,
                @YEAR,
                @TEAM,
                @POS,
                @GP,
                @PASSING_YDS,
                @PASSING_TD,
                @PASSING_INT,
                @RUSHING_YDS,
                @RUSHING_TD,
                @REC,
                @RECEIVING_YDS,
                @SCK,
                @DEFENSIVE_INT,
                @FF,
                @FR,
                @FPTSG,
                @FPTS)
    `);

    stats22.forEach(stat => statement.run(stat));
    stats23.forEach(stat => statement.run(stat));
}

initData();