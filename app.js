require("dotenv").config()

const { createServer } = require('http')
const { Server } = require("socket.io")

const express = require('express')
const moment = require('moment')

const jwt = require('jsonwebtoken')

const app = express()

const server = createServer(app)

const io = new Server(server)
 
function setUserId(socket) {
    let handshake = socket.handshake;

    var authorization = handshake.auth.token;

    if (authorization == undefined) return;

    jwt.verify(authorization, process.env.SECRET_KEY, async function (err, user) {
        if (!err) {
            console.log(`User ${user.id} joined`)

            socket.join(user.id);
        }
    })
}

io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    console.log(`[Socket.IO] Client with IP ${clientIp} has connected`);

    setUserId(socket)
    
    socket.on('leave', async (message) => {
        const { user_id } = message;

        socket.leave(user_id);
    });

    socket.on('apply_job_result', async(message) => {
        console.log('=== APPLY JOB RESULT ===');
        io.emit('apply_job_result', message);
    });

    socket.on('apply_job', async (message) => {
        console.log('=== APPLY JOB ===');

        const { job_id } = message;

        const payload = {
            type: 'apply_job',
            job_id: job_id
        };

        io.emit('apply_job_result', payload);
    });

    socket.on('notification_apply_job_badge_count_result', async(message) => {
        console.log('=== NOTIFICATION APPLY JOB BADGE COUNT RESULT ===');
        io.emit('notification_apply_job_badge_count_result', message);
    });

    socket.on("notification_apply_job_badge_count", async (message) => {
        console.log('=== NOTIFICATION APPLY JOB BADGE COUNT ===');

        const { job_id } = message;

        const payload = {
            type: "notification_apply_job_badge_count",
            job_id: job_id
        }

        io.emit("notification_apply_job_badge_count_result", payload);
    });

});
  
server.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}`);
});