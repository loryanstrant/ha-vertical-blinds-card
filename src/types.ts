export interface VerticalBlindsCardConfig {
  type: string;
  entity?: string;
  name?: string;
  slat_count?: number;
  slat_color?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface ActionConfig {
  action: 'toggle' | 'more-info' | 'navigate' | 'url' | 'call-service' | 'none';
  navigation_path?: string;
  url_path?: string;
  service?: string;
  service_data?: any;
  confirmation?: any;
}
