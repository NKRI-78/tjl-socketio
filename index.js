require("dotenv").config();

const express = require('express');
const { createServer } = require('http');

const jwt = require("jsonwebtoken");

const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    pingInterval: 2500,
    pingTimeout: 10000,
    maxHttpBufferSize: 1e8
});

function setUserId(socket) {
    let handshake = socket.handshake;

    var authorization = handshake.headers.authorization;

    if (authorization == undefined) return;

    console.log(`=== TOKEN ${authorization} ===`);

    jwt.verify(authorization, process.env.SECRET_KEY, function (err, user) {
        if (!err) {
            socket.join(user.uid);
        }
    })
}

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    setUserId(socket)

    socket.on("join", (message) => handleJoin(message));
    socket.on("leave", (message) => handleLeave(message));
});

async function handleJoin(message) {
    const { user_id } = message;
    console.log(`User's ${user_id} joined`);
    io.emit("user_online", {
        user_id: user_id
    });
}

async function handleLeave(message) {
    const { user_id } = message;
    console.log(`User's ${user_id} left`);
    socket.leave(user_id);
    io.emit("user_offline", { 
        user_id: user_id 
    });
}

server.listen(process.env.PORT, () => {
    console.log(`Socket.IO server running on port ${process.env.PORT}`);
});