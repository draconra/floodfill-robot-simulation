/**
 * Micromouse Robot Class.
 * Tracks current position, discovered walls, and next-step decision making.
 */
export class Mouse {
  constructor(width = 3, height = 3, startX = 0, startY = 0) {
    this.width = width;
    this.height = height;
    this.x = startX;
    this.y = startY;
    this.resetKnownWalls();
  }

  /**
   * Resets the mouse's memory of the maze walls.
   * Outer boundaries are assumed to be known.
   */
  resetKnownWalls() {
    this.knownWalls = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          top: y === 0,
          right: x === this.width - 1,
          bottom: y === this.height - 1,
          left: x === 0
        });
      }
      this.knownWalls.push(row);
    }
  }

  /**
   * "Sensors" read the actual maze barriers in its current cell.
   * @param {Object} actualMazeCell - The actual wall state from the generator.
   */
  sense(actualMazeCell) {
    const walls = { ...actualMazeCell.walls };
    this.knownWalls[this.y][this.x] = walls;

    // Mutate the neighboring cells as well because walls are shared boundaries.
    // This prevents floodfill from creating false paths backwards through known walls.
    if (this.y > 0) this.knownWalls[this.y - 1][this.x].bottom = walls.top;
    if (this.x < this.width - 1) this.knownWalls[this.y][this.x + 1].left = walls.right;
    if (this.y < this.height - 1) this.knownWalls[this.y + 1][this.x].top = walls.bottom;
    if (this.x > 0) this.knownWalls[this.y][this.x - 1].right = walls.left;
  }

  /**
   * Determines the next cell to move into based on the distance grid.
   * Looks for the adjacent accessible cell with the lowest value.
   * @param {Array} distances - The current distance grid from Floodfill.
   */
  decideNextMove(distances) {
    const directions = [
      { dx: 0, dy: -1, wall: 'top' },
      { dx: 1, dy: 0, wall: 'right' },
      { dx: 0, dy: 1, wall: 'bottom' },
      { dx: -1, dy: 0, wall: 'left' }
    ];

    let bestMove = null;
    let minDistance = distances[this.y][this.x];

    const currentWalls = this.knownWalls[this.y][this.x];

    for (const dir of directions) {
      if (!currentWalls[dir.wall]) {
        const nx = this.x + dir.dx;
        const ny = this.y + dir.dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const dist = distances[ny][nx];
          if (dist < minDistance) {
            minDistance = dist;
            bestMove = { x: nx, y: ny };
          }
        }
      }
    }
    
    return bestMove;
  }

  move(newX, newY) {
    this.x = newX;
    this.y = newY;
  }
}
