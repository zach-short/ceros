'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/api/friends';
import { toast } from 'sonner';
import { useCreateCommittee } from '@/hooks/api/use-commitee';
import { CreateCommitteeRequest } from '@/lib/api/committee';
import { useSession } from 'next-auth/react';
import { AddMemberInput } from '../shared/add-member-input';

export default function NewCommittee() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'permanent' as 'permanent' | 'temporary',
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedObserverIds, setSelectedObserverIds] = useState<string[]>([]);
  const [selectedChairId, setSelectedChairId] = useState<string>('');
  const [selectedMembersMap, setSelectedMembersMap] = useState<
    Map<string, User>
  >(new Map());

  const selectedMembers = useMemo(
    () =>
      Array.from(selectedMembersMap.values()).filter((user) =>
        selectedMemberIds.includes(user.id),
      ),
    [selectedMembersMap, selectedMemberIds],
  );

  const handleToggleMember = useCallback((clickedMember: User) => {
    setSelectedMemberIds((prev) =>
      prev.includes(clickedMember.id)
        ? prev.filter((id) => id !== clickedMember.id)
        : [...prev, clickedMember.id],
    );

    setSelectedMembersMap((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(clickedMember.id)) {
        newMap.delete(clickedMember.id);
      } else {
        newMap.set(clickedMember.id, clickedMember);
      }
      return newMap;
    });
  }, []);

  const handleToggleObserver = useCallback((clickedMember: User) => {
    setSelectedObserverIds((prev) =>
      prev.includes(clickedMember.id)
        ? prev.filter((id) => id !== clickedMember.id)
        : [...prev, clickedMember.id],
    );
  }, []);

  const handleToggleChair = useCallback((user: User) => {
    setSelectedChairId((prev) => (prev === user.id ? '' : user.id));
  }, []);

  const isMemberChecked = useCallback(
    (member: User) => selectedMemberIds.includes(member.id),
    [selectedMemberIds],
  );

  const isObserverChecked = useCallback(
    (member: User) => selectedObserverIds.includes(member.id),
    [selectedObserverIds],
  );

  const { mutate: createCommittee, loading: createLoading } =
    useCreateCommittee({
      onSuccess: (data: { id: string }) => {
        toast.success('Committee Created!');
        router.push(`/committees/${data.id}`);
      },
      onError: (error) => {
        console.error('Committee creation failed:', error);
        toast.error(error.message || 'Failed to create committee');
      },
    });

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a committee name');
      return;
    }

    if (!session?.user?.id) {
      toast.error('You must be logged in to create a committee');
      return;
    }

    const payload: CreateCommitteeRequest = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      ownerId: session.user.id,
      memberIds: selectedMemberIds,
      observerIds: selectedObserverIds,
      chairId: selectedChairId || undefined,
    };

    createCommittee(payload);
  };

  return (
    <div className='mx-auto max-w-2xl p-6 mb-20'>
      <form className='space-y-6'>
        <div>
          <label className='block text-sm font-medium mb-1'>
            Committee Name
          </label>
          <Input
            className='w-full'
            placeholder='Please enter your committee name...'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>
            Committee Description
          </label>
          <Textarea
            className='w-full h-32'
            placeholder='Please enter your committee description here...'
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-3'>
              Add Members
            </label>
            <AddMemberInput
              onToggleAction={handleToggleMember}
              isCheckedAction={isMemberChecked}
              excludeIds={selectedObserverIds}
              placeholder='Search friends to add as members...'
              emptyMessage='No friends available'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-3'>
              Add Observers (Optional)
            </label>
            <AddMemberInput
              onToggleAction={handleToggleObserver}
              isCheckedAction={isObserverChecked}
              excludeIds={selectedMemberIds}
              placeholder='Search friends to add as observers...'
              emptyMessage='No friends available'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-3'>
              Assign Chair (Optional)
            </label>
            <div className='border rounded-md max-h-60 overflow-y-auto'>
              {selectedMembers.length === 0 ? (
                <div className='min-h-40 flex flex-col items-center justify-center p-4'>
                  <p className='text-muted-foreground text-sm'>
                    No members selected
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Add members first to assign a chair
                  </p>
                </div>
              ) : (
                <div className='divide-y'>
                  {selectedMembers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors ${
                        selectedChairId === user.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleToggleChair(user)}
                    >
                      <div className='flex items-center justify-center w-5 h-5 border rounded-full'>
                        {selectedChairId === user.id && (
                          <div className='w-3 h-3 bg-primary rounded-full' />
                        )}
                      </div>
                      <Avatar className='w-10 h-10'>
                        <AvatarImage src={user.picture || undefined} />
                        <AvatarFallback>
                          {user.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium truncate'>{user.name}</p>
                        <p className='text-sm opacity-60 truncate'>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <label
          htmlFor='IsTemporaryCommittee'
          className='flex items-center gap-3'
        >
          <Checkbox
            id='IsTemporaryCommittee'
            checked={formData.type === 'temporary'}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                type: checked ? 'temporary' : 'permanent',
              })
            }
          />
          <span>Is this committee temporary?</span>
        </label>

        <div className='flex justify-end pt-2'>
          <Button onClick={handleSave} disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}
