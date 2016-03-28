'use strict';
const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000; //eslint-disable-line

app.set('view engine', 'jade');

app.use(express.static('./'))

server.listen(8080);

app.get('/', (req, res) => {
  res.render('index')
})

io.sockets.on('connection', (socket) => {
  socket.on('mousemove', (data) => {
    socket.broadcast.emit('moving', data);
  });
});
