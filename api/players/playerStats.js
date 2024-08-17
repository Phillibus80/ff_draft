import sql from 'better-sqlite3';
import slugify from "slugify";
import xss from "xss";
import fs from 'node:fs';
import path from 'node:path';
import {PositionEnum} from 'constants/player-constants.js';

const db = sql('stats.db');

export const getAllPlayers = (position = '', seasonYear = 2024) => {
    try {
        if (PositionEnum.includes(position)) {
            return db.prepare(`SELECT *
                               FROM stats
                               WHERE POS = ?
                                 AND YEAR = ?`).get(position, seasonYear);
        } else {
            return db.prepare(`SELECT *
                               FROM stats`).all();
        }
    } catch (e) {
        console.error('Error getting the players from the database.', e.getError());
    }
};

export const getPlayer = slug => {
    try {
        db.prepare(`
            SELECT *
            FROM stats
            WHERE NAME = ?
        `).get(slug);
    } catch (e) {
        console.error(`Error getting the player: ${slug} from the database.`, e.getError());
    }
};


