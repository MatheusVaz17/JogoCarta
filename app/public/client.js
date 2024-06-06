const socket = io('/');
const peer = new Peer();
let myVideoStream;
let myId;
var videoGrid = document.getElementById('videoDiv')
var myvideo = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}
var chat = document.getElementById('chat');
var userName = '';

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    myVideoStream = stream;
    addVideo(myvideo, stream);
    peer.on('call', call => {
        call.answer(stream);
        const vid = document.createElement('video');
        call.on('stream', userStream => {
            addVideo(vid, userStream);
        })
        call.on('error', (err) => {
            alert(err)
        })
        call.on("close", () => {
            vid.remove();
        })
        peerConnections[call.peer] = call;
    })
}).catch(err => {
    alert(err.message)
})

peer.on('open', (id) => {
    myId = id;
    socket.emit("newUser", id, roomID);
})

peer.on('error', (err) => {
    alert(err.type);
});

socket.on("connect", () => {
    sendMessageChat('Entrou na sala!');
})

socket.on("userJoined", id => {
    const call = peer.call(id, myVideoStream);
    const vid = document.createElement('video');
    call.on('error', (err) => {
        alert(err);
    })
    call.on('stream', userStream => {
        addVideo(vid, userStream);
    })
    call.on('close', () => {
        vid.remove();
    })
    peerConnections[id] = call;
})

socket.on('userDisconnect', id => {
    if (peerConnections[id]) {
        peerConnections[id].close();
    }
    sendMessageChat('Saiu da sala!');
})

function addVideo(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video);
}

function sendMessageChat(msg){
    if(msg){
        socket.emit('chat message', socket.id, msg);
        msg = '';
    }
}

socket.on('chat message', function(user, msg){
    var item = document.createElement('li');
    item.textContent = user.name+': '+msg;
    item.style.color = user.color;
    chat.appendChild(item);
    document.getElementById('chat_inputMessage').value = '';
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dealButton = document.getElementById('dealButton');

const cardWidth = 80;
const cardHeight = 120;

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    return deck;
}

// Função para embaralhar o baralho
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Função para desenhar uma carta
function drawCard(card, x, y) {
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeRect(x, y, cardWidth, cardHeight);
    ctx.fillStyle = card.suit === '♥' || card.suit === '♦' ? 'red' : 'black';
    ctx.font = '20px Arial';
    ctx.fillText(card.value, x + 10, y + 30);
    ctx.fillText(card.suit, x + 10, y + 60);
}

function dealCards() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let deck = shuffleDeck(createDeck());

    // Distribuir 5 cartas para o Jogador 1
    for (let i = 0; i < 5; i++) {
        drawCard(deck.pop(), 50 + i * (cardWidth + 10), 50);
    }

    // Distribuir 5 cartas para o Jogador 2
    for (let i = 0; i < 5; i++) {
        drawCard(deck.pop(), 50 + i * (cardWidth + 10), 200);
    }
}

socket.on('dealCards', function(){
    dealCards();
});

dealButton.addEventListener('click', () => {socket.emit('dealCards')});