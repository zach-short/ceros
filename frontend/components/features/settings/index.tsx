'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Bell,
  Users,
} from 'lucide-react';
import { useUser, useUpdateUserSettings } from '@/hooks/api/use-users';
import {
  UserSettings,
  PrivacySettings,
  NotificationSettings,
} from '@/lib/api/users';
import { useTheme } from 'next-themes';

export function Settings() {
  const { data: user, loading: userLoading, refetch } = useUser();
  const [settingsData, setSettingsData] = useState<Partial<UserSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const { setTheme } = useTheme();

  const { mutate: updateSettings, loading: updateLoading } =
    useUpdateUserSettings({
      onSuccess: () => {
        toast.success('Settings updated successfully!');
        setHasChanges(false);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update settings');
      },
    });

  if (userLoading) {
    return (
      <CenteredDiv className='!h-[60vh]'>
        <DefaultLoader />
      </CenteredDiv>
    );
  }

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <SettingsIcon className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='mb-2 text-lg font-semibold'>Unable to load settings</h3>
        <p className='text-muted-foreground mb-4'>Please try again later</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const getDefaultSettings = (): UserSettings => ({
    theme: 'system',
    autoAcceptFriendInvitations: false,
    privacy: {
      showEmail: false,
      showPhoneNumber: false,
      showAddress: false,
      showGivenName: true,
      showFamilyName: true,
      showBio: true,
      showPicture: true,
    },
    notifications: {
      emailNotifications: true,
      committeeInvitations: true,
      motionNotifications: true,
      voteNotifications: true,
      friendRequestNotifications: true,
    },
  });

  const currentSettings = { ...getDefaultSettings(), ...user.settings };
  const workingSettings = { ...currentSettings, ...settingsData };

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...settingsData };

    if (keys.length === 1) {
      newSettings[keys[0] as keyof UserSettings] = value;
    } else if (keys.length === 2) {
      const category = keys[0] as keyof UserSettings;
      const setting = keys[1];

      if (!newSettings[category]) {
        newSettings[category] = { ...currentSettings[category] };
      }
      (newSettings[category] as any)[setting] = value;
    }

    console.log(
      keys,
      value,
      'keys,value in /Projects/wm-courses/3-fall-2025/web-programming/final-web-programming/frontend/components/features/settings/index.tsx',
    );
    if (keys.includes('theme')) {
      setTheme(value);
    }
    setSettingsData(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(settingsData);
  };

  const handleReset = () => {
    setSettingsData({});
    setHasChanges(false);
  };

  const PrivacySetting = ({
    settingKey,
    label,
    description,
  }: {
    settingKey: keyof PrivacySettings;
    label: string;
    description: string;
  }) => {
    const isChecked = workingSettings.privacy[settingKey];

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
        <Switch
          id={settingKey}
          checked={isChecked}
          onCheckedChange={(checked) =>
            updateSetting(`privacy.${settingKey}`, checked)
          }
        />
      </div>
    );
  };

  const NotificationSetting = ({
    settingKey,
    label,
    description,
  }: {
    settingKey: keyof NotificationSettings;
    label: string;
    description: string;
  }) => {
    const isChecked = workingSettings.notifications[settingKey];

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
          onCheckedChange={(checked) =>
            updateSetting(`notifications.${settingKey}`, checked)
          }
        />
      </div>
    );
  };

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Settings</h1>
        {hasChanges && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleReset}
              disabled={updateLoading}
            >
              Reset
            </Button>
            <Button onClick={handleSave} disabled={updateLoading}>
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className='space-y-6'>
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
                value={workingSettings.theme}
                onValueChange={(value) => updateSetting('theme', value)}
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

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Eye className='h-5 w-5' />
              <span>Privacy & Visibility</span>
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Control what information others can see in your profile. Friends
              may see additional information.
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <PrivacySetting
              settingKey='showPicture'
              label='Profile Picture'
              description='Show your profile picture to other users'
            />
            <PrivacySetting
              settingKey='showGivenName'
              label='First Name'
              description='Display your first name on your public profile'
            />
            <PrivacySetting
              settingKey='showFamilyName'
              label='Last Name'
              description='Display your last name on your public profile'
            />
            <PrivacySetting
              settingKey='showEmail'
              label='Email Address'
              description='Show your email address to other users'
            />
            <PrivacySetting
              settingKey='showPhoneNumber'
              label='Phone Number'
              description='Display your phone number to other users'
            />
            <PrivacySetting
              settingKey='showAddress'
              label='Address'
              description='Show your city & state to other users'
            />
            <PrivacySetting
              settingKey='showBio'
              label='Bio'
              description='Display your bio on your public profile'
            />
          </CardContent>
        </Card>

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
                checked={workingSettings.autoAcceptFriendInvitations}
                onCheckedChange={(checked) =>
                  updateSetting('autoAcceptFriendInvitations', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

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
            />
            <NotificationSetting
              settingKey='committeeInvitations'
              label='Committee Invitations'
              description='Get notified when you receive committee invitations'
            />
            <NotificationSetting
              settingKey='motionNotifications'
              label='Motion Updates'
              description='Receive notifications about new motions and discussions'
            />
            <NotificationSetting
              settingKey='voteNotifications'
              label='Voting Reminders'
              description='Get reminded when votes are open and closing'
            />
            <NotificationSetting
              settingKey='friendRequestNotifications'
              label='Friend Requests'
              description='Receive notifications for new friend requests'
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
