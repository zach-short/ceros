'use client';

import { Input } from '@/components/ui/input';
import { SearchIcon, UserPlus } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

export function AddFriendsInput() {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([
    'test',
    'test1',
    'test2',
    'test3',
    'test3',
    'test3',
    'test3',
    'test3',
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <>
      <div className={`relative max-w-80`}>
        <Input
          placeholder='Find Friends'
          value={value}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setShowSuggestions(false)}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <SearchIcon className={`absolute top-2 right-3`} size={20} />
        {showSuggestions && (
          <Suggestions setValue={setValue} suggestions={suggestions} />
        )}
      </div>
    </>
  );
}

function Suggestions({
  suggestions,
  setValue,
}: {
  suggestions: string[];
  setValue: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className={`min-h-60 flex flex-col items-start mt-1`}>
      {suggestions.map((suggestion: string, i: number) => {
        return (
          <button
            key={i}
            className={`flex flex-row justify-between items-center w-full p-1 px-4`}
            onClick={() => setValue(suggestion)}
          >
            <p>{suggestion}</p>
            <UserPlus size={10} />
          </button>
        );
      })}
    </div>
  );
}
