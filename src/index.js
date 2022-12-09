// Configuration
const ROW_COUNT = Math.floor(window.outerHeight / 30); // Results in roughly 30px squres
const COLUMN_COUNT = Math.floor(window.outerWidth / 30); // Results in roughly 30px squres
const ALIVE_RATIO = 0.5; // 50 percent of cells start alive
const GENERATION_RATE_MS = 1000 / 5; // 5 FPS(ish)

// Constants
const ALIVE = 1;
const DEAD = 0;

// Generate a random number between two values inclusive of min and max
function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Create a generation of dead cells
function createGeneration(rows, columns) {
  return Array(rows)
    .fill()
    .map(() => Array(columns).fill(DEAD));
}

// Create generation with specificed ratio randomly alivened cells
function createRandomizedGeneration(rows, columns, aliveRatio) {
  const randomizedGeneration = createGeneration(rows, columns);

  const countCliveCells = rows * columns * aliveRatio;

  for (let i = 0; i < countCliveCells; i++) {
    const randomRow = randomNumberBetween(0, rows - 1);
    const randomColumn = randomNumberBetween(0, columns - 1);

    randomizedGeneration[randomRow][randomColumn] = ALIVE;
  }

  return randomizedGeneration;
}

// Clone a generation
function cloneGeneration(generation) {
  return JSON.parse(JSON.stringify(generation)); // Lazy ass clone method
}

// Check to see if a cell is alive
function isCellAlive(generation, row, column) {
  return generation[row][column] === ALIVE;
}

// Count the alive neighbours surrounding a cell
function countAliveNeighbours(generation, row, column) {
  let count = 0;

  const neighbourCoordinates = [
    [row - 1, column], // Top
    [row - 1, column + 1], // Top right
    [row, column + 1], // Right
    [row + 1, column + 1], // Bottom right
    [row + 1, column], // Bottom
    [row + 1, column - 1], // Bottom left
    [row, column - 1], // Left
    [row - 1, column - 1], // Top left
  ];

  neighbourCoordinates.forEach(([neighbourRow, neighbourColumn]) => {
    try {
      // If the neighbour is alive increment the count
      if (isCellAlive(generation, neighbourRow, neighbourColumn)) {
        count++;
      }
    } catch (error) {
      // The neighbour we are looking for does not exist
      // All cells surrounding the outside of the grid may have neighbours that do not exist
      // Alternativly I could have filtered out coordinates in the above array that are outside of bounds rather than use try/catch
    }
  });

  return count;
}

// Compute the next generation
// Rules: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
function computeNextGeneration(generation) {
  const nextGeneration = cloneGeneration(generation);

  generation.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      // Is the cell alive in the current generation
      const isAlive = isCellAlive(generation, rowIndex, columnIndex);

      // How many alive neighbours does the cell have in the current generation
      const aliveNeighbours = countAliveNeighbours(generation, rowIndex, columnIndex);

      // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
      if (isAlive && aliveNeighbours < 2) {
        nextGeneration[rowIndex][columnIndex] = DEAD;
      }
      // Any live cell with two or three live neighbours lives on to the next generation
      else if (isAlive && aliveNeighbours >= 2 && aliveNeighbours <= 3) {
        nextGeneration[rowIndex][columnIndex] = ALIVE;
      }
      // Any live cell with more than three live neighbours dies, as if by overpopulation
      else if (isAlive && aliveNeighbours > 3) {
        nextGeneration[rowIndex][columnIndex] = DEAD;
      }
      // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
      else if (!isAlive && aliveNeighbours === 3) {
        nextGeneration[rowIndex][columnIndex] = ALIVE;
      }
    });
  });

  return nextGeneration;
}

// Does a generation have no life
function isGenerationDead(generation) {
  try {
    generation.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        if (isCellAlive(generation, rowIndex, columnIndex)) {
          throw new Error('Generation not dead');
        }
      });
    });
  } catch (error) {
    return false;
  }

  return true;
}

// Renders a generation as DOM elements
function renderGeneration(generation) {
  const rowElements = generation.map((row, rowIndex) => {
    const cellElements = row.map((column, columnIndex) => {
      const cellElement = document.createElement('div');

      cellElement.classList.add('cell');
      cellElement.dataset.x = columnIndex;
      cellElement.dataset.y = rowIndex;
      cellElement.dataset.status = column;

      return cellElement;
    });

    const rowElement = document.createElement('div');

    rowElement.classList.add('row');
    rowElement.append(...cellElements);

    return rowElement;
  });

  const gridElement = document.createElement('div');

  gridElement.id = 'grid';
  gridElement.classList.add('grid');
  gridElement.append(...rowElements);

  return gridElement;
}

// TODO: User populates first generation
// function handlePaintCells(e) {
//   // Disable context menu
//   if (['contextmenu'].includes(e.type)) {
//     e.preventDefault();
//   }
//   // Cell painting
//   else if (['mousedown', 'mouseover'].includes(e.type)) {
//     const element = e.target;

//     const isCell = element.classList.contains('cell');
//     const isPrimaryButtonPressed = e.buttons === 1;
//     const isSecondaryButtonPressed = e.buttons === 2;

//     if (isCell && (isPrimaryButtonPressed || isSecondaryButtonPressed)) {
//       // Pull information about cell from element
//       // const x = parseInt(element.dataset.x, 10);
//       // const y = parseInt(element.dataset.y, 10);
//       // const status = parseInt(element.dataset.status, 10);

//       // Make cell alive
//       if (isPrimaryButtonPressed) {
//         element.dataset.status = ALIVE;
//       }
//       // Make cell dead
//       else if (isSecondaryButtonPressed) {
//         element.dataset.status = DEAD;
//       }
//     }
//   }
// }

function start(rows, columns, aliveRatio) {
  let gridElement = document.getElementById('grid');
  const gameOverElement = document.getElementById('game-over');
  const generationCountElement = document.getElementById('generation-count');
  const reloadButtonElement = document.getElementById('reload-button');

  reloadButtonElement.addEventListener('click', () => (window.location = window.location.href));

  // TODO: User plays god and manipulates population
  // ['mouseover', 'mousedown', 'contextmenu'].forEach((eventType) => app.addEventListener(eventType, handlePaintCells));

  let currentGeneration = createRandomizedGeneration(rows, columns, aliveRatio);
  let generationCount = 1;

  const lastGridElement = gridElement;
  gridElement = renderGeneration(currentGeneration);
  lastGridElement.replaceWith(gridElement);

  const interval = setInterval(() => {
    currentGeneration = computeNextGeneration(currentGeneration);
    generationCount++;

    const lastGridElement = gridElement;
    gridElement = renderGeneration(currentGeneration);
    lastGridElement.replaceWith(gridElement);

    if (isGenerationDead(currentGeneration)) {
      generationCountElement.innerHTML = generationCount;
      gameOverElement.style.display = 'block';
      clearInterval(interval);
    }
  }, GENERATION_RATE_MS);
}

start(ROW_COUNT, COLUMN_COUNT, ALIVE_RATIO);
