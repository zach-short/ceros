'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';
import { UserSettings, NotificationSettings as NotificationSettingsType } from '@/lib/api/users';

interface NotificationSettingsProps {
  settings: UserSettings;
  onSettingChange: (path: string, value: any) => void;
}

interface NotificationSettingProps {
  settingKey: keyof NotificationSettingsType;
  label: string;
  description: string;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}

function NotificationSetting({ settingKey, label, description, isChecked, onToggle }: NotificationSettingProps) {
  return (
    <div className='flex items-center justify-between space-x-2 p-4 border rounded-lg'>
      <div className='space-y-1 flex-1'>
        <div className='flex items-center space-x-2'>
          <Bell
            className={`h-4 w-4 ${isChecked ? 'text-blue-600' : 'text-gray-400'}`}
          />
          <Label htmlFor={settingKey} className='font-medium'>
            {label}
          </Label>
        </div>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      <Switch
        id={settingKey}
        checked={isChecked}
        onCheckedChange={onToggle}
      />
    </div>
  );
}

export function NotificationSettings({ settings, onSettingChange }: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Bell className='h-5 w-5' />
          <span>Notifications</span>
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          Manage how you receive notifications about platform activities.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <NotificationSetting
          settingKey='emailNotifications'
          label='Email Notifications'
          description='Receive email notifications for important activities'
          isChecked={settings.notifications.emailNotifications}
          onToggle={(checked) => onSettingChange('notifications.emailNotifications', checked)}
        />
        <NotificationSetting
          settingKey='committeeInvitations'
          label='Committee Invitations'
          description='Get notified when you receive committee invitations'
          isChecked={settings.notifications.committeeInvitations}
          onToggle={(checked) => onSettingChange('notifications.committeeInvitations', checked)}
        />
        <NotificationSetting
          settingKey='motionNotifications'
          label='Motion Updates'
          description='Receive notifications about new motions and discussions'
          isChecked={settings.notifications.motionNotifications}
          onToggle={(checked) => onSettingChange('notifications.motionNotifications', checked)}
        />
        <NotificationSetting
          settingKey='voteNotifications'
          label='Voting Reminders'
          description='Get reminded when votes are open and closing'
          isChecked={settings.notifications.voteNotifications}
          onToggle={(checked) => onSettingChange('notifications.voteNotifications', checked)}
        />
        <NotificationSetting
          settingKey='friendRequestNotifications'
          label='Friend Requests'
          description='Receive notifications for new friend requests'
          isChecked={settings.notifications.friendRequestNotifications}
          onToggle={(checked) => onSettingChange('notifications.friendRequestNotifications', checked)}
        />
      </CardContent>
    </Card>
  );
}