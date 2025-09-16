'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { toast } from 'sonner';
import { User, X, Check } from 'lucide-react';
import {
  useUser,
  useUpdateProfile,
  useCheckUsername,
} from '@/hooks/api/use-users';
import { UpdateProfileRequest } from '@/lib/api/users';
import { UploadImageButton } from '@/components/shared/button/upload';

export function Profile() {
  const { data: user, loading: userLoading, refetch } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { mutate: updateProfile, loading: updateLoading } = useUpdateProfile({
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const { mutate: checkUsername } = useCheckUsername({
    onSuccess: (data) => {
      setUsernameAvailable(data.available);
      setCheckingUsername(false);
    },
    onError: () => {
      setUsernameAvailable(null);
      setCheckingUsername(false);
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
        <User className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='mb-2 text-lg font-semibold'>Unable to load profile</h3>
        <p className='text-muted-foreground mb-4'>Please try again later</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      name: user.name || '',
      givenName: user.givenName || '',
      familyName: user.familyName || '',
      bio: user.bio || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || {},
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setUsernameAvailable(null);
  };

  const handleSave = () => {
    if (formData.name && formData.name !== user.name && !usernameAvailable) {
      toast.error('Please choose an available username');
      return;
    }

    updateProfile(formData);
  };

  const handleUsernameChange = (value: string) => {
    setFormData({ ...formData, name: value });

    if (value && value !== user.name) {
      setCheckingUsername(true);
      setUsernameAvailable(null);

      const timeoutId = setTimeout(() => {
        checkUsername(value);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  };

  const isUsernameValid = (username: string) => {
    return (
      /^[a-zA-Z0-9_.-]+$/.test(username) &&
      username.length >= 3 &&
      username.length <= 30
    );
  };

  const renderField = (
    label: string,
    value: string | undefined,
    key: keyof UpdateProfileRequest,
    placeholder?: string,
    disabled?: boolean,
  ) => (
    <div className='space-y-2'>
      <Label htmlFor={key}>{label}</Label>
      {isEditing && !disabled ? (
        <div className='relative'>
          <Input
            id={key}
            value={(formData[key] as string) || ''}
            onChange={(e) => {
              if (key === 'name') {
                handleUsernameChange(e.target.value);
              } else {
                setFormData({ ...formData, [key]: e.target.value });
              }
            }}
            placeholder={placeholder}
            className={
              key === 'name' &&
              formData.name &&
              !isUsernameValid(formData.name as string)
                ? 'border-red-500'
                : ''
            }
          />
          {key === 'name' && (
            <div className='absolute right-2 top-1/2 -translate-y-1/2'>
              {checkingUsername ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary' />
              ) : usernameAvailable === true ? (
                <Check className='h-4 w-4 text-green-500' />
              ) : usernameAvailable === false ? (
                <X className='h-4 w-4 text-red-500' />
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <p className='text-sm text-muted-foreground'>
          {value || 'Not provided'}
        </p>
      )}
      {key === 'name' &&
        isEditing &&
        formData.name &&
        !isUsernameValid(formData.name as string) && (
          <p className='text-xs text-red-500'>
            Username must be 3-30 characters and contain only letters, numbers,
            dots, underscores, and hyphens
          </p>
        )}
    </div>
  );

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Profile</h1>
        {!isEditing ? (
          <Button onClick={handleEdit}>Edit Profile</Button>
        ) : (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleCancel}
              disabled={updateLoading}
            >
              Cancel
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
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-6'>
              <div className='relative'>
                <Avatar className='h-24 w-24'>
                  <AvatarImage
                    src={formData?.picture || user.picture}
                    alt={user.name || 'Profile'}
                  />
                  <AvatarFallback />
                </Avatar>
                {isEditing && (
                  <>
                    <div className='absolute inset-0 bg-black/40 rounded-full' />
                    <div className='absolute -bottom-5 -right-5'>
                      <UploadImageButton
                        onUploadError={(error) => {
                          console.log(error);
                          toast.error('Error uploading photo');
                        }}
                        onClientUploadComplete={(res) => {
                          console.log(res);
                          setFormData({ ...formData, picture: res[0].url });
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              <div>
                <h3 className='text-lg font-semibold'>
                  {user.name || 'Unknown User'}
                </h3>
                <p className='text-sm text-muted-foreground'>{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {renderField('Username', user.name, 'name', 'Enter username')}
            {renderField(
              'First Name',
              user.givenName,
              'givenName',
              'Enter first name',
            )}
            {renderField(
              'Last Name',
              user.familyName,
              'familyName',
              'Enter last name',
            )}
            {renderField('Email', user.email, 'email', undefined, true)}
            {renderField(
              'Phone Number',
              user.phoneNumber,
              'phoneNumber',
              'Enter phone number',
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Label htmlFor='bio'>About Me</Label>
              {isEditing ? (
                <textarea
                  id='bio'
                  value={formData.bio || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder='Tell us about yourself...'
                  className='w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                />
              ) : (
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {user.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              {isEditing ? (
                <Input
                  id='address'
                  value={formData.address?.street || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  placeholder='Enter your address'
                />
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {user.address?.street
                    ? `${user.address.street}${user.address.city ? `, ${user.address.city}` : ''}${user.address.state ? `, ${user.address.state}` : ''}${user.address.zip ? ` ${user.address.zip}` : ''}`
                    : 'No address provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
