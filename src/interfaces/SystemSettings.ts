export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface SystemSetting {
  setting_key: string;
  setting_value: string | null;
  setting_type: SettingType;
  description?: string;
  updated_at?: string;
  updated_by?: number | null;
}

export interface SystemSettingParsed extends Omit<SystemSetting, 'setting_value'> {
  setting_value: any;
}
