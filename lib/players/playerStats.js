'use server';

import {PositionEnum} from "../../app-constants.js";

export const getAllPlayers = async (position = '', seasonYear = 2023) => {
    const isRealPos = PositionEnum.includes(position);
    return [];
};

export const getPlayer = slug => {
   return {};
};


