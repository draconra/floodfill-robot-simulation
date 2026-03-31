/**
 * UI Event Mapping.
 * Dispatches control signals from the DOM to the Simulation Orchestrator.
 */
export class Controls {
  constructor() {
    this.btnGenerate = document.getElementById('btn-generate');
    this.btnStep = document.getElementById('btn-step');
    this.btnAuto = document.getElementById('btn-auto');
    this.btnReset = document.getElementById('btn-reset');
    this.speedSlider = document.getElementById('speed-slider');
  }

  /**
   * Binds callback listeners to the command buttons.
   */
  bind(handlers) {
    if (handlers.onGenerate) this.btnGenerate.addEventListener('click', handlers.onGenerate);
    if (handlers.onStep) this.btnStep.addEventListener('click', handlers.onStep);
    if (handlers.onAuto) this.btnAuto.addEventListener('click', handlers.onAuto);
    if (handlers.onReset) this.btnReset.addEventListener('click', handlers.onReset);
  }

  /**
   * Gets current delay value from slider for async animations.
   */
  getAnimationDelay() {
    // Return inverted value: range [50, 800]
    return parseInt(this.speedSlider.value);
  }

  /**
   * Toggles the "Auto Drive" button appearance.
   */
  setAutoState(isActive) {
    if (isActive) {
      this.btnAuto.innerText = 'STOP_DRIVE';
      this.btnAuto.classList.add('btn-active');
    } else {
      this.btnAuto.innerText = 'AUTO_DRIVE';
      this.btnAuto.classList.remove('btn-active');
    }
  }

  disableButtons(disable) {
    this.btnGenerate.disabled = disable;
    this.btnStep.disabled = disable;
    this.btnReset.disabled = disable;
  }
}
