import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express, { application } from "express";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

httpServer.listen(3000, () => {
  console.log("listening...");
});

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) =>{
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName)=>{
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName)=>{
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName)=>{
    socket.to(roomName).emit("ice", ice);
  });
});