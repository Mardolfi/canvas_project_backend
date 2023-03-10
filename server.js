require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 3333;
const cors = require("cors");

// 'http://localhost:3000'

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "https://canvas-multiplayer-game-test.herokuapp.com",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("server is up and running");
});

let players = [];

let objective = {
  name: "objective",
  position: {
    x: Math.ceil((Math.random() * 490) / 10) * 10,
    y: Math.ceil((Math.random() * 490) / 10) * 10,
  },
};

let time = 10000;

io.on("connection", (socket) => {
  console.log(`Socket: ${socket.id}`);

  socket.on("newPlayer", (player) => {
    players.push(player);
    socket.emit("updatePlayers", players);
    socket.broadcast.emit("updatePlayers", players);

    let timeLeft = setTimeout(() => {
      const updatePlayers = players.filter(
        (players) => players.name != player.name
      );
      players = updatePlayers;
      socket.emit("updatePlayers", players);
      socket.broadcast.emit("updatePlayers", players);
    }, time);

    socket.on("movePlayer", (playerMoving) => {
      clearTimeout(timeLeft);
      timeLeft = setTimeout(() => {
        const updatePlayers = players.filter(
          (players) => players.name != playerMoving.name
        );
        players = updatePlayers;
        socket.emit("updatePlayers", players);
        socket.broadcast.emit("updatePlayers", players);
      }, time);
    });
  });

  socket.on("playerLeft", (name) => {
    const updatePlayers = players.filter((player) => player.name != name);
    players = updatePlayers;
    socket.emit("updatePlayers", players);
    socket.broadcast.emit("updatePlayers", players);
  });

  socket.on("playerPoint", () => {
    objective.position = {
      x: Math.ceil((Math.random() * 490) / 10) * 10,
      y: Math.ceil((Math.random() * 490) / 10) * 10,
    };
    socket.emit("updatePlayers", players);
    socket.broadcast.emit("updatePlayers", players);
  });

  socket.on("movePlayer", (playerMoving) => {
    const playerMovingIndex = players.findIndex(
      (player) => player.name == playerMoving.name
    );
    players.splice(playerMovingIndex, 1, playerMoving);
    socket.emit("updatePlayers", players);
    socket.broadcast.emit("updatePlayers", players);
  });

  if (players.length > 1) {
    players.push(objective);
    socket.emit("updatePlayers", players);
    socket.broadcast.emit("updatePlayers", players);
  }

  if (players.length < 1) {
    const updatedPlayers = players.filter(
      (player) => player.name != "objective"
    );
    players = updatedPlayers;
    socket.emit("updatePlayers", players);
    socket.broadcast.emit("updatePlayers", players);
  }
});

server.listen(port, (err) =>
  err ? console.log(err) : console.log(`Listening on ${port}`)
);
