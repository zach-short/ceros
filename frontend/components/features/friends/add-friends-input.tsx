import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';

export function AddFriendsInput() {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
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
        {showSuggestions && <Suggestions suggestions={suggestions} />}
      </div>
    </>
  );
}

function Suggestions({ suggestions }: { suggestions: string[] }) {
  return (
    <div className={`h-60`}>
      {suggestions.map((suggestion: string) => {
        return <>{suggestion}</>;
      })}
    </div>
  );
}
