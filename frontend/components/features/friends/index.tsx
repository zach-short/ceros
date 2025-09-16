'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AddFriendsInput } from '@/components/features/friends/add-friends-input';
import {
  useFriends,
  usePendingRequests,
  useSentRequests,
  useAcceptFriend,
  useRejectFriend,
  useRemoveFriend,
} from '@/hooks/api/use-friends';
import { Friendship } from '@/lib/api/friends';
import { UserCheck, UserX, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';

type TabType = 'active' | 'pending' | 'add';
type PendingTabType = 'incoming' | 'outgoing';

export default function Friends() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [pendingTab, setPendingTab] = useState<PendingTabType>('incoming');

  const {
    data: friendsData,
    loading: friendsLoading,
    refetch: refetchFriends,
  } = useFriends();

  const {
    data: pendingData,
    loading: pendingLoading,
    refetch: refetchPending,
  } = usePendingRequests();

  const {
    data: sentData,
    loading: sentLoading,
    refetch: refetchSent,
  } = useSentRequests();

  const { mutate: acceptFriend } = useAcceptFriend({
    onSuccess: () => {
      toast.success('Friend request accepted!');
      refetchFriends();
      refetchPending();
      refetchSent();
    },
    onError: () => {
      toast.error('Failed to accept friend request');
    },
  });

  const { mutate: rejectFriend } = useRejectFriend({
    onSuccess: () => {
      toast.success('Friend request rejected');
      refetchPending();
      refetchSent();
    },
    onError: () => {
      toast.error('Failed to reject friend request');
    },
  });

  const { mutate: removeFriend } = useRemoveFriend({
    onSuccess: () => {
      toast.success('Friend removed');
      refetchFriends();
    },
    onError: () => {
      toast.error('Failed to remove friend');
    },
  });

  const friends = friendsData?.friendships || [];
  const pendingRequests = pendingData?.pendingRequests || [];
  const sentRequests = sentData?.sentRequests || [];

  const renderTabButton = (tab: TabType, label: string, count?: number) => (
    <Button
      key={tab}
      variant={activeTab === tab ? 'default' : 'ghost'}
      onClick={() => setActiveTab(tab)}
      className={`flex-1 ${activeTab === tab ? '' : 'text-muted-foreground'}`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className='ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs'>
          {count}
        </span>
      )}
    </Button>
  );

  const renderActiveTab = () => {
    if (friendsLoading) {
      return (
        <CenteredDiv className={`!h-[40vh]`}>
          <DefaultLoader />
        </CenteredDiv>
      );
    }

    if (friends.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <UserCheck className='mb-4 h-12 w-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-semibold'>No friends yet</h3>
          <p className='text-muted-foreground mb-4'>
            Start by adding some friends!
          </p>
          <Button onClick={() => setActiveTab('add')}>Add Friends</Button>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {friends.map((friendship: Friendship) => (
          <Card key={friendship.id}>
            <CardContent className='flex items-center justify-between p-4'>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={friendship.user?.picture}
                    alt={friendship.user?.name || 'Friend'}
                  />
                  <AvatarFallback>
                    {friendship.user?.name?.substring(0, 2).toUpperCase() ||
                      'FR'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>
                    {friendship.user?.name || 'Unknown User'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Friends since{' '}
                    {new Date(
                      friendship.respondedAt || friendship.requestedAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => removeFriend(friendship.id)}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPendingSubTab = (
    subTab: PendingTabType,
    label: string,
    count?: number,
  ) => (
    <Button
      key={subTab}
      variant={pendingTab === subTab ? 'default' : 'ghost'}
      size='sm'
      onClick={() => setPendingTab(subTab)}
      className={`flex-1 ${pendingTab === subTab ? '' : 'text-muted-foreground'}`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className='ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs'>
          {count}
        </span>
      )}
    </Button>
  );

  const renderIncomingRequests = () => {
    if (pendingLoading) {
      return (
        <CenteredDiv className={`!h-[40vh]`}>
          <DefaultLoader />
        </CenteredDiv>
      );
    }

    if (pendingRequests.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <Clock className='mb-4 h-12 w-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-semibold'>No incoming requests</h3>
          <p className='text-muted-foreground'>
            You have no incoming friend requests
          </p>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {pendingRequests.map((friendship: Friendship) => (
          <Card key={friendship.id}>
            <CardContent className='flex items-center justify-between p-4'>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={friendship.user?.picture}
                    alt={friendship.user?.name || 'User'}
                  />
                  <AvatarFallback>
                    {friendship.user?.name?.substring(0, 2).toUpperCase() ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>
                    {friendship.user?.name || 'Unknown User'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Sent request{' '}
                    {new Date(friendship.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className='flex space-x-2'>
                <Button size='sm' onClick={() => acceptFriend(friendship.id)}>
                  <UserCheck className='h-4 w-4' />
                  Accept
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => rejectFriend(friendship.id)}
                >
                  <UserX className='h-4 w-4' />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderOutgoingRequests = () => {
    if (sentLoading) {
      return (
        <CenteredDiv className={`!h-[40vh]`}>
          <DefaultLoader />
        </CenteredDiv>
      );
    }

    if (sentRequests.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <Clock className='mb-4 h-12 w-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-semibold'>No outgoing requests</h3>
          <p className='text-muted-foreground'>
            You have no outgoing friend requests
          </p>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {sentRequests.map((friendship: Friendship) => (
          <Card key={friendship.id}>
            <CardContent className='flex items-center justify-between p-4'>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={friendship.user?.picture}
                    alt={friendship.user?.name || 'User'}
                  />
                  <AvatarFallback />
                </Avatar>
                <div>
                  <p className='font-medium'>
                    {friendship.user?.name || 'Unknown User'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Request sent{' '}
                    {new Date(friendship.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-orange-500 mr-2' />
                <span className='text-sm text-muted-foreground'>Pending</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPendingTab = () => {
    return (
      <div className='space-y-6'>
        <div className='flex space-x-1 p-1 bg-muted rounded-lg'>
          {renderPendingSubTab('incoming', 'Incoming', pendingRequests.length)}
          {renderPendingSubTab('outgoing', 'Outgoing', sentRequests.length)}
        </div>

        <div>
          {pendingTab === 'incoming'
            ? renderIncomingRequests()
            : renderOutgoingRequests()}
        </div>
      </div>
    );
  };

  const renderAddTab = () => (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Find Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <AddFriendsInput />
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'active':
        return renderActiveTab();
      case 'pending':
        return renderPendingTab();
      case 'add':
        return renderAddTab();
      default:
        return null;
    }
  };

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-6'>Friends</h1>

        <div className='flex space-x-1 p-1 bg-muted rounded-lg'>
          {renderTabButton('active', 'Friends', friends.length)}
          {renderTabButton(
            'pending',
            'Pending',
            pendingRequests.length + sentRequests.length,
          )}
          {renderTabButton('add', 'Add Friends')}
        </div>
      </div>

      <div className='mt-6'>{renderTabContent()}</div>
    </div>
  );
}
