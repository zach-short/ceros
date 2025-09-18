'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { toast } from 'sonner';
import { Settings as SettingsIcon } from 'lucide-react';
import { useUser, useUpdateUserSettings } from '@/hooks/api/use-users';
import { UserSettings } from '@/lib/api/users';
import { useTheme } from 'next-themes';
import { AppearanceSettings } from './appearance-settings';
import { PrivacySettings } from './privacy-settings';
import { FriendSettings } from './friend-settings';
import { NotificationSettings } from './notification-settings';

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
        (newSettings as any)[category] = {
          ...((currentSettings[category] as Record<string, any>) || {}),
        };
      }
      (newSettings[category] as any)[setting] = value;
    }

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
              {updateLoading ? <DefaultLoader /> : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className='space-y-6'>
        <AppearanceSettings
          settings={workingSettings}
          onSettingChange={updateSetting}
        />

        <PrivacySettings
          settings={workingSettings}
          onSettingChange={updateSetting}
        />

        <FriendSettings
          settings={workingSettings}
          onSettingChange={updateSetting}
        />

        <NotificationSettings
          settings={workingSettings}
          onSettingChange={updateSetting}
        />
      </div>
    </div>
  );
}
