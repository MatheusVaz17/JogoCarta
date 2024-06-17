const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const userRouter = require('./routes/user');
const gameRouter = require('./routes/game');

const app = express();
const port = 4000;

var numDecks = 0;

var users = [];

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '10', 'J', 'Q', 'K'];

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
      users[socket.id] = {socket_id: socket.id, name: userName, color: userColor};
      socket.broadcast.emit('userJoined' , id);
      socket.on('disconnect', ()=>{
        socket.broadcast.emit('userDisconnect' , id, socket.id);
        delete users[socket.id];
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
  numDecks++;
  if((numDecks * Object.keys(users).length) >= 40 || numDecks >= 8){
    numDecks = 1;
  }
  const totalWidth = numDecks * cardWidth + (numDecks - 1) * 10;
  const initialX = (800 - totalWidth) / 2;

  Object.keys(users).forEach(key => {
    for (let i = 0; i < numDecks; i++) {
      let positionX = initialX + i * (cardWidth + 10);
      io.emit('drawCards', deck.pop(), positionX, 20, users[key].socket_id);
    }
  });
  io.emit('drawMainCard', deck.pop());
}