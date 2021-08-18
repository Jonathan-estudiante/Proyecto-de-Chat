const path = require('path');
const express = require('express');
const app = express();

//settings o configuraciones iniciales
app.set('port', process.env.PORT || 3000);

// archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

//start the server o iniciar server
const server = app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});

const SocketIO = require('socket.io');
const io = SocketIO(server);

// declaramos websockets
io.on('connection', (socket) => {
    socket.on('join', data => {
        socket.user = { ...data, id: socket.client.id };
        const activeUsers = socket.client.conn.server.clientsCount;
        socket.emit('login', { activeUsers, user: socket.data });
        socket.broadcast.emit('new user', { activeUsers, data: socket.data });
      });

    socket.on('chat:message', (data) => {
        io.sockets.emit('chat:message', data);
    });

    socket.on('chat:typing', (data) => {
        socket.broadcast.emit('chat:typing', data)
    });
    socket.on('disconnect', () => {
        console.log('User disconnected!');
        socket.broadcast.emit('left', {
          activeUsers: socket.client.conn.server.clientsCount,
          user: socket.user
        });
      });

});
