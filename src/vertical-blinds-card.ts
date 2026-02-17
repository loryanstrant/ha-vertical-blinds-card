import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, handleAction, LovelaceCardConfig } from 'custom-card-helpers';
import { VerticalBlindsCardConfig, ActionConfig, CoverEntityState } from './types';
import './editor';

console.info(
  `%c VERTICAL-BLINDS-CARD %c 1.0.0 `,
  'color: white; background: #4CAF50; font-weight: 700;',
  'color: #4CAF50; background: white; font-weight: 700;'
);

@customElement('vertical-blinds-card')
export class VerticalBlindsCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: VerticalBlindsCardConfig;
  @state() private _holdTimer?: ReturnType<typeof setTimeout>;
  @state() private _holdDetected = false;
  @state() private _lastTap = 0;

  private static readonly HOLD_DELAY_MS = 500;
  private static readonly DOUBLE_TAP_DELAY_MS = 300;

  public static async getConfigElement() {
    return document.createElement('vertical-blinds-card-editor');
  }

  public static getStubConfig(): VerticalBlindsCardConfig {
    return {
      type: 'custom:vertical-blinds-card',
      entity: '',
      slat_count: 8,
      slat_color: '#FFFFFF',
      show_name: true,
      show_state: true,
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
    };
  }

  public setConfig(config: VerticalBlindsCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    this._config = {
      slat_count: 8,
      slat_color: '#FFFFFF',
      show_name: true,
      show_state: true,
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
      ...config,
    };
  }

  public getCardSize(): number {
    return 3;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has('_config')) {
      return true;
    }

    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    if (!oldHass || !this._config) {
      return true;
    }

    if (this._config.entity && oldHass.states[this._config.entity] !== this.hass.states[this._config.entity]) {
      return true;
    }

    return false;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const entityId = this._config.entity;
    const slatCount = this._config.slat_count || 8;
    const slatColor = this._config.slat_color || '#FFFFFF';
    const showName = this._config.show_name !== false;
    const showState = this._config.show_state !== false;

    // Show preview/placeholder when no entity is configured
    if (!entityId) {
      return html`
        <ha-card>
          <div class="card-content">
            ${showName || showState ? html`
              <div class="header">
                ${showName ? html`<div class="name">Vertical Blinds</div>` : ''}
                ${showState ? html`<div class="state">Preview</div>` : ''}
              </div>
            ` : ''}
            <div class="blinds-container">
              ${this._renderBlind(slatCount, slatColor, 50)}
            </div>
          </div>
        </ha-card>
      `;
    }

    const stateObj = this.hass.states[entityId];
    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">Entity not found: ${entityId}</div>
        </ha-card>
      `;
    }

    const position = this._getPosition(stateObj);
    const name = this._config.name || stateObj.attributes.friendly_name || entityId;

    return html`
      <ha-card
        @click=${this._handleTap}
        @touchstart=${this._handleHoldStart}
        @touchend=${this._handleHoldEnd}
        @touchcancel=${this._handleHoldEnd}
        @mousedown=${this._handleHoldStart}
        @mouseup=${this._handleHoldEnd}
        tabindex="0"
        .label=${`Vertical Blinds: ${name}`}
      >
        <div class="card-content">
          ${showName || showState ? html`
            <div class="header">
              ${showName ? html`<div class="name">${name}</div>` : ''}
              ${showState ? html`<div class="state">${this._getStateDisplay(stateObj, position)}</div>` : ''}
            </div>
          ` : ''}
          <div class="blinds-container">
            ${this._renderBlind(slatCount, slatColor, position)}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderBlind(slatCount: number, slatColor: string, position: number) {
    const slats = [];
    const openAmount = position / 100; // 0 = closed, 1 = fully open
    
    // Calculate slat width: closed = max (60px or flex), open = min (3px)
    // For intermediate positions, scale proportionally
    let slatStyle: string;
    if (openAmount === 0) {
      // Fully closed - use flex to fill available space
      slatStyle = 'flex: 1; max-width: 60px;';
    } else {
      // Open or partially open - use fixed widths
      const maxWidth = 60; // Max width when closed
      const minWidth = 3;  // Min width when fully open
      const width = Math.round(maxWidth - (openAmount * (maxWidth - minWidth)));
      slatStyle = `width: ${width}px;`;
    }
    
    for (let i = 0; i < slatCount; i++) {
      slats.push(html`
        <div
          class="slat"
          style="
            background-color: ${slatColor};
            ${slatStyle}
            transition: all 0.3s ease-in-out;
          "
        ></div>
      `);
    }

    return html`
      <div class="blind">
        ${slats}
      </div>
    `;
  }

  private _getPosition(stateObj: CoverEntityState): number {
    if (stateObj.attributes.current_position !== undefined) {
      return stateObj.attributes.current_position;
    }
    if (stateObj.state === 'open') {
      return 100;
    }
    if (stateObj.state === 'closed') {
      return 0;
    }
    return 50;
  }

  private _getStateDisplay(stateObj: CoverEntityState, position: number): string {
    if (position === 0) {
      return 'Closed';
    } else if (position === 100) {
      return 'Open';
    } else {
      return `${position}% Open`;
    }
  }

  private _handleHoldStart(ev: MouseEvent | TouchEvent): void {
    this._holdDetected = false;
    this._holdTimer = window.setTimeout(() => {
      this._holdDetected = true;
      this._executeAction(this._config.hold_action);
    }, VerticalBlindsCard.HOLD_DELAY_MS);
  }

  private _handleHoldEnd(ev: MouseEvent | TouchEvent): void {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = undefined;
    }
  }

  private _handleTap(ev: MouseEvent | TouchEvent): void {
    // Prevent default Home Assistant behavior (more-info dialog)
    ev.stopPropagation();
    ev.preventDefault();

    // If hold was detected, don't trigger tap
    if (this._holdDetected) {
      this._holdDetected = false;
      return;
    }

    const now = Date.now();
    const timeSinceLastTap = now - this._lastTap;

    // Check if double tap action is configured (not 'none')
    const hasDoubleTap = this._config.double_tap_action?.action !== 'none';

    // Double tap detection
    if (hasDoubleTap && timeSinceLastTap < VerticalBlindsCard.DOUBLE_TAP_DELAY_MS) {
      this._lastTap = 0;
      this._executeAction(this._config.double_tap_action);
    } else {
      this._lastTap = now;
      // If no double tap configured, execute immediately for better responsiveness
      if (!hasDoubleTap) {
        this._executeAction(this._config.tap_action);
      } else {
        // Wait a bit to see if there's a second tap
        setTimeout(() => {
          if (this._lastTap === now) {
            this._executeAction(this._config.tap_action);
          }
        }, VerticalBlindsCard.DOUBLE_TAP_DELAY_MS);
      }
    }
  }

  private _executeAction(actionConfig: ActionConfig | undefined): void {
    if (!actionConfig || !this._config.entity) {
      return;
    }
    handleAction(this, this.hass, this._config as any, actionConfig.action);
  }

  static styles = css`
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .card-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .name {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .state {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .blinds-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      background: var(--card-background-color, var(--ha-card-background, var(--primary-background-color)));
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }

    .blind {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: stretch;
      padding: 20px 10px;
      box-sizing: border-box;
    }

    .slat {
      flex: 0 0 auto;
      margin: 0 2px;
      border-radius: 2px;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 0, 0, 0.1);
      min-width: 3px;
      height: 100%;
    }

    .warning {
      display: block;
      color: var(--error-color);
      padding: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'vertical-blinds-card': VerticalBlindsCard;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'vertical-blinds-card',
  name: 'Vertical Blinds Card',
  description: 'A card to display vertical blinds',
  preview: true,
});
