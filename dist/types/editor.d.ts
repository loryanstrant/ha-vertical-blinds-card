import { LitElement } from 'lit';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { VerticalBlindsCardConfig } from './types';
export declare class VerticalBlindsCardEditor extends LitElement implements LovelaceCardEditor {
    hass: HomeAssistant;
    private _config;
    setConfig(config: VerticalBlindsCardConfig): void;
    protected render(): import("lit-html").TemplateResult<1>;
    private _getActionIndex;
    private _entityChanged;
    private _valueChanged;
    private _colorChanged;
    private _switchChanged;
    private _actionChanged;
    private _fireConfigChanged;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vertical-blinds-card-editor': VerticalBlindsCardEditor;
    }
}
//# sourceMappingURL=editor.d.ts.map