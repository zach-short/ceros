'use client';

import { Input } from '@/components/ui/input';
import { SearchIcon, UserPlus, UserCheck, Clock, UserX } from 'lucide-react';
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { friendsApi, User } from '@/lib/api/friends';
import { toast } from 'sonner';

export function AddMemberInput() {
  const [value, setValue] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await friendsApi.searchUsers(searchTerm);
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, searchUsers]);

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
        searchUsers(value);
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
      <div className={`relative max-w-80`}>
        <Input
          placeholder='Find New Members'
          value={value}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setValue('');
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <SearchIcon className={`absolute top-2 right-3`} size={20} />
        {showSuggestions && (
          <Suggestions
            setValue={setValue}
            users={users}
            isSearching={isSearching}
            onUserAction={(user) => handleUserAction(user)}
          />
        )}
      </div>
    </>
  );
}

function Suggestions({
  users,
  setValue,
  isSearching,
  onUserAction,
}: {
  users: User[];
  setValue: Dispatch<SetStateAction<string>>;
  isSearching: boolean;
  onUserAction: (user: User) => void;
}) {
  if (isSearching) {
    return (
      <div
        className={`min-h-60 flex flex-col items-center justify-center mt-1`}
      >
        <p className='text-gray-500'>Searching...</p>
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
    <div className={`min-h-60 flex flex-col items-start mt-1`}>
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
                {user.name || 'Unnamed User'}
                {user.isCurrentUser && ' (You)'}
              </p>
              {(user.givenName || user.familyName) && (
                <p className='text-sm text-gray-500'>
                  {user.givenName && user.familyName
                    ? `${user.givenName} ${user.familyName}`
                    : user.givenName || user.familyName}
                </p>
              )}
              {user.email && (
                <p className='text-xs text-gray-400'>{user.email}</p>
              )}
            </div>
            <Icon size={16} className={color} />
          </button>
        );
      })}
    </div>
  );
}