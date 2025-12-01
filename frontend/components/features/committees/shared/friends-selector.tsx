'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchIcon } from 'lucide-react';
import { User } from '@/lib/api/friends';
import Fuse from 'fuse.js';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { getUserDisplayName } from '@/lib/user-utils';

interface FriendsSelectorProps {
  friends: User[];
  loading: boolean;
  selectedIds: string[];
  onToggle: (user: User) => void;
  excludeIds?: string[];
  placeholder?: string;
  emptyMessage?: string;
}

export function FriendsSelector({
  friends,
  loading,
  selectedIds,
  onToggle,
  excludeIds = [],
  placeholder = 'Search friends by name or email...',
  emptyMessage = 'No friends found',
}: FriendsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const availableFriends = useMemo(() => {
    return friends.filter((friend) => !excludeIds.includes(friend.id));
  }, [friends, excludeIds]);

  const fuse = useMemo(() => {
    return new Fuse(availableFriends, {
      keys: ['name', 'email', 'givenName', 'familyName'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [availableFriends]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableFriends;
    }
    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse, availableFriends]);

  const isChecked = (user: User) => selectedIds.includes(user.id);

  if (loading) {
    return (
      <div className='min-h-60 flex flex-col items-center justify-center border rounded-md p-4'>
        <DefaultLoader />
        <p className='text-muted-foreground mt-2'>Loading friends...</p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='relative'>
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pr-10'
        />
        <SearchIcon
          className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'
          size={18}
        />
      </div>

      <div className='border rounded-md max-h-60 overflow-y-auto'>
        {availableFriends.length === 0 ? (
          <div className='min-h-40 flex flex-col items-center justify-center p-4'>
            <p className='text-muted-foreground text-sm'>{emptyMessage}</p>
            <p className='text-xs text-muted-foreground mt-1'>
              Add friends to include them in committees
            </p>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className='min-h-40 flex flex-col items-center justify-center p-4'>
            <p className='text-muted-foreground text-sm'>
              No friends match &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <div className='divide-y'>
            {filteredFriends.map((user) => (
              <div
                key={user.id}
                className='flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors'
                onClick={() => onToggle(user)}
              >
                <Checkbox
                  checked={isChecked(user)}
                  onCheckedChange={() => {}}
                />
                <Avatar className='w-10 h-10'>
                  <AvatarImage src={user.picture || undefined} />
                  <AvatarFallback>
                    {getUserDisplayName(user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium truncate'>
                    {getUserDisplayName(user)}
                  </p>
                  {(user.givenName || user.familyName) && (
                    <p className='text-sm text-muted-foreground truncate'>
                      {user.givenName && user.familyName
                        ? `${user.givenName} ${user.familyName}`
                        : user.givenName || user.familyName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className='text-sm text-muted-foreground'>
          {selectedIds.length} friend{selectedIds.length !== 1 ? 's' : ''}{' '}
          selected
        </div>
      )}
    </div>
  );
}
