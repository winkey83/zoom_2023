import http from "http"
import WebSocket from "ws";
import express, { application } from "express"


const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const handleListen = () => { console.log('listening...') };


const sockets = [];

wss.on("connection", (socket) => { 
    sockets.push(socket);
    socket["nickname"]="NoName"
    console.log("Connected to Browser ✔");

    socket.on("close", ()=> console.log("Disconnected from Browser ⛔"));
    socket.on("message", (msg)=> {
        const parsed = JSON.parse(msg);
        const payload = parsed.payload.toString('utf8');
        switch(parsed.type) {
            case "new_message":
                sockets.forEach((x)=>{x.send(`${socket.nickname}: ${payload}`);});    
            case "nickname":
                socket["nickname"] = payload;
        }
    });
});

server.listen(3000, handleListen);