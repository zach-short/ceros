'use client';

import { Input } from '@/components/ui/input';
import { SearchIcon, UserPlus } from 'lucide-react';
import {
  useState,
} from 'react';
import { User } from '@/lib/api/friends';
import { useFriends } from '@/hooks/api/use-friends';
import { Checkbox } from "@/components/ui/checkbox"
import { se } from 'date-fns/locale';


export function AddObserverInput({
  // onToggle,
  // isChecked
}: {
  // onToggle: (clickedMember : User) => void;
  // isChecked: (member: User) => boolean;
}
) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load all friendships once
  const { data, error, loading } = useFriends();
  const friendships = data?.friendships ?? [];
  const users = friendships.flatMap((friendship) =>  
    friendship.user ? [friendship.user] : [])

  return (
    <div className="relative max-w-80">
      <Input
        placeholder="Find Members (friends)"
        value={value}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // keep UX: clear field on blur and close popover shortly after
          setValue('');
          setTimeout(() => setShowSuggestions(false), 150);
        }}
        onChange={(e) => setValue(e.target.value)}
      />
      <SearchIcon className="absolute top-2 right-3" size={20} />


      {true && (
         <Suggestions
          users={loading ? [] : users}
          isLoading={loading}
          // onToggle={onToggle}
          // isChecked={isChecked}
        />
      )}
    </div>
  );
}

function Suggestions({
  users,
  isLoading,
  // onToggle,
  // isChecked
}: {
  users: User[];
  isLoading: boolean;
  // onToggle: (clickedMember: User) => void;
  // isChecked: (member: User) => boolean;
}) {

  if (isLoading) {
    return (
      <div className="min-h-60 flex flex-col items-center justify-center mt-1">
        <p className="text-gray-500">Loading friends…</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className='min-h-60 flex flex-col items-center justify-center mt-1'>
        <p className='text-gray-500'>No friends found.</p>
      </div>
    )
  }

    return (
      <div className="min-h-60 flex flex-col items-start mt-1">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex w-full items-center justify-between p-1 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div>
              <p className="font-medium">
                {user.name || 'Unnamed User'}
                {'isCurrentUser' in user && (user as any).isCurrentUser && ' (You)'}
              </p>
              {(user.givenName || user.familyName) && (
                <p className="text-sm text-gray-500">
                  {user.givenName && user.familyName
                    ? `${user.givenName} ${user.familyName}`
                    : user.givenName || user.familyName}
                </p>
              )}
              {user.email && (
                <p className="text-xs text-gray-400">{user.email}</p>
              )}
            </div>
            <div>
              <Checkbox 
              className='h-4 w-4 border border-gray-300'
              // checked={isChecked(user)}
              // onCheckedChange={() => {
              //   onToggle(user);
              // }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
