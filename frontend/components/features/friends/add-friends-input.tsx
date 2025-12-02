'use client';

import { Input } from '@/components/ui/input';
import {
  SearchIcon,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { friendsApi } from '@/lib/api/friends';
import { User } from '@/models';
import { toast } from 'sonner';
import { UserName } from '@/components/shared/user';
import { getDisplayEmail } from '@/lib/user-privacy';
import { usePaginatedSearch } from '@/hooks/use-paginated-search';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

export function AddFriendsInput() {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    query,
    setQuery,
    items: users,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
  } = usePaginatedSearch<User>({
    fetchFn: friendsApi.searchUsers,
    pageSize: 100,
    debounceMs: 300,
  });

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  const handleUserAction = async (user: User) => {
    if (user.isCurrentUser) {
      toast.error('You cannot add yourself as a friend');
      return;
    }

    const status = user.friendshipStatus;

    if (status?.status === 'accepted') {
      toast.info('You are already friends with this user');
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

    try {
      const response = await friendsApi.requestFriend({ addresseeId: user.id });
      if (response.success) {
        toast.success(`Friend request sent to ${user.name || user.email}`);

        setQuery(query);
      } else {
        toast.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  return (
    <>
      <div className={`relative `}>
        <Input
          placeholder='Find Friends'
          value={query}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setQuery('');
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        <SearchIcon className={`absolute top-2 right-3`} size={20} />
        {showSuggestions && (
          <Suggestions
            users={users}
            isSearching={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            onUserAction={(user) => handleUserAction(user)}
          />
        )}
      </div>
    </>
  );
}

function Suggestions({
  users,
  isSearching,
  isLoadingMore,
  hasMore,
  loadMoreRef,
  onUserAction,
}: {
  users: User[];
  isSearching: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  onUserAction: (user: User) => void;
}) {
  if (isSearching) {
    return (
      <div
        className={`min-h-60 flex flex-col items-center justify-center mt-1`}
      >
        <Loader2 className='animate-spin text-gray-500' size={20} />
        <p className='text-gray-500 mt-2'>Searching...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        className={`min-h-60 flex flex-col items-center justify-center mt-1`}
      >
        <p className='text-gray-500'>No users found</p>
      </div>
    );
  }

  const getIconAndColor = (user: User) => {
    if (user.isCurrentUser) {
      return { icon: UserX, color: 'text-gray-400', disabled: true };
    }

    const status = user.friendshipStatus;

    if (!status) {
      return { icon: UserPlus, color: 'text-green-600', disabled: false };
    }

    switch (status.status) {
      case 'accepted':
        return { icon: UserCheck, color: 'text-green-600', disabled: true };
      case 'blocked':
        return { icon: UserX, color: 'text-red-600', disabled: true };
      case 'pending':
        if (status.isPendingFromMe) {
          return { icon: Clock, color: 'text-orange-500', disabled: true };
        } else if (status.isPendingToMe) {
          return { icon: Clock, color: 'text-blue-500', disabled: true };
        }
        break;
    }

    return { icon: UserPlus, color: 'text-green-600', disabled: false };
  };

  return (
    <div
      className={`min-h-60 max-h-96 overflow-y-auto flex flex-col items-start mt-1`}
    >
      {users.map((user: User) => {
        const { icon: Icon, color, disabled } = getIconAndColor(user);
        return (
          <button
            key={user.id}
            className={`flex flex-row justify-between items-center w-full p-1 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${
              disabled ? 'cursor-default' : 'cursor-pointer'
            }`}
            onClick={() => onUserAction(user)}
          >
            <div className='flex flex-col items-start'>
              <p className='font-medium'>
                <UserName
                  user={user}
                  showFullName={false}
                  fallback='Unnamed User'
                />
                {user.isCurrentUser && ' (You)'}
              </p>
              <p className='text-sm text-gray-500'>
                <UserName user={user} showFullName={true} />
              </p>
              {getDisplayEmail(user) && (
                <p className='text-xs text-gray-400'>
                  {getDisplayEmail(user)}
                </p>
              )}
            </div>
            <Icon size={16} className={color} />
          </button>
        );
      })}
      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className='w-full py-2'>
        {isLoadingMore && (
          <div className='flex justify-center'>
            <Loader2 className='animate-spin text-gray-500' size={16} />
          </div>
        )}
      </div>
      {!hasMore && users.length > 0 && (
        <p className='text-xs text-gray-400 text-center w-full py-2'>
          End of results
        </p>
      )}
    </div>
  );
}
