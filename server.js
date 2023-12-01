const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Store player choices and scores
let playerChoices = {};
let scores = {};
let currentRound = 0;
const maxRounds = 5; // Maximum number of rounds

io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);
  scores[socket.id] = 0; // Initialize score for the connected player
  
  socket.on('cardSelected', (cardColor) => {
    console.log(`Player ${socket.id} selected ${cardColor}`);
    playerChoices[socket.id] = cardColor;

    if (Object.keys(playerChoices).length === 2 && currentRound < maxRounds) {
      let points = calculatePoints(playerChoices);
      Object.keys(points).forEach(playerId => {
        scores[playerId] += points[playerId];
        io.to(playerId).emit('roundResult', {
          points: points[playerId],
          totalScore: scores[playerId],
          round: currentRound + 1
        });
      });
      currentRound++;
      playerChoices = {};

      if (currentRound === maxRounds) {
        currentRound = 0;
        scores = {};
        io.emit('gameOver');
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete scores[socket.id];
    currentRound = 0;
    playerChoices = {};
    scores = {};
    io.emit('gameReset');
  });
});

function calculatePoints(choices) {
  const playerIds = Object.keys(choices);
  const points = {};

  if (choices[playerIds[0]] === 'red' && choices[playerIds[1]] === 'red') {
    points[playerIds[0]] = 50;
    points[playerIds[1]] = 50;
  } else if (choices[playerIds[0]] === 'black' && choices[playerIds[1]] === 'black') {
    points[playerIds[0]] = 200;
    points[playerIds[1]] = 200;
  } else {
    points[playerIds[0]] = choices[playerIds[0]] === 'black' ? 150 : 50;
    points[playerIds[1]] = choices[playerIds[1]] === 'black' ? 150 : 50;
  }

  return points;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
