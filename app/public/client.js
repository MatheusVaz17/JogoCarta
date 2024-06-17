const socket = io('/');
const peer = new Peer();
let myVideoStream;
let myId;
var videoGrid = document.getElementById('videoDiv')
var myvideo = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}
var chat = document.getElementById('chat');
var userName = document.getElementById('userName').value;

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
            console.log(err);
        })
        call.on("close", () => {
            vid.remove();
        })
        peerConnections[call.peer] = call;
    })
}).catch(err => {
    const img = document.createElement('img');
    addImageUser(img);
})

peer.on('open', (id) => {
    myId = id;
    socket.emit("newUser", id, userName, document.getElementById('userColor').value);
    sendMessageChat('Entrou na sala!');
})

peer.on('error', (err) => {
    alert(err.type);
});

socket.on("connect", () => {
    // sendMessageChat('Entrou na sala!');
})

socket.on("userJoined", id => {
    const call = peer.call(id, myVideoStream);
    const vid = document.createElement('video');
    call.on('error', (err) => {
        console.log(err);
    })
    call.on('stream', userStream => {
        addVideo(vid, userStream);
    })
    call.on('close', () => {
        vid.remove();
    })
    peerConnections[id] = call;
})

socket.on('userDisconnect', (id, socket_id) => {
    if (peerConnections[id]) {
        peerConnections[id].close();
        sendMessageChat('Saiu da sala!', socket_id);
    }
})

function addVideo(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video);
}

function addImageUser(img){
    img.src = 'https://the8bitdeck.com/images/King.png';
    videoGrid.append(img);
}

function sendMessageChat(msg, socket_id=null){
    if(msg){
        socket.emit('chat message', socket_id !== null ? socket_id : socket.id, msg);
        msg = '';
    }
}

socket.on('chat message', function(user, msg){
    var item = document.createElement('li');
    item.textContent = user.name+': '+msg;
    item.style.backgroundColor = user.color;
    chat.appendChild(item);
    document.getElementById('chat_inputMessage').value = '';
});

const handDecks = document.getElementById('handDecks');
const showDecks = document.getElementById('showDecks');
const dealButton = document.getElementById('dealButton');

const cardWidth = '80px';
const cardHeight = '120px';

// Função para desenhar uma carta
function drawCard(card, x, y) {
    let divDeck = document.createElement('div');
    divDeck.style.width = cardWidth;
    divDeck.style.height = cardHeight;
    divDeck.style.backgroundImage = 'url("./media/sprites/'+card.value+card.suit+'.png")';
    divDeck.onclick = drawShowCard(card);
    handDecks.appendChild(divDeck);
}

function drawMainCard(card){
    showDecks.innerHTML = "";
    let divDeck = document.createElement('div');
    divDeck.style.width = cardWidth;
    divDeck.style.height = cardHeight;
    divDeck.style.backgroundImage = 'url("./media/sprites/'+card.value+card.suit+'.png")';
    divDeck.style.rotate = '27deg';
    showDecks.appendChild(divDeck);
}

function drawShowCard(card){
    let divDeck = document.createElement('div');
    divDeck.style.width = cardWidth;
    divDeck.style.height = cardHeight;
    divDeck.style.backgroundImage = 'url("./media/sprites/'+card.value+card.suit+'.png")';
    showDecks.appendChild(divDeck);
}

socket.on('clearRectCards', function(){
    handDecks.innerHTML = "";
});

socket.on('drawCards', function(card, x, y, userId){
    if(userId == socket.id){
        drawCard(card, x, y);
    }
});

socket.on('drawMainCard', function(card){
    drawMainCard(card);
});

dealButton.addEventListener('click', () => {socket.emit('dealCards', cardWidth, cardHeight)});

// const deckCanvas = document.getElementById('deckCanvas');
// const deckCtx = deckCanvas.getContext('2d');
// deckCtx.fillStyle = 'white';
// deckCtx.fillRect(10, 30, cardWidth, cardHeight);
// let imageDecks = new Image();
// imageDecks.src = './media/sprites/decks.png';
// imageDecks.onload = function() {
//     deckCtx.drawImage(imageDecks, 140, 200, 100, 120);
// }