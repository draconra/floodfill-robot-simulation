/**
 * Main Entry Point - Simulation Orchestrator.
 * Tying together Algorithm, Logic, and UI in a clean feature-isolated architecture.
 */
import { MazeGenerator } from './core/generator.js';
import { FloodFill } from './core/floodfill.js';
import { Mouse } from './core/mouse.js';
import { Renderer } from './ui/renderer.js';
import { Controls } from './ui/controls.js';

class SimulationOrchestrator {
  constructor() {
    this.renderer = new Renderer();
    this.controls = new Controls();
    this.generator = new MazeGenerator(3, 3);
    this.floodfill = new FloodFill(3, 3);
    this.mouse = new Mouse(3, 3);

    this.actualMaze = null;
    this.isAutoSolving = false;
    this.isCalculating = false;
    this.targetPos = { x: 1, y: 1 };
    this.currentDegrees = 0; // 0=N, 90=E, 180=S, 270=W
    
    this.init();
  }

  /**
   * Initializes UI and event listeners.
   */
  async init() {
    this.renderer.initializeGrid(3, 3);
    this.controls.bind({
      onGenerate: () => this.handleGenerate(),
      onStep: () => this.handleStep(),
      onAuto: () => this.handleAuto(),
      onReset: () => this.handleReset()
    });
    
    this.renderer.log("SYSTEM_KERNEL_LOADED");
    await this.handleGenerate();
  }

  /**
   * Generates a new maze and resets simulation state.
   */
  async handleGenerate() {
    if (this.isCalculating) return;
    
    this.isAutoSolving = false;
    this.controls.setAutoState(false);
    
    // Pick a new random destination that isn't the (0,0) start cell OR the (1,1) center cell
    do {
      this.targetPos.x = Math.floor(Math.random() * 3);
      this.targetPos.y = Math.floor(Math.random() * 3);
    } while (
      (this.targetPos.x === 0 && this.targetPos.y === 0) || 
      (this.targetPos.x === 1 && this.targetPos.y === 1)
    );
    
    this.actualMaze = this.generator.generate();
    this.mouse = new Mouse(3, 3);
    this.currentDegrees = 0;
    
    this.renderer.initializeGrid(3, 3);
    
    // Visually unveil all walls instantly upon generation
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        this.renderer.renderWalls(x, y, this.actualMaze[y][x].walls);
      }
    }

    this.renderer.renderMouse(this.mouse.x, this.mouse.y, this.currentDegrees);
    this.renderer.log(`NEW_TARGET: ${this.targetPos.x},${this.targetPos.y}`);
    
    await this.syncDistances(true); // Initial fast sync
  }

  /**
   * Performs one cycle of the floodfill-solve loop.
   */
  async handleStep() {
    if (this.isCalculating) return;
    if (this.mouse.x === this.targetPos.x && this.mouse.y === this.targetPos.y) {
        this.renderer.log("ALREADY_AT_DESTINATION");
        return;
    }
    await this.performLogicCycle();
  }

  /**
   * Manages the auto-solve loop states.
   */
  handleAuto() {
    this.isAutoSolving = !this.isAutoSolving;
    this.controls.setAutoState(this.isAutoSolving);
    
    if (this.isAutoSolving) {
      this.renderer.log("AUTO_SOLVE_ENGAGED");
      this.executeAutoLoop();
    } else {
      this.renderer.log("AUTO_SOLVE_HALTED");
    }
  }

  async executeAutoLoop() {
    while (this.isAutoSolving) {
      if (this.mouse.x === this.targetPos.x && this.mouse.y === this.targetPos.y) {
        this.renderer.log("DESTINATION_REACHED");
        break;
      }
      
      await this.performLogicCycle();
      
      if (!this.isAutoSolving) break;
      await new Promise(r => setTimeout(r, this.controls.getAnimationDelay()));
    }
    
    this.isAutoSolving = false;
    this.controls.setAutoState(false);
  }

  /**
   * Resets the system state.
   */
  async handleReset() {
    this.isAutoSolving = false;
    this.controls.setAutoState(false);
    this.mouse = new Mouse(3, 3);
    this.currentDegrees = 0;
    this.renderer.initializeGrid(3, 3);

    // Visually unveil all walls instantly upon reset
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        this.renderer.renderWalls(x, y, this.actualMaze[y][x].walls);
      }
    }

    this.renderer.renderMouse(this.mouse.x, this.mouse.y, this.currentDegrees);
    this.renderer.log("CORE_SYSTEM_REBOOT");
    await this.syncDistances(true);
  }

  getHeading(fx, fy, tx, ty) {
    if (ty < fy) return 0;   // North
    if (tx > fx) return 90;  // East
    if (ty > fy) return 180; // South
    if (tx < fx) return 270; // West
    return this.currentDegrees;
  }

  /**
   * Core logic sequence: SENSE -> CALCULATE SHORTEST PATH -> MOVE.
   */
  async performLogicCycle() {
    this.isCalculating = true;
    this.controls.disableButtons(true);

    // 1. SENSE NEW WALLS
    const currentActualCell = this.actualMaze[this.mouse.y][this.mouse.x];
    this.mouse.sense(currentActualCell);
    this.renderer.renderWalls(this.mouse.x, this.mouse.y, this.mouse.knownWalls[this.mouse.y][this.mouse.x]);
    this.renderer.log(`SENSING_GRID_${this.mouse.x}_${this.mouse.y}`);

    // 2. RECALCULATE FLOODFILL (The educational visual ripple)
    // Reduce visual delay for calculations slightly relative to the move speed
    const calcDelay = Math.max(20, this.controls.getAnimationDelay() / 4);
    
    const distances = await this.floodfill.calculateDistances(
      this.targetPos.x,
      this.targetPos.y,
      this.mouse.knownWalls,
      async (x, y, d) => {
        this.renderer.renderDistance(x, y, d);
        await new Promise(r => setTimeout(r, calcDelay));
      }
    );

    // 3. DECIDE & MOVE
    const nextMove = this.mouse.decideNextMove(distances);
    if (nextMove) {
      // Calculate rotation
      const newDegrees = this.getHeading(this.mouse.x, this.mouse.y, nextMove.x, nextMove.y);
      this.currentDegrees = newDegrees;

      this.mouse.move(nextMove.x, nextMove.y);
      this.renderer.renderMouse(this.mouse.x, this.mouse.y, this.currentDegrees);
      this.renderer.log(`NAV_TO_${nextMove.x}_${nextMove.y}`);
    } else {
        this.renderer.log("ERROR_NO_PATH_VALID");
    }

    this.isCalculating = false;
    this.controls.disableButtons(false);
  }

  /**
   * Re-syncs the distance grid instantly (used for init/reset).
   */
  async syncDistances(fast = false) {
    const distances = await this.floodfill.calculateDistances(
        this.targetPos.x, 
        this.targetPos.y, 
        this.mouse.knownWalls
    );
    
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        this.renderer.renderDistance(x, y, distances[y][x]);
      }
    }
  }
}

// Global initialization
window.addEventListener('load', () => {
    new SimulationOrchestrator();
});
