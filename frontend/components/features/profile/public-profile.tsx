'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar, UserName } from '@/components/shared/user';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import {
  User,
  Users,
  UserPlus,
  Clock,
  UserX,
  Lock,
  PinIcon,
  PhoneIcon,
  MailIcon,
  MessageSquare,
} from 'lucide-react';
import {
  getDisplayEmail,
  getDisplayPhone,
  getDisplayBio,
  getDisplayAddress,
  UserPrivacyContext,
} from '@/lib/user-privacy';
import { usePublicProfile } from '@/hooks/api/use-users';
import { useSession } from 'next-auth/react';
import { friendsApi } from '@/lib/api/friends';
import { toast } from 'sonner';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PublicProfileProps {
  userId: string;
}

export function PublicProfile({ userId }: PublicProfileProps) {
  const {
    data: user,
    loading: userLoading,
    refetch,
  } = usePublicProfile(userId);
  const session = useSession();
  const router = useRouter();
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const isOwnProfile = userId === session.data?.user.id;
  const isAuthenticated = session.status === 'authenticated';

  const handleFriendAction = async () => {
    if (!user || !isAuthenticated) return;

    const status = user.friendshipStatus;

    if (status?.status === 'accepted') {
      router.push(`/chat/${user.id}`);
      return;
    }

    if (status?.isPendingFromMe) {
      toast.info('You have already sent a friend request to this user');
      return;
    }

    if (status?.isPendingToMe) {
      toast.info(
        'This user has already sent you a friend request. Check your pending requests.',
      );
      return;
    }

    if (status?.status === 'blocked') {
      toast.error('Cannot send friend request to this user');
      return;
    }

    setFriendActionLoading(true);
    try {
      const response = await friendsApi.requestFriend({ addresseeId: userId });
      if (response.success) {
        toast.success(`Friend request sent to ${user.name || user.email}`);
        refetch();
      } else {
        toast.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    } finally {
      setFriendActionLoading(false);
    }
  };

  const getFriendButtonContent = () => {
    if (!user?.friendshipStatus) {
      return {
        icon: UserPlus,
        text: 'Add Friend',
        color: 'bg-blue-600 hover:bg-blue-700',
      };
    }

    const status = user.friendshipStatus;
    switch (status.status) {
      case 'accepted':
        return {
          icon: MessageSquare,
          text: 'Message',
          color: 'bg-blue-600',
          disabled: false,
        };
      case 'blocked':
        return {
          icon: UserX,
          text: 'Blocked',
          color: 'bg-red-600',
          disabled: true,
        };
      case 'pending':
        if (status.isPendingFromMe) {
          return {
            icon: Clock,
            text: 'Request Sent',
            color: 'bg-orange-500',
            disabled: true,
          };
        } else {
          return {
            icon: Clock,
            text: 'Respond to Request',
            color: 'bg-blue-500',
            disabled: true,
          };
        }
      default:
        return {
          icon: UserPlus,
          text: 'Add Friend',
          color: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

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

  const friendButtonContent = getFriendButtonContent();

  const context: UserPrivacyContext = {
    user,
    viewerUserId: session.data?.user.id,
    friendship: user.friendshipStatus ? {
      id: user.friendshipStatus.friendshipId,
      status: user.friendshipStatus.status,
      requesterId: '',
      addresseeId: '',
      requestedAt: '',
      user
    } : undefined,
    isOwnProfile,
  };

  const displayEmail = getDisplayEmail(user, context);
  const displayPhone = getDisplayPhone(user, context);
  const displayBio = getDisplayBio(user, context);
  const displayAddress = getDisplayAddress(user, context);

  const isFriend = user?.friendshipStatus?.status === 'accepted';

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='space-y-6'>
        <Card>
          <CardContent className={`relative pt-6`}>
            <div className='flex items-center space-x-6'>
              <div className='relative'>
                <UserAvatar
                  user={user}
                  viewerUserId={session.data?.user.id}
                  friendship={context.friendship}
                  isOwnProfile={isOwnProfile}
                  size='xl'
                />
              </div>
              <div className='flex-1'>
                <UserName
                  user={user}
                  viewerUserId={session.data?.user.id}
                  friendship={context.friendship}
                  isOwnProfile={isOwnProfile}
                  showFullName={true}
                  className='text-xl font-semibold'
                />
                <UserName
                  user={user}
                  viewerUserId={session.data?.user.id}
                  friendship={context.friendship}
                  isOwnProfile={isOwnProfile}
                  showFullName={false}
                  className='text-base font-semibold'
                />

                {isAuthenticated &&
                  !isOwnProfile &&
                  user.mutualFriendsCount !== undefined && (
                    <div className='flex items-center gap-1 mt-2 text-sm text-muted-foreground'>
                      <Users size={16} />
                      <span>
                        {user.mutualFriendsCount} mutual friend
                        {user.mutualFriendsCount !== 1 && 's'}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <div className='mt-6 ml-1'>
              {displayBio ? (
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {displayBio}
                </p>
              ) : (
                <div className='flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg'>
                  <Lock className='h-4 w-4' />
                  <span>
                    Bio is private
                    {isFriend ? '' : ' • Become friends to see more'}
                  </span>
                </div>
              )}
            </div>

            <div className='absolute top-6 right-6 flex gap-2'>
              {isOwnProfile ? (
                <Link
                  className='rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 hover:text-black'
                  href='/profile'
                >
                  Edit Profile
                </Link>
              ) : isAuthenticated ? (
                <Button
                  onClick={handleFriendAction}
                  disabled={friendButtonContent.disabled || friendActionLoading}
                  className={`${friendButtonContent.color} text-white`}
                  size='sm'
                >
                  <friendButtonContent.icon size={16} className='mr-2' />
                  {friendActionLoading
                    ? 'Loading...'
                    : friendButtonContent.text}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {(displayEmail ||
          displayPhone ||
          displayAddress ||
          (!isOwnProfile &&
            !displayEmail &&
            !displayPhone &&
            !displayAddress)) && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {displayEmail && (
                <div className='flex items-center gap-3'>
                  <MailIcon />
                  <span className='text-sm'>{displayEmail}</span>
                </div>
              )}
              {displayPhone && (
                <div className='flex items-center gap-3'>
                  <PhoneIcon />
                  <span className='text-sm'>{displayPhone}</span>
                </div>
              )}
              {displayAddress && displayAddress.city && (
                <div className='flex items-center gap-3'>
                  <PinIcon />
                  <span className='text-sm'>
                    {displayAddress.city && `${displayAddress.city}, `}
                    {displayAddress.state && `${displayAddress.state} `}
                  </span>
                </div>
              )}

              {!displayEmail &&
                !displayPhone &&
                !displayAddress &&
                !isOwnProfile && (
                  <div className='flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg'>
                    <Lock className='h-4 w-4' />
                    <span>
                      Contact information is private
                      {isFriend ? '' : ' • Become friends to see more'}
                    </span>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {user.committees && user.committees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Committees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-3'>
                {user.committees.map((committee) => (
                  <div
                    key={committee.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div>
                      <h4 className='font-medium'>{committee.name}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {committee.type}
                      </p>
                    </div>
                    <Badge
                      variant={
                        committee.role === 'Owner' ? 'default' : 'secondary'
                      }
                    >
                      {committee.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
