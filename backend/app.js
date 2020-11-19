const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const socket = require('socket.io');

const userRoutes = require("./user");
const bookRoutes = require("./book");
const genreRoutes = require("./genre");
const rBRoutes = require("./readBook");
const bookCommRoutes = require("./bookComm");
const eventRoutes = require("./event");

const app = express();

mongoose
  .connect(
    "mongodb+srv://veljo:veljo963159@prov1cluster.rxsut.mongodb.net/BazaProba1?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database!");
    // starting the server on the port number 3000 and storing the returned server variable
    const server3001 = app.listen(3001, () => {
      console.log("Server started on port " + 3001 );
    });
    const io = socket.listen(server3001);
    /* 'connection' is a socket.io event that is triggered when a new connection is
       made. Once a connection is made, callback is called. */
    io.sockets.on('connection', (socket) => { /* socket object allows us to join specific clients
        to chat rooms and also to catch
        and emit the events.*/
      // 'join event'
      socket.on('join', (data) => {
        socket.join(data.idEvent);
       /* chatRooms.find({}).toArray((err, rooms) => {
          if (err) {
            console.log(err);
            return false;
          }
          count = 0;
          rooms.forEach((room) => {
            if (room.name == data.room) {
              count++;
            }
          });
          // Create the chatRoom if not already created
          if (count == 0) {
            chatRooms.insert({ name: data.room, messages: [] });
          }
        });*/
      });
      // catching the message event
      socket.on('message', (data) => {
        // emitting the 'new message' event to the clients in that room
        console.log("U socket.on 'Message' sam");
        io.in(data.idEvent).emit('new message', { idEvent: data.idEvent});
        // save the message in the 'messages' array of that chat-room
        /*chatRooms.update({ name: data.room }, { $push: { messages: { user: data.user, message: data.message } } }, (err, res) => {
          if (err) {
            console.log(err);
            return false;
          }
        });*/
      });
      // Event when a client is typing
      /*socket.on('typing', (data) => {
        // Broadcasting to all the users except the one typing
        socket.broadcast.in(data.room).emit('typing', { data: data, isTyping: true });
      });*/
    });
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
app.use("/user", userRoutes);
app.use("/book", bookRoutes);
app.use("/genre", genreRoutes);
app.use("/readBook", rBRoutes);
app.use("/bookComm", bookCommRoutes);
app.use("/event", eventRoutes);

module.exports = app;
