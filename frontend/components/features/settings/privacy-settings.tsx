'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import {
  UserSettings,
  PrivacySettings as PrivacySettingsType,
} from '@/lib/api/users';

interface PrivacySettingsProps {
  settings: UserSettings;
  onSettingChange: (path: string, value: any) => void;
}

interface PrivacySettingProps {
  settingKey: keyof PrivacySettingsType;
  label: string;
  description: string;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}

function PrivacySetting({
  settingKey,
  label,
  description,
  isChecked,
  onToggle,
}: PrivacySettingProps) {
  return (
    <div className='flex items-center justify-between space-x-2 p-4 border rounded-lg'>
      <div className='space-y-1 flex-1'>
        <div className='flex items-center space-x-2'>
          {isChecked ? (
            <Eye className='h-4 w-4 text-green-600' />
          ) : (
            <EyeOff className='h-4 w-4 text-gray-400' />
          )}
          <Label htmlFor={settingKey} className='font-medium'>
            {label}
          </Label>
        </div>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      <Switch id={settingKey} checked={isChecked} onCheckedChange={onToggle} />
    </div>
  );
}

export function PrivacySettings({
  settings,
  onSettingChange,
}: PrivacySettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Eye className='h-5 w-5' />
          <span>Privacy & Visibility</span>
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          Control what information others can see in your profile. Friends may
          see additional information.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <PrivacySetting
          settingKey='showEmail'
          label='Email Address'
          description=''
          isChecked={settings.privacy.showEmail}
          onToggle={(checked) => onSettingChange('privacy.showEmail', checked)}
        />
        <PrivacySetting
          settingKey='showPhoneNumber'
          label='Phone Number'
          description=''
          isChecked={settings.privacy.showPhoneNumber}
          onToggle={(checked) =>
            onSettingChange('privacy.showPhoneNumber', checked)
          }
        />
        <PrivacySetting
          settingKey='showAddress'
          label='City & State'
          description=''
          isChecked={settings.privacy.showAddress}
          onToggle={(checked) =>
            onSettingChange('privacy.showAddress', checked)
          }
        />
      </CardContent>
    </Card>
  );
}

