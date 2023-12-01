document.addEventListener('DOMContentLoaded', () => {
  const redCardButton = document.getElementById('red-card');
  const blackCardButton = document.getElementById('black-card');
  const resultDiv = document.getElementById('result');
  const scoreDiv = document.getElementById('score');
  const resultsTable = document.getElementById('results-table');
  const resultsTableBody = resultsTable.getElementsByTagName('tbody')[0];

  let roundResults = []; // Array to store results of each round

  const socket = io();

  redCardButton.addEventListener('click', () => selectCard('red'));
  blackCardButton.addEventListener('click', () => selectCard('black'));

  function selectCard(cardColor) {
    socket.emit('cardSelected', cardColor);
    redCardButton.disabled = true;
    blackCardButton.disabled = true;
    resultDiv.textContent = 'Waiting for the other player...';
  }

  socket.on('roundResult', (data) => {
    resultDiv.textContent = `Round ${data.round}: You received ${data.points} points.`;
    scoreDiv.textContent = `Total Score: ${data.totalScore}`;
    // Store round result
    roundResults.push({
      round: data.round,
      points: data.points,
      totalScore: data.totalScore
    });
    
    if (data.round >= 5) {
      redCardButton.disabled = true;
      blackCardButton.disabled = true;
      resultDiv.textContent += ' Game Over!';
      // Display the results table
      displayResultsTable();
    } else {
      // Enable the buttons for the next round after a short delay
      setTimeout(() => {
        redCardButton.disabled = false;
        blackCardButton.disabled = false;
      }, 2000); // 2 seconds delay
    }
  });

  function displayResultsTable() {
    resultsTable.style.display = 'table'; // Show the table
    // Populate the table with round results
    roundResults.forEach(result => {
      const newRow = resultsTableBody.insertRow();
      const roundCell = newRow.insertCell(0);
      const pointsCell = newRow.insertCell(1);
      const totalScoreCell = newRow.insertCell(2);

      roundCell.textContent = result.round;
      pointsCell.textContent = result.points;
      totalScoreCell.textContent = result.totalScore;
    });
  }

  socket.on('gameOver', () => {
    resultDiv.textContent = 'Game Over! Refresh to play again.';
    redCardButton.disabled = true;
    blackCardButton.disabled = true;
  });

  socket.on('gameReset', () => {
    resultDiv.textContent = 'The game has been reset.';
    scoreDiv.textContent = 'Score: 0';
    resultsTable.style.display = 'none'; // Hide the table
    resultsTableBody.innerHTML = ''; // Clear the table for a new game
    redCardButton.disabled = false;
    blackCardButton.disabled = false;
  });
});
