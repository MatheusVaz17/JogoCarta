const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
const port = 3000;
const colorsName = ['#4287f5', '#f22e2e', '#3ceb10', '#e0eb10', '#542020'];
var userName = '';
var colorName = '';

app.set("view engine", "ejs"); 

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/access', (req, res) => {
    if (!req.body.name) {
      res.redirect('/');
    }
    
    userName = req.body.name;
    colorName = colorsName[Math.floor(Math.random()*colorsName.length)];
    res.sendFile(path.join(__dirname, '/public/game.html'));
});

//app.listen(port);

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on("connection" , (socket)=>{
    socket.on('newUser' , (id , room)=>{
      socket.broadcast.emit('userJoined' , id);
      socket.on('disconnect' , ()=>{
          socket.broadcast.emit('userDisconnect' , id);
      })
    })
    socket.on('chat message', (msg) => {
      io.emit('chat message', userName, colorName, msg);
    })
})
 
server.listen(4000, ()=>{
    console.log("Server running on port 4000");
}
);

console.log('Server started at http://localhost:' + port);