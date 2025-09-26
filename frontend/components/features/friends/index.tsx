'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddFriendsInput } from '@/components/features/friends/add-friends-input';
import { UserCard } from '@/components/shared/user';
import {
  useFriends,
  usePendingRequests,
  useSentRequests,
  useAcceptFriend,
  useRejectFriend,
  useRemoveFriend,
} from '@/hooks/api/use-friends';
import { Friendship } from '@/lib/api/friends';
import { UserCheck, UserX, Clock, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TabType = 'active' | 'pending' | 'add';
type PendingTabType = 'incoming' | 'outgoing';

export default function Friends() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [pendingTab, setPendingTab] = useState<PendingTabType>('incoming');
  const router = useRouter();

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
      className={`flex-1 text-xs ${activeTab === tab ? '' : 'text-muted-foreground'}`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className='ml-[.5] rounded-full bg-primary/20 px-1  text-xs'>
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
      <div className=''>
        {friends.map((friendship: Friendship) => (
          <Card key={friendship.id} className={`border-none shadow-none py-1`}>
            <CardContent className='flex items-center justify-between p-0'>
              <Link
                href={`/profile/${friendship?.user?.id}`}
                className='flex-1'
              >
                <UserCard
                  user={friendship.user!}
                  friendship={friendship}
                  showFullName={true}
                />
              </Link>

              <div className={`flex flex-row gap-4 items-center`}>
                <MessageSquare
                  onClick={() => router.push(`/chat/${friendship.user?.id}`)}
                  className='h-4 w-4 text-blue-600 hover:cursor-pointer'
                />
                <Trash2
                  onClick={() => removeFriend(friendship.id)}
                  className='h-4 w-4 text-red-500 hover:cursor-pointer'
                />
              </div>
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
        <span className='ml-[.5] rounded-full bg-primary/20 px-1  text-xs'>
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
      <div className=''>
        {pendingRequests.map((friendship: Friendship) => (
          <Card key={friendship.id} className={`border-none shadow-none py-1`}>
            <CardContent className='flex items-center justify-between p-0'>
              <UserCard
                user={friendship.user!}
                friendship={friendship}
                showFullName={true}
                className='flex-1'
              />
              <div className='flex flex-row gap-4 items-center'>
                <UserCheck
                  onClick={() => acceptFriend(friendship.id)}
                  className='h-4 w-4 text-green-600 hover:cursor-pointer'
                />
                <UserX
                  onClick={() => rejectFriend(friendship.id)}
                  className='h-4 w-4 text-red-500 hover:cursor-pointer'
                />
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
      <div className=''>
        {sentRequests.map((friendship: Friendship) => (
          <Card key={friendship.id} className={`border-none shadow-none py-1`}>
            <CardContent className='flex items-center justify-between p-0'>
              <UserCard
                user={friendship.user!}
                friendship={friendship}
                showFullName={true}
                className='flex-1'
              />
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-orange-500' />
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
