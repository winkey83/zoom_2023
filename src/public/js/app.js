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
const room = document.getElementById("room");
room.hidden = true;

welcome.querySelector("form").addEventListener("submit", (event)=>{
    event.preventDefault();
    const input = event.target.querySelector("input");
    socket.emit("enter_room", { payload: input.value }, enterRoom);
    roomName = input.value;
    input.value = "";
});

socket.on("welcome", ()=>{
    console.log("asdfsa");
    addMessage("SomeoneJoined");
})