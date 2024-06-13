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
    item.style.color = user.color;
    chat.appendChild(item);
    document.getElementById('chat_inputMessage').value = '';
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dealButton = document.getElementById('dealButton');

const cardWidth = 80;
const cardHeight = 120;

// Função para desenhar uma carta
function drawCard(card, x, y) {
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, cardWidth, cardHeight);
    let imageCard = new Image();
    imageCard.src = './media/sprites/'+card.value+card.suit+'.png';
    imageCard.onload = function() {
        ctx.drawImage(imageCard, x, y, cardWidth, cardHeight);
    }
}

socket.on('clearRectCards', function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('drawCards', function(card, x, y){
    drawCard(card, x, y);
});

dealButton.addEventListener('click', () => {socket.emit('dealCards', cardWidth, cardHeight)});