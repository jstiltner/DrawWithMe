'use strict';
const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000; //eslint-disable-line

app.set('view engine', 'jade');

app.use(express.static('./'))

server.listen(8080);

if (process.env.HEROKU === 'true') {
    io.configure(function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 10);
    });
}

app.get('/', (req, res) => {
  res.render('index')
})

io.sockets.on('connection', (socket) => {
  socket.on('mousemove', (data) => {
    socket.broadcast.emit('moving', data);
  });
});


server.listen(PORT, function(err) {
    if(!err) { console.log("Listening on port " + PORT); }
});

