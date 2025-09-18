'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users } from 'lucide-react';
import { UserSettings } from '@/lib/api/users';

interface FriendSettingsProps {
  settings: UserSettings;
  onSettingChange: (path: string, value: any) => void;
}

export function FriendSettings({ settings, onSettingChange }: FriendSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Users className='h-5 w-5' />
          <span>Friends & Committee Invitations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between space-x-2 p-4 border rounded-lg'>
          <div className='space-y-1 flex-1'>
            <Label
              htmlFor='autoAcceptFriendInvitations'
              className='font-medium'
            >
              Auto-accept committee invitations from friends
            </Label>
            <p className='text-sm text-muted-foreground'>
              Automatically accept committee invitations from users in your
              friends list
            </p>
          </div>
          <Switch
            id='autoAcceptFriendInvitations'
            checked={settings.autoAcceptFriendInvitations}
            onCheckedChange={(checked) =>
              onSettingChange('autoAcceptFriendInvitations', checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}