'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import {
  useFriends,
  useRequestFriend,
  useRemoveFriend,
} from '@/hooks/api/use-friends';
import { DataState } from '../shared/data-state/data-state';
import { useSession } from 'next-auth/react';

function FriendsNotFound() {
  return (
    <div className='text-center py-8 text-muted-foreground'>
      <Users className='h-12 w-12 mx-auto mb-2 opacity-50' />
      <p>No friends yet. Add some friends to get started!</p>
    </div>
  );
}

function validateFriends(data: any) {
  const friendships = data?.friendships;
  return {
    isValid: Array.isArray(friendships) || friendships === null,
    error: Array.isArray(friendships)
      ? undefined
      : new Error('Invalid friends data structure'),
  };
}

export function FriendsListClean() {
  const [newFriendEmail, setNewFriendEmail] = useState('');

  const { data, error, loading, refetch } = useFriends();

  const { mutate: requestFriend, loading: isRequesting } = useRequestFriend({
    onSuccess: () => {
      setNewFriendEmail('');
      refetch();
    },
  });

  const { mutate: removeFriend } = useRemoveFriend({
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddFriend = () => {
    if (!newFriendEmail.trim()) return;

    requestFriend({ addresseeId: newFriendEmail });
  };

  const handleRemoveFriend = (friendshipId: string) => {
    removeFriend(friendshipId);
  };

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          Friends
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-2'>
          <Input
            placeholder="Enter friend's email"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            disabled={isRequesting}
          />
          <Button
            onClick={handleAddFriend}
            disabled={isRequesting || !newFriendEmail.trim()}
            size='sm'
          >
            <UserPlus className='h-4 w-4 mr-1' />
            {isRequesting ? 'Adding...' : 'Add'}
          </Button>
        </div>

        <DataState
          data={data}
          error={error}
          loading={loading}
          refetch={refetch}
          EmptyComponent={FriendsNotFound}
          validate={validateFriends}
        >
          {(data) => {
            const friendsList = data?.friendships;

            return (
              <div className='space-y-2'>
                {friendsList &&
                  friendsList.map((friendship: any) => (
                    <div
                      key={friendship.id}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <p className='font-medium'>
                          Friendship {friendship.id}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Requester: {friendship.requesterId}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            friendship.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : friendship.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {friendship.status}
                        </span>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleRemoveFriend(friendship.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
              </div>
            );
          }}
        </DataState>
      </CardContent>
    </Card>
  );
}
