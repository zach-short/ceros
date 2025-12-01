'use client';

import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { User } from '@/lib/api/friends';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Fuse from 'fuse.js';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { getUserDisplayName } from '@/lib/user-utils';

export function AddMemberInput({
  users,
  loading,
  onToggleAction,
  isCheckedAction,
  excludeIds = [],
  placeholder = 'Search friends to add...',
  emptyMessage = 'No friends available',
}: {
  users: User[];
  loading: boolean;
  onToggleAction: (clickedMember: User) => void;
  isCheckedAction: (member: User) => boolean;
  excludeIds?: string[];
  placeholder?: string;
  emptyMessage?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const availableUsers = useMemo(() => {
    return users.filter((user) => !excludeIds.includes(user.id));
  }, [users, excludeIds]);

  const fuse = useMemo(() => {
    return new Fuse(availableUsers, {
      keys: ['name', 'email', 'givenName', 'familyName'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [availableUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableUsers;
    }
    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse, availableUsers]);

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

      <Suggestions
        users={filteredUsers}
        allUsers={availableUsers}
        isLoading={loading}
        onToggleAction={onToggleAction}
        isCheckedAction={isCheckedAction}
        emptyMessage={emptyMessage}
        searchQuery={searchQuery}
      />
    </div>
  );
}

function Suggestions({
  users,
  allUsers,
  isLoading,
  onToggleAction,
  isCheckedAction,
  emptyMessage,
  searchQuery,
}: {
  users: User[];
  allUsers: User[];
  isLoading: boolean;
  onToggleAction: (clickedMember: User) => void;
  isCheckedAction: (member: User) => boolean;
  emptyMessage: string;
  searchQuery: string;
}) {
  if (isLoading) {
    return (
      <div className='min-h-60 flex flex-col items-center justify-center border rounded-md p-4'>
        <DefaultLoader />
        <p className='text-muted-foreground mt-2'>Loading friends...</p>
      </div>
    );
  }

  if (allUsers.length === 0) {
    return (
      <div className='border rounded-md max-h-60 overflow-y-auto'>
        <div className='min-h-40 flex flex-col items-center justify-center p-4'>
          <p className='text-muted-foreground text-sm'>{emptyMessage}</p>
          <p className='text-xs text-muted-foreground mt-1'>
            Add friends to include them in committees
          </p>
        </div>
      </div>
    );
  }

  if (users.length === 0 && searchQuery.trim()) {
    return (
      <div className='border rounded-md max-h-60 overflow-y-auto'>
        <div className='min-h-40 flex flex-col items-center justify-center p-4'>
          <p className='text-muted-foreground text-sm'>
            No friends match &quot;{searchQuery}&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='border rounded-md max-h-60 overflow-y-auto'>
      <div className='divide-y'>
        {users.map((user) => (
          <div
            key={user.id}
            className='flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors'
            onClick={() => onToggleAction(user)}
          >
            <div className='flex items-center justify-center w-5 h-5 border border-input rounded'>
              {isCheckedAction(user) && (
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 12 12'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M10 3L4.5 8.5L2 6'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </div>
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
              <p className='font-medium truncate'>{getUserDisplayName(user)}</p>
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
    </div>
  );
}
