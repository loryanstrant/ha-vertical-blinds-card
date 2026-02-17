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
      (eid) => eid.startsWith('cover.')
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

        <ha-textfield
          label="Name (Optional)"
          .value=${this._config.name || ''}
          .configValue=${'name'}
          @value-changed=${this._valueChanged}
        ></ha-textfield>

        <ha-formfield .label=${'Show Name'}>
          <ha-switch
            .checked=${this._config.show_name !== false}
            .configValue=${'show_name'}
            @change=${this._switchChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${'Show State'}>
          <ha-switch
            .checked=${this._config.show_state !== false}
            .configValue=${'show_state'}
            @change=${this._switchChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-textfield
          label="Number of Slats"
          type="number"
          min="3"
          max="20"
          .value=${this._config.slat_count || 8}
          .configValue=${'slat_count'}
          @value-changed=${this._valueChanged}
        ></ha-textfield>

        <div class="color-picker-wrapper">
          <label>Slat Color</label>
          <input
            type="color"
            .value=${this._config.slat_color || '#FFFFFF'}
            @change=${this._colorChanged}
          />
        </div>
      </div>
    `;
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

  private _switchChanged(ev: Event): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target as any;
    const configValue = target.configValue;
    const checked = target.checked;
    
    this._config = { ...this._config, [configValue]: checked };
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

    ha-textfield {
      width: 100%;
      margin-bottom: 16px;
    }

    ha-entity-picker {
      width: 100%;
      margin-bottom: 16px;
    }

    ha-formfield {
      display: block;
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'vertical-blinds-card-editor': VerticalBlindsCardEditor;
  }
}
