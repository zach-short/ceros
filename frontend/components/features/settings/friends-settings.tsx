'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users } from 'lucide-react';
import { UserSettings } from '@/lib/api/users';

interface FriendsSettingsProps {
  settings: UserSettings;
  onSettingChange: (path: string, value: any) => void;
}

export function FriendsSettings({
  settings,
  onSettingChange,
}: FriendsSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Users className='h-5 w-5' />
          <span>Friends Settings</span>
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          Manage how you interact with friend requests and connections.
        </p>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between space-x-2 p-4 border rounded-lg'>
          <div className='space-y-1 flex-1'>
            <Label
              htmlFor='autoAcceptFriendInvitations'
              className='font-medium'
            >
              Auto-accept Friend Requests
            </Label>
            <p className='text-sm text-muted-foreground'>
              Automatically accept all incoming friend requests without manual
              approval.
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
