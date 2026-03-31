/**
 * Floodfill Algorithm for Micromouse Shortest Path.
 * Calculates distance from all cells to a target (usually the center).
 */
export class FloodFill {
  constructor(width = 3, height = 3) {
    this.width = width;
    this.height = height;
  }

  /**
   * Recalculates distances from each cell to (targetX, targetY).
   * @param {number} targetX - Target X coordinate.
   * @param {number} targetY - Target Y coordinate.
   * @param {Array} knownWalls - 2D array of known wall states.
   * @param {Function} onStep - Optional callback for visualization.
   */
  async calculateDistances(targetX, targetY, knownWalls, onStep) {
    const distances = Array.from({ length: this.height }, () => 
      Array(this.width).fill(Infinity)
    );
    
    // Start from the target with distance 0
    distances[targetY][targetX] = 0;
    const queue = [{ x: targetX, y: targetY }];
    const processed = new Set();

    while (queue.length > 0) {
      const current = queue.shift();
      const posKey = `${current.x},${current.y}`;
      if (processed.has(posKey)) continue;
      processed.add(posKey);

      if (onStep) {
        await onStep(current.x, current.y, distances[current.y][current.x]);
      }

      const neighbors = this.getAccessibleNeighbors(current, knownWalls);
      for (const neighbor of neighbors) {
        if (distances[neighbor.y][neighbor.x] === Infinity) {
          distances[neighbor.y][neighbor.x] = distances[current.y][current.x] + 1;
          queue.push(neighbor);
        }
      }
    }

    return distances;
  }

  getAccessibleNeighbors(cell, knownWalls) {
    const neighbors = [];
    const { x, y } = cell;
    const walls = knownWalls[y][x];

    // Directions: Map wall name to coordinate changes
    const config = [
      { dx: 0, dy: -1, wall: 'top' },
      { dx: 1, dy: 0, wall: 'right' },
      { dx: 0, dy: 1, wall: 'bottom' },
      { dx: -1, dy: 0, wall: 'left' }
    ];

    for (const dir of config) {
      if (!walls[dir.wall]) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }

    return neighbors;
  }
}
