const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
const port = 4000;
const colorsName = ['#4287f5', '#f22e2e', '#3ceb10', '#e0eb10', '#542020'];
var userName = '';
var userColor = '';
var users = [];

app.set("view engine", "ejs"); 

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/access', (req, res) => {
    if (!req.body.name) {
      res.redirect('/');
    }
    
    userName = req.body.name;
    userColor = colorsName[Math.floor(Math.random()*colorsName.length)];
    res.sendFile(path.join(__dirname, '/public/game.html'));
});

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on("connection" , (socket)=>{

    users[socket.id] = {name: userName, color: userColor};

    socket.on('newUser' , (id , room)=>{
      socket.broadcast.emit('userJoined' , id);
      socket.on('disconnect' , ()=>{
        delete users[socket.id];
        socket.broadcast.emit('userDisconnect' , id);
      });
    })
    
    socket.on('chat message', (id, msg) => {
      io.emit('chat message', users[id], msg);
    })

    socket.on('dealCards', () => {
      io.emit('dealCards');
    })
})
 
server.listen(port, ()=>{
    console.log("Server running on port "+port);
}
);

console.log('Server started at http://localhost:' + port);