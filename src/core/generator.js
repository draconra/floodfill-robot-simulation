/**
 * Randomized DFS Maze Generator for a 3x3 grid.
 * Guarantees a path from start (0,0) to target (1,1).
 */
export class MazeGenerator {
  constructor(width = 3, height = 3) {
    this.width = width;
    this.height = height;
  }

  generate() {
    // Initialize grid with all walls present
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x, y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        });
      }
      grid.push(row);
    }

    const stack = [];
    const startCell = grid[0][0];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.removeWalls(current, next);
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // Ensure it's solvable to (1,1) - technically DFS already ensures connectivity
    // but we return the cleaned-up wall data.
    return grid.map(row => row.map(cell => ({
      x: cell.x,
      y: cell.y,
      walls: cell.walls
    })));
  }

  getUnvisitedNeighbors(cell, grid) {
    const neighbors = [];
    const { x, y } = cell;

    if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]); // Top
    if (x < this.width - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]); // Right
    if (y < this.height - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]); // Bottom
    if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]); // Left

    return neighbors;
  }

  removeWalls(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) { // b is on the left
      a.walls.left = false;
      b.walls.right = false;
    } else if (dx === -1) { // b is on the right
      a.walls.right = false;
      b.walls.left = false;
    }

    if (dy === 1) { // b is on top
      a.walls.top = false;
      b.walls.bottom = false;
    } else if (dy === -1) { // b is bottom
      a.walls.bottom = false;
      b.walls.top = false;
    }
  }
}
