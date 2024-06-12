const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const userRouter = require('./routes/user');
const gameRouter = require('./routes/game');

const app = express();
const port = 4000;

var users = [];

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(userRouter);
app.use(gameRouter);
app.set('views', __dirname + '/public/views');

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on("connection" , (socket)=>{

    socket.on('newUser' , (id , userName, userColor)=>{
      users[socket.id] = {name: userName, color: userColor};
      socket.broadcast.emit('userJoined' , id);
      socket.on('disconnect', ()=>{
        socket.broadcast.emit('userDisconnect' , id, socket.id);
        //delete users[socket.id];
      })
    })
    
    socket.on('chat message', (id, msg) => {
      io.emit('chat message', users[id], msg);
    })

    socket.on('dealCards', (cardWidth, cardHeight) => {
      dealCards(cardWidth, cardHeight);
    })
})

server.listen(port, ()=>{
    console.log("Server running on port "+port);
}
);

console.log('Server started at http://localhost:' + port);

function createDeck() {
  let deck = [];
  for (let suit of suits) {
      for (let value of values) {
          deck.push({ value, suit });
      }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealCards(cardWidth, cardHeight) {
  io.emit('clearRectCards');

  let deck = shuffleDeck(createDeck());

  // Distribuir 5 cartas para o Jogador 1
  for (let i = 0; i < 5; i++) {
      io.emit('drawCards', deck.pop(), 50 + i * (cardWidth + 10), 50);
  }

  // Distribuir 5 cartas para o Jogador 2
  for (let i = 0; i < 5; i++) {
      io.emit('drawCards', deck.pop(), 50 + i * (cardWidth + 10), 200);
  }
}