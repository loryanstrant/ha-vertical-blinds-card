import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, handleAction, LovelaceCardConfig } from 'custom-card-helpers';
import { VerticalBlindsCardConfig, ActionConfig } from './types';
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

  public static async getConfigElement() {
    return document.createElement('vertical-blinds-card-editor');
  }

  public static getStubConfig(): VerticalBlindsCardConfig {
    return {
      type: 'custom:vertical-blinds-card',
      entity: '',
      slat_count: 8,
      slat_color: '#FFFFFF',
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
    if (!entityId) {
      return html`
        <ha-card>
          <div class="warning">No entity configured</div>
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
    const slatCount = this._config.slat_count || 8;
    const slatColor = this._config.slat_color || '#FFFFFF';

    return html`
      <ha-card
        @action=${this._handleAction}
        .actionHandler=${this._actionHandler}
        tabindex="0"
        .label=${`Vertical Blinds: ${name}`}
      >
        <div class="card-content">
          <div class="header">
            <div class="name">${name}</div>
            <div class="state">${this._getStateDisplay(stateObj, position)}</div>
          </div>
          <div class="blinds-container">
            ${this._renderBlind(slatCount, slatColor, position)}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderBlind(slatCount: number, slatColor: string, position: number) {
    const slats = [];
    const openAmount = position / 100;
    
    for (let i = 0; i < slatCount; i++) {
      slats.push(html`
        <div
          class="slat"
          style="
            background-color: ${slatColor};
            transform: translateX(${openAmount * -100}%);
            transition: transform 0.3s ease-in-out;
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

  private _getPosition(stateObj: any): number {
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

  private _getStateDisplay(stateObj: any, position: number): string {
    if (position === 0) {
      return 'Closed';
    } else if (position === 100) {
      return 'Open';
    } else {
      return `${position}% Open`;
    }
  }

  private get _actionHandler() {
    return {
      handleAction: (actionConfig: ActionConfig) => {
        if (!this._config.entity) return;
        handleAction(this, this.hass, this._config as any, actionConfig.action);
      },
    };
  }

  private _handleAction(ev: CustomEvent): void {
    const action = ev.detail.action;
    let actionConfig: ActionConfig | undefined;

    if (action === 'tap') {
      actionConfig = this._config.tap_action;
    } else if (action === 'hold') {
      actionConfig = this._config.hold_action;
    } else if (action === 'double_tap') {
      actionConfig = this._config.double_tap_action;
    }

    if (actionConfig && this._config.entity) {
      handleAction(this, this.hass, this._config as any, actionConfig.action);
    }
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
      background: linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%);
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
      flex: 1;
      margin: 0 2px;
      border-radius: 2px;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 0, 0, 0.1);
      min-width: 20px;
      max-width: 60px;
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
