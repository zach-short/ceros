'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AddMemberInput } from './add-member-input';
import { Button } from '@/components/ui/button';
import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/api/friends';
import { MemberSheet } from './member-sheet';
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
    chairId: '',
    memberIds: [],
    observerIds: [],
  });

  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      setFormData((prev) => ({ ...prev, ownerId: session.user.id }));
    }
  }, [session]);

  const { data, error, loading } = useFriends();
  const friendships = data?.friendships ?? [];
  const users = friendships.flatMap((friendship) =>
    friendship.user ? [friendship.user] : [],
  );

  const selectedMembers = users.filter((user) =>
    formData.memberIds.includes(user.id),
  );

  const onChairChange = (chairId: string) => {
    setFormData({ ...formData, chairId });
  };

  const isChecked = useCallback(
    (member: User) => {
      return formData.memberIds.includes(member.id);
    },
    [formData.memberIds],
  );

  const handleToggle = (clickedMember: User) => {
    const isIncluded = formData.memberIds.includes(clickedMember.id);
    if (isIncluded) {
      setFormData({
        ...formData,
        memberIds: formData.memberIds.filter((id) => id !== clickedMember.id),
      });
    } else {
      setFormData({
        ...formData,
        memberIds: [...formData.memberIds, clickedMember.id],
      });
    }
  };

  const handleSaveMemberChange = (membersBuffer: User[]) => {
    if (membersBuffer.length === 0) {
      return;
    }

    const bufferIds = membersBuffer.map((m) => m.id);
    setFormData({
      ...formData,
      memberIds: formData.memberIds.filter((id) => !bufferIds.includes(id)),
    });
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

    createCommittee(formData);
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

        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Enter Members
            </label>
            <div>
              <AddMemberInput
                users={users}
                loading={loading}
                onToggle={handleToggle}
                isChecked={isChecked}
              />
              <MemberSheet
                selectedMembers={selectedMembers}
                onSave={handleSaveMemberChange}
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Assign Chair
            </label>
            <Select onValueChange={onChairChange}>
              <SelectTrigger className='w-[240px] font-medium'>
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
                  <div className='text-muted-foreground px-2 py-1 text-sm italic'>
                    No members found
                  </div>
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
