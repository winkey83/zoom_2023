function makeMessage(type, payload) {
    return JSON.stringify({type, payload});
}


//-----------------------------------------------------
// socket
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Connected to Server ✔");
});

socket.addEventListener("message", (msg)=> {
    const li = document.createElement("li");
    li.innerText = msg.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server ⛔");
});


//-----------------------------------------------------
// nick
const nickForm = document.querySelector("#nick");

nickForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
});


//-----------------------------------------------------
// message
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");

messageForm.addEventListener("submit", (event)=> {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));

    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.append(li);

    input.value="";
});