"use client";

import {io} from 'socket.io-client';

const Chat = () => {
    const socket = io();

    socket.on('Welcome', () => console.log('Welcomed the fuck'))

    return (
        <>
        </>
    );
};

export default Chat;