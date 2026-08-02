/**
 * AIOrb Custom Element (<ai-orb>)
 * Exact 1:1 Web Component implementation of the Uiverse React styled-components loader.
 * Scaled dynamically via CSS transform scale for pixel-perfect SVG polygon mask rendering.
 * 
 * Usage:
 *   <ai-orb size="280" glow="true"></ai-orb>
 *   <ai-orb size="42"></ai-orb>
 *   <ai-orb size="180"></ai-orb>
 */

let orbInstanceCounter = 0;

class AIOrb extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'glow', 'animate'];
  }

  constructor() {
    super();
    this.instanceId = ++orbInstanceCounter;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.updateStyles();
    }
  }

  updateStyles() {
    const sizeAttr = this.getAttribute('size') || '100';
    const numSize = parseFloat(sizeAttr) || 100;
    const scale = numSize / 100;
    this.style.setProperty('--orb-size', `${numSize}px`);
    this.style.setProperty('--orb-scale', scale);
  }

  render() {
    this.updateStyles();
    const maskId = `clipping-${this.instanceId}`;

    this.innerHTML = `
      <div class="loader-wrapper">
        <div class="loader">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <defs>
              <mask id="${maskId}">
                <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                <polygon points="35,35 65,35 50,65" fill="white"></polygon>
              </mask>
            </defs>
          </svg>
          <div class="box" style="mask: url(#${maskId}); -webkit-mask: url(#${maskId});"></div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('ai-orb')) {
  customElements.define('ai-orb', AIOrb);
}

/**
 * Helper function to create an ai-orb element programmatically
 * @param {number|string} size 
 * @param {boolean} glow 
 * @returns {HTMLElement}
 */
window.createAIOrb = function(size = 100, glow = true) {
  const orb = document.createElement('ai-orb');
  orb.setAttribute('size', size);
  if (!glow) orb.setAttribute('glow', 'false');
  return orb;
};
