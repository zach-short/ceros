'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FriendsSelector } from '../shared/friends-selector';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/api/friends';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFriends } from '@/hooks/api/use-friends';
import { toast } from 'sonner';
import { useCreateCommittee } from '@/hooks/api/use-commitee';
import { CreateCommitteeRequest } from '@/lib/api/committee';
import { useSession } from 'next-auth/react';

export default function NewCommittee() {
  const { data: session } = useSession();

  const [formData, setFormData] = useState<CreateCommitteeRequest>({
    name: '',
    description: '',
    type: 'permanent',
    ownerId: '',
    chairId: undefined,
    memberIds: [],
    observerIds: [],
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedObserverIds, setSelectedObserverIds] = useState<string[]>([]);
  const [selectedChairId, setSelectedChairId] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      setFormData((prev) => ({ ...prev, ownerId: session.user.id }));
    }
  }, [session]);

  const { data, error, loading } = useFriends();
  const friendships = data?.friendships ?? [];

  const users = useMemo(
    () =>
      friendships.flatMap((friendship) =>
        friendship.user ? [friendship.user] : [],
      ),
    [friendships],
  );

  const selectedMembers = useMemo(
    () => users.filter((user) => selectedMemberIds.includes(user.id)),
    [users, selectedMemberIds],
  );

  const existingUserIds = useMemo(
    () => [...selectedMemberIds, ...selectedObserverIds],
    [selectedMemberIds, selectedObserverIds],
  );

  const handleToggleMember = (user: User) => {
    setSelectedMemberIds((prev) =>
      prev.includes(user.id)
        ? prev.filter((id) => id !== user.id)
        : [...prev, user.id],
    );
  };

  const handleToggleObserver = (user: User) => {
    setSelectedObserverIds((prev) =>
      prev.includes(user.id)
        ? prev.filter((id) => id !== user.id)
        : [...prev, user.id],
    );
  };

  const handleToggleChair = (chairId: string) => {
    setSelectedChairId(chairId);
  };

  const { mutate: createCommittee, loading: createLoading } =
    useCreateCommittee({
      onSuccess: (data: { id: string }) => {
        toast.success('Committee Created!');
        router.push(`/committees/${data.id}`);
      },
      onError: (error) => {
        console.error('Commitee creation failed:', error);
        toast.error(error.message || 'Failed to create committee');
      },
    });

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a committee name');
      return;
    }

    const payload: CreateCommitteeRequest = {
      ...formData,
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
            placeholder='Please enter you committee name...'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>
            Committee Description
          </label>
          <Textarea
            className='w-full h-50'
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
            <FriendsSelector
              friends={users}
              loading={loading}
              selectedIds={selectedMemberIds}
              onToggle={handleToggleMember}
              excludeIds={selectedObserverIds}
              placeholder='Search friends to add as members...'
              emptyMessage='No friends available'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-3'>
              Add Observers (Optional)
            </label>
            <FriendsSelector
              friends={users}
              loading={loading}
              selectedIds={selectedObserverIds}
              onToggle={handleToggleObserver}
              excludeIds={selectedMemberIds}
              placeholder='Search friends to add as observers...'
              emptyMessage='No friends available'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>
              Assign Chair
            </label>
            <Select
              value={selectedChairId}
              onValueChange={handleToggleChair}
              disabled={selectedMembers.length === 0}
            >
              <SelectTrigger className='w-full font-medium'>
                <SelectValue placeholder='Select a Member' />
              </SelectTrigger>
              <SelectContent className='font-medium'>
                {selectedMembers.length > 0 ? (
                  selectedMembers.map((member) => (
                    <SelectItem
                      key={member.id}
                      value={member.id}
                      className='font-medium'
                    >
                      {member.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value='no-members'
                    disabled
                    className='text-muted-foreground text-sm italic'
                  >
                    No members selected
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
          <Button onClick={handleSave}>Save</Button>
        </div>
      </form>
    </div>
  );
}
