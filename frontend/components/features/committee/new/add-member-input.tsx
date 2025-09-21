'use client';

import { Input } from '@/components/ui/input';
import { SearchIcon, UserPlus } from 'lucide-react';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Friendship, User } from '@/lib/api/friends';
import { useFriends } from '@/hooks/api/use-friends';
import { toast } from 'sonner';
import  Fuse  from "fuse.js"

type AddMemberInputProps = {
  /** Optional: parent can hook into this. If omitted, component still works. */
  onAddMember?: (user: User) => void;
};

export function AddMemberInput({ onAddMember }: AddMemberInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load all friendships once
  const { data, error, loading } = useFriends();
  const [friends, setFriends] = useState<Friendship[]>([]);
  useEffect(() => {
    if (data) setFriends(data.friendships || []);
    if (error) setFriends([]);
  }, [data, error]);

  // Derive friend users (accepted only; tweak if you want all)
  const allFriendUsers: User[] = useMemo(
    () =>
      (friends || [])
        .filter((f) => f.status === 'accepted' && f.user)
        .map((f) => f.user!) as User[],
    [friends]
  );

  // Debounce search
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), 200);
    return () => clearTimeout(id);
  }, [value]);

  const fuse = useMemo(() => {
    return new Fuse(allFriendUsers, {
      keys: ["name", "givenName", "familyName", "email"],
      threshold: 0.3, // tweak for fuzziness
    });
  }, [allFriendUsers]);

  const filteredUsers: User[] = useMemo(() => {
    const q = debounced.trim();
    if (!q) return allFriendUsers;
    return fuse.search(q).map(res => res.item);
  }, [debounced, fuse, allFriendUsers]);

  // Single action: add to committee on click
  const handleAdd = (user: User) => {
    // Call parent callback if provided
    onAddMember?.(user);

    // Always give UX feedback locally
    toast.success(`${user.name || user.email} added to committee`);

    // optional UX: clear input and close suggestions
    setValue('');
    setShowSuggestions(false);
  };

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

      {showSuggestions && (
        <Suggestions
          users={loading ? [] : filteredUsers}
          isLoading={loading}
          onSelect={handleAdd}
          setValue={setValue}
        />
      )}
    </div>
  );
}

function Suggestions({
  users,
  isLoading,
  onSelect,
  setValue,
}: {
  users: User[];
  isLoading: boolean;
  onSelect: (user: User) => void;
  setValue: Dispatch<SetStateAction<string>>;
}) {
  if (isLoading) {
    return (
      <div className="min-h-60 flex flex-col items-center justify-center mt-1">
        <p className="text-gray-500">Loading friends…</p>
      </div>
    );
  }

  return (
    <div className="min-h-60 flex flex-col items-start mt-1">
      {users.map((user) => (
        <button
          key={user.id}
          className="flex w-full items-center justify-between p-1 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          onMouseDown={(e) => e.preventDefault()} // keep focus so onBlur doesn't close early
          onClick={() => onSelect(user)}
        >
          <div className="flex flex-col items-start">
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
          <UserPlus size={16} className="text-green-600" />
        </button>
      ))}
    </div>
  );
}
