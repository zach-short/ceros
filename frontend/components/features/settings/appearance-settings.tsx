'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings as SettingsIcon } from 'lucide-react';
import { UserSettings } from '@/lib/api/users';

interface AppearanceSettingsProps {
  settings: UserSettings;
  onSettingChange: (path: string, value: any) => void;
}

export function AppearanceSettings({ settings, onSettingChange }: AppearanceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <SettingsIcon className='h-5 w-5' />
          <span>Appearance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <Label>Theme</Label>
          <RadioGroup
            value={settings.theme}
            onValueChange={(value) => onSettingChange('theme', value)}
            className='flex space-x-4'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='light' id='light' />
              <Label htmlFor='light'>Light</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='dark' id='dark' />
              <Label htmlFor='dark'>Dark</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='system' id='system' />
              <Label htmlFor='system'>System</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}