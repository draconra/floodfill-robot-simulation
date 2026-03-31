/**
 * Rendering Engine for Micromouse UI.
 * Handles DOM updates, animations, and visual state management.
 */
export class Renderer {
  constructor() {
    this.gridElement = document.getElementById('maze-grid');
    this.logElement = document.getElementById('status-log');
    this.carElement = null; // Dynamically created below to survive element destruction
  }

  /**
   * Resets and draws the empty 3x3 grid.
   */
  initializeGrid(width = 3, height = 3) {
    this.gridElement.innerHTML = '';
    this.gridElement.style.padding = '10px';
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = document.createElement('div');
        cell.className = 'maze-cell';
        cell.id = `cell-${x}-${y}`;
        cell.innerHTML = `
          <div class="wall wall-top"></div>
          <div class="wall wall-right"></div>
          <div class="wall wall-bottom"></div>
          <div class="wall wall-left"></div>
          <div class="cell-distance"></div>
        `;
        
        // Render permanent perimeter borders
        if (y === 0) cell.querySelector('.wall-top').classList.add('active', 'perimeter');
        if (y === height - 1) cell.querySelector('.wall-bottom').classList.add('active', 'perimeter');
        if (x === 0) cell.querySelector('.wall-left').classList.add('active', 'perimeter');
        if (x === width - 1) cell.querySelector('.wall-right').classList.add('active', 'perimeter');

        this.gridElement.appendChild(cell);
      }
    }
    
    // Ensure the car remains in the DOM and is dynamically initialized
    if (!this.carElement) {
      this.carElement = document.createElement('div');
      this.carElement.id = 'mouse-car';
      this.carElement.className = 'cyber-car';
      this.carElement.innerHTML = `
        <div class="car-body"></div>
        <div class="car-headlight headlight-left"></div>
        <div class="car-headlight headlight-right"></div>
        <div class="car-wheel wheel-front-left"></div>
        <div class="car-wheel wheel-front-right"></div>
        <div class="car-wheel wheel-back-left"></div>
        <div class="car-wheel wheel-back-right"></div>
      `;
    }
    this.gridElement.appendChild(this.carElement);
  }

  /**
   * Updates visual walls for a cell based on current knowledge.
   */
  renderWalls(x, y, walls) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return;
    
    Object.keys(walls).forEach(dir => {
      const wallEl = cell.querySelector(`.wall-${dir}`);
      
      // Do not hide solid perimeter walls
      if (wallEl.classList.contains('perimeter')) return;
      
      if (walls[dir]) {
        wallEl.classList.add('active');
      } else {
        wallEl.classList.remove('active');
      }
    });
  }

  /**
   * Updates cell distance value with a smooth highlight animation.
   */
  renderDistance(x, y, distance) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return;
    const distEl = cell.querySelector('.cell-distance');
    
    const displayValue = distance === Infinity ? '?' : (distance === 0 ? '0▲' : distance);
    if (distEl.innerText !== displayValue.toString()) {
      distEl.innerText = displayValue;
    }
  }

  /**
   * Animates robot movement to a new cell with specific orientation.
   */
  renderMouse(x, y, degrees = 0) {
    const targetCell = document.getElementById(`cell-${x}-${y}`);
    if (!targetCell || !this.carElement) return;

    // Get positions relative to the maze grid (which is now the immediate parent)
    const gridRect = this.gridElement.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();

    const offsetX = cellRect.left - gridRect.left;
    const offsetY = cellRect.top - gridRect.top;
    
    // Center the car (100x100) in the cell
    const centerX = offsetX + (cellRect.width / 2) - (this.carElement.offsetWidth / 2);
    const centerY = offsetY + (cellRect.height / 2) - (this.carElement.offsetHeight / 2);

    this.carElement.style.transform = `translate(${centerX}px, ${centerY}px) rotate(${degrees}deg)`;
    this.carElement.style.opacity = '1';
  }

  /**
   * Appends a message to the CRT status log.
   */
  log(message) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerText = `> ${message.toUpperCase()}...`;
    this.logElement.appendChild(line);
    
    // Auto-scroll to bottom
    this.logElement.scrollTop = this.logElement.scrollHeight;
    
    // Limit log size
    while (this.logElement.childNodes.length > 30) {
      this.logElement.removeChild(this.logElement.firstChild);
    }
  }
}
