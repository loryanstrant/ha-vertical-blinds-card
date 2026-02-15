import { LitElement, PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { VerticalBlindsCardConfig } from './types';
import './editor';
export declare class VerticalBlindsCard extends LitElement {
    hass: HomeAssistant;
    private _config;
    private _holdTimer?;
    private _holdDetected;
    private _lastTap;
    private static readonly HOLD_DELAY_MS;
    private static readonly DOUBLE_TAP_DELAY_MS;
    static getConfigElement(): Promise<import("./editor").VerticalBlindsCardEditor>;
    static getStubConfig(): VerticalBlindsCardConfig;
    setConfig(config: VerticalBlindsCardConfig): void;
    getCardSize(): number;
    protected shouldUpdate(changedProps: PropertyValues): boolean;
    protected render(): import("lit-html").TemplateResult<1>;
    private _renderBlind;
    private _getPosition;
    private _getStateDisplay;
    private _handleHoldStart;
    private _handleHoldEnd;
    private _handleTap;
    private _executeAction;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vertical-blinds-card': VerticalBlindsCard;
    }
}
//# sourceMappingURL=vertical-blinds-card.d.ts.map