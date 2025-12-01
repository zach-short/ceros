'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, Loader2 } from 'lucide-react';
import { User, friendsApi } from '@/lib/api/friends';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { getUserDisplayName } from '@/lib/user-utils';
import { useFriendsPaginated } from '@/hooks/api/use-friends-paginated';
import { usePaginatedSearch } from '@/hooks/use-paginated-search';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

interface FriendsSelectorProps {
  selectedIds: string[];
  onToggle: (user: User) => void;
  excludeIds?: string[];
  placeholder?: string;
  emptyMessage?: string;
}

export function FriendsSelector({
  selectedIds,
  onToggle,
  excludeIds = [],
  placeholder = 'Search all users by name...',
  emptyMessage = 'No friends found',
}: FriendsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length > 0;

  const {
    friends,
    hasMore: friendsHasMore,
    isLoading: friendsLoading,
    isLoadingMore: friendsLoadingMore,
    loadMore: loadMoreFriends,
  } = useFriendsPaginated();

  const {
    items: searchResults,
    hasMore: searchHasMore,
    isLoading: searchLoading,
    isLoadingMore: searchLoadingMore,
    loadMore: loadMoreSearch,
  } = usePaginatedSearch<User>({
    fetchFn: friendsApi.searchUsers,
    pageSize: 100,
    debounceMs: 300,
  });

  const friendIds = useMemo(() => {
    return new Set(friends.map((f) => f.id));
  }, [friends]);

  const displayUsers = isSearching ? searchResults : friends;
  const hasMore = isSearching ? searchHasMore : friendsHasMore;
  const isLoading = isSearching ? searchLoading : friendsLoading;
  const isLoadingMore = isSearching ? searchLoadingMore : friendsLoadingMore;
  const loadMore = isSearching ? loadMoreSearch : loadMoreFriends;

  const availableUsers = useMemo(() => {
    return displayUsers.filter((user) => !excludeIds.includes(user.id));
  }, [displayUsers, excludeIds]);

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  const isChecked = (user: User) => selectedIds.includes(user.id);
  const isFriend = (user: User) => friendIds.has(user.id);

  if (friendsLoading && !isSearching) {
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
        {isLoading ? (
          <div className='min-h-40 flex flex-col items-center justify-center p-4'>
            <Loader2 className='animate-spin text-muted-foreground' size={20} />
            <p className='text-muted-foreground mt-2 text-sm'>
              {isSearching ? 'Searching...' : 'Loading friends...'}
            </p>
          </div>
        ) : availableUsers.length === 0 ? (
          <div className='min-h-40 flex flex-col items-center justify-center p-4'>
            <p className='text-muted-foreground text-sm'>
              {isSearching ? `No users match "${searchQuery}"` : emptyMessage}
            </p>
            {!isSearching && (
              <p className='text-xs text-muted-foreground mt-1'>
                Add friends to include them in committees
              </p>
            )}
          </div>
        ) : (
          <div className='divide-y'>
            {availableUsers.map((user) => (
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
                  <div className='flex items-center gap-2'>
                    <p className='font-medium truncate'>
                      {getUserDisplayName(user)}
                    </p>
                    {isSearching && isFriend(user) && (
                      <Badge
                        variant='secondary'
                        className='text-xs px-1.5 py-0'
                      >
                        Friend
                      </Badge>
                    )}
                  </div>
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
            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className='py-2'>
              {isLoadingMore && (
                <div className='flex justify-center'>
                  <Loader2
                    className='animate-spin text-muted-foreground'
                    size={16}
                  />
                </div>
              )}
            </div>
            {!hasMore && availableUsers.length > 0 && (
              <p className='text-xs text-muted-foreground text-center py-2'>
                {isSearching ? 'End of search results' : 'All friends loaded'}
              </p>
            )}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className='text-sm text-muted-foreground'>
          {selectedIds.length} {isSearching ? 'user' : 'friend'}
          {selectedIds.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
