import sql from 'better-sqlite3';
import slugify from "slugify";
import xss from "xss";
import fs from 'node:fs';
import path from 'node:path';
import {PositionEnum} from "@/constants/player-constants";

const db = sql('stats.db');

export const getAllPlayers = async (position = '', seasonYear = 2023) => {
    try {
        if (PositionEnum.includes(position)) {
            return db.prepare(`SELECT *
                               FROM stats
                               WHERE POS = ?
                                 AND YEAR = ?`).all(position, seasonYear);
        } else {
            return db.prepare(`SELECT *
                               FROM stats
                               WHERE YEAR = ?`).all(seasonYear);
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


