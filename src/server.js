import http from "http"
import SocketIO from "socket.io"
import express, { application } from "express"


const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
    socket.onAny(event=>{
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    });
});


/*
const wss = new WebSocket.Server({ server });

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
*/

httpServer.listen(3000, 
    () => { console.log('listening...') }
);