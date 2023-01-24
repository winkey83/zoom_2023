const socket = io();

let roomName;

function enterRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

function addMessage(msg){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}

const welcome = document.getElementById("welcome");
welcome.querySelector("form").addEventListener("submit",handleRoomSubmit);

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = event.target.querySelector("input");
    socket.emit("enter_room", input.value, enterRoom);
    roomName = input.value;
    input.value = "";
}

const room = document.getElementById("room");
room.querySelector("#nickname").addEventListener("submit", handleNicknameSubmit);
room.querySelector("#msg").addEventListener("submit", handleMessageSubmit);
room.hidden = true;

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = event.target.querySelector("input");
    const value = input.value;
    socket.emit("nickname", input.value);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = event.target.querySelector("input");
    const value = input.value;
    socket.emit("new_message", roomName, input.value, ()=>{
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

socket.on("welcome", (user)=>{
    addMessage(`${user} Joined`);
});

socket.on("bye", (user)=>{
    addMessage(`${user} Left`);
});

socket.on("new_message", addMessage);