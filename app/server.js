const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const userRouter = require('./routes/user');
const gameRouter = require('./routes/game');

const app = express();
const port = 4000;

var numDecks = 0;

var users = [];

const suits = ['♦','♠', '♥','♣'];
const values = ['4', '5', '6', '7', '10', '11', '12', '1', '2', '3'];

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

    socket.on('biggestCard', (cards, mainCard) => {
      biggestCard(cards, mainCard);
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

function biggestCard(cards, mainCard){
  //console.log(cards);
  let biggestCard = '';
  let biggestSuit = '';
  let mainValue = mainCard.split("")[0];
  cards.forEach((item) => {
    //console.log(item.split("")[0]);
    let value = item.split("")[0];
    let suit = item.split("")[1];

    if((values.indexOf(value) - 1) == values.indexOf(mainValue)){
      biggestCard = value;
      biggestSuit = suit;
    }else{
      if(biggestCard.length > 0 && (values.indexOf(biggestCard) - 1) == values.indexOf(mainValue)){
        if(suits.indexOf(suit) > suits.indexOf(biggestSuit)){
          biggestCard = value;
          biggestSuit = suit;
        }
      }else{
        if(biggestCard.length < 1 || values.indexOf(value) > values.indexOf(biggestCard)){
          biggestCard = value;
          biggestSuit = suit;
        }
      }
    }

    
  });
  console.log(biggestCard);
  console.log(biggestSuit);
}