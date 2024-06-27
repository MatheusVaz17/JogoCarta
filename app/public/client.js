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
            vid.parentNode.remove();
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
        vid.parentNode.remove();
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
        video.play();
        let divVideo = document.createElement('div');
        divVideo.classList.add('divVideo');
        divVideo.append(video);
        videoGrid.append(divVideo);
    });
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
    divDeck.setAttribute("id", card.value+card.suit);
    divDeck.onclick = function(){
        drawShowCard(card);
    }
    handDecks.appendChild(divDeck);
}

function drawMainCard(card){
    showDecks.innerHTML = "";
    let divMainCard = document.createElement('div');
    divMainCard.style.width = cardWidth;
    divMainCard.style.height = cardHeight;
    divMainCard.style.backgroundImage = 'url("./media/sprites/'+card.value+card.suit+'.png")';
    divMainCard.style.rotate = '27deg';
    divMainCard.style.position = 'absolute';
    divMainCard.style.outline = 'dotted 3px #03df00';
    divMainCard.setAttribute("data-main-value", card.value+card.suit);
    showDecks.appendChild(divMainCard);
}

function drawShowCard(card){
    let divDeckTable = document.createElement('div');
    divDeckTable.style.width = cardWidth;
    divDeckTable.style.height = cardHeight;
    divDeckTable.style.backgroundImage = 'url("./media/sprites/'+card.value+card.suit+'.png")';
    divDeckTable.setAttribute("data-value", card.value+card.suit);
    divDeckTable.className = 'tableCard';
    showDecks.appendChild(divDeckTable);
    document.getElementById(card.value+card.suit).remove();

    let showCards = document.querySelectorAll('div[data-value]');
    let mainCard = document.querySelectorAll('div[data-main-value]')[0];

    let cardsValues = [];

    showCards.forEach(div => {
        cardsValues.push(div.getAttribute('data-value'));
    });

    socket.emit('biggestCard', cardsValues, mainCard.getAttribute('data-main-value'));
}

socket.on('clearRectCards', () => {
    handDecks.innerHTML = "";
});

socket.on('drawCards', (card, x, y, userId) => {
    if(userId == socket.id){
        drawCard(card, x, y);
    }
});

socket.on('drawMainCard', (card) => {
    drawMainCard(card);
});

socket.on('styleBiggestCard', (biggestCard, biggestSuit) => {
    let biggest = document.querySelector("div[data-value='"+biggestCard+biggestSuit+"']");
    let showCards = document.querySelectorAll('div[data-value]');

    showCards.forEach(div => {
        div.style.outline = null;
    });

    biggest.style.outline = 'dotted 3px #ffffff';
});

dealButton.addEventListener('click', () => {socket.emit('dealCards', cardWidth, cardHeight)});