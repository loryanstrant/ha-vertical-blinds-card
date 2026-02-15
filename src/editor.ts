import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { VerticalBlindsCardConfig } from './types';

@customElement('vertical-blinds-card-editor')
export class VerticalBlindsCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: VerticalBlindsCardConfig;

  public setConfig(config: VerticalBlindsCardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(
      (eid) => eid.substr(0, eid.indexOf('.')) === 'cover'
    );

    return html`
      <div class="card-config">
        <ha-entity-picker
          .label="${'Entity (Required)'}"
          .hass=${this.hass}
          .value=${this._config.entity}
          .includeDomains=${['cover']}
          @value-changed=${this._entityChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <paper-input
          label="Name (Optional)"
          .value=${this._config.name || ''}
          .configValue=${'name'}
          @value-changed=${this._valueChanged}
        ></paper-input>

        <paper-input
          label="Number of Slats"
          type="number"
          min="3"
          max="20"
          .value=${this._config.slat_count || 8}
          .configValue=${'slat_count'}
          @value-changed=${this._valueChanged}
        ></paper-input>

        <div class="color-picker-wrapper">
          <label>Slat Color</label>
          <input
            type="color"
            .value=${this._config.slat_color || '#FFFFFF'}
            @change=${this._colorChanged}
          />
        </div>

        <div class="action-config">
          <label>Tap Action</label>
          <paper-dropdown-menu>
            <paper-listbox
              slot="dropdown-content"
              .selected=${this._getActionIndex(this._config.tap_action?.action || 'toggle')}
              @iron-select=${(ev: CustomEvent) => this._actionChanged(ev, 'tap_action')}
            >
              <paper-item>Toggle</paper-item>
              <paper-item>More Info</paper-item>
              <paper-item>None</paper-item>
            </paper-listbox>
          </paper-dropdown-menu>
        </div>

        <div class="action-config">
          <label>Hold Action</label>
          <paper-dropdown-menu>
            <paper-listbox
              slot="dropdown-content"
              .selected=${this._getActionIndex(this._config.hold_action?.action || 'more-info')}
              @iron-select=${(ev: CustomEvent) => this._actionChanged(ev, 'hold_action')}
            >
              <paper-item>Toggle</paper-item>
              <paper-item>More Info</paper-item>
              <paper-item>None</paper-item>
            </paper-listbox>
          </paper-dropdown-menu>
        </div>

        <div class="action-config">
          <label>Double Tap Action</label>
          <paper-dropdown-menu>
            <paper-listbox
              slot="dropdown-content"
              .selected=${this._getActionIndex(this._config.double_tap_action?.action || 'none')}
              @iron-select=${(ev: CustomEvent) => this._actionChanged(ev, 'double_tap_action')}
            >
              <paper-item>Toggle</paper-item>
              <paper-item>More Info</paper-item>
              <paper-item>None</paper-item>
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
      </div>
    `;
  }

  private _getActionIndex(action: string): number {
    const actions = ['toggle', 'more-info', 'none'];
    return actions.indexOf(action);
  }

  private _entityChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    this._config = { ...this._config, entity: ev.detail.value };
    this._fireConfigChanged();
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target as any;
    const configValue = target.configValue;
    let value: any = ev.detail.value;

    if (configValue === 'slat_count') {
      value = parseInt(value, 10);
      if (isNaN(value) || value < 3) value = 3;
      if (value > 20) value = 20;
    }

    this._config = { ...this._config, [configValue]: value };
    this._fireConfigChanged();
  }

  private _colorChanged(ev: Event): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target as HTMLInputElement;
    this._config = { ...this._config, slat_color: target.value };
    this._fireConfigChanged();
  }

  private _actionChanged(ev: CustomEvent, actionType: string): void {
    if (!this._config || !this.hass) {
      return;
    }
    const actions = ['toggle', 'more-info', 'none'];
    const selected = (ev.target as any).selected;
    const action = actions[selected];
    
    this._config = {
      ...this._config,
      [actionType]: { action: action },
    };
    this._fireConfigChanged();
  }

  private _fireConfigChanged(): void {
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }

    paper-input {
      width: 100%;
      margin-bottom: 16px;
    }

    ha-entity-picker {
      width: 100%;
      margin-bottom: 16px;
    }

    .color-picker-wrapper {
      margin-bottom: 16px;
    }

    .color-picker-wrapper label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .color-picker-wrapper input[type='color'] {
      width: 100%;
      height: 40px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      cursor: pointer;
    }

    .action-config {
      margin-bottom: 16px;
    }

    .action-config label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
    }

    paper-dropdown-menu {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'vertical-blinds-card-editor': VerticalBlindsCardEditor;
  }
}
