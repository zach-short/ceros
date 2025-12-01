'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Committee } from '@/models/committee';
import { User } from '@/models/user';
import {
  useUpdateCommittee,
  useDeleteCommittee,
  useAddMember,
  useRemoveMember,
  useAddObserver,
  useRemoveObserver,
  useChangeChair,
} from '@/hooks/api/use-commitee';
import { UpdateCommitteeRequest } from '@/lib/api/committee';
import { useFriends } from '@/hooks/api/use-friends';
import { toast } from 'sonner';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { AvatarPicker } from '@/components/shared/button/avatar-picker';
import { getCommitteePicture } from '@/lib/utils/committee-avatar';
import { Trash2, UserPlus, Crown } from 'lucide-react';
import { FriendsSelector } from './shared/friends-selector';

interface CommitteeSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  committee: Committee;
  members: User[];
  onUpdate: () => void;
}

export function CommitteeSettingsSheet({
  open,
  onOpenChange,
  committee,
  members,
  onUpdate,
}: CommitteeSettingsSheetProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState<UpdateCommitteeRequest>({
    name: committee.name,
    description: committee.description || '',
    picture: committee.picture || '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addObserverDialogOpen, setAddObserverDialogOpen] = useState(false);
  const [changeChairDialogOpen, setChangeChairDialogOpen] = useState(false);
  const [removeConfirmDialogOpen, setRemoveConfirmDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{
    id: string;
    name: string;
    type: 'member' | 'observer';
  } | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedObserverIds, setSelectedObserverIds] = useState<string[]>([]);
  const [selectedChairId, setSelectedChairId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('general');

  const { data: friendsData, loading: friendsLoading } = useFriends();
  const friendships = friendsData?.friendships ?? [];
  const allFriends = friendships.flatMap((friendship) =>
    friendship.user ? [friendship.user] : [],
  );

  const isOwner = committee?.ownerId === session?.user?.id;
  const isChair = committee?.chairId === session?.user?.id;
  const canManageMembers = isOwner || isChair;

  const { mutate: updateCommittee, loading: updateLoading } =
    useUpdateCommittee(committee.id, {
      onSuccess: () => {
        toast.success('Committee updated successfully!');
        onUpdate();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update committee');
      },
    });

  const { mutate: deleteCommittee, loading: deleteLoading } =
    useDeleteCommittee(committee.id, {
      onSuccess: () => {
        toast.success('Committee deleted successfully!');
        setDeleteDialogOpen(false);
        onOpenChange(false);
        router.push('/');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete committee');
      },
    });

  const { mutate: addMember, loading: addMemberLoading } = useAddMember(
    committee.id,
    {
      onSuccess: () => {
        toast.success('Members added successfully!');
        setAddMemberDialogOpen(false);
        setSelectedMemberIds([]);
        onUpdate();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add members');
      },
    },
  );

  const { mutate: removeMember, loading: removeMemberLoading } =
    useRemoveMember(committee.id, {
      onSuccess: () => {
        toast.success('Member removed successfully!');
        setRemoveConfirmDialogOpen(false);
        setUserToRemove(null);
        onUpdate();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove member');
      },
    });

  const { mutate: addObserver, loading: addObserverLoading } = useAddObserver(
    committee.id,
    {
      onSuccess: () => {
        toast.success('Observers added successfully!');
        setAddObserverDialogOpen(false);
        setSelectedObserverIds([]);
        onUpdate();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add observers');
      },
    },
  );

  const { mutate: removeObserver, loading: removeObserverLoading } =
    useRemoveObserver(committee.id, {
      onSuccess: () => {
        toast.success('Observer removed successfully!');
        setRemoveConfirmDialogOpen(false);
        setUserToRemove(null);
        onUpdate();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove observer');
      },
    });

  const { mutate: changeChair, loading: changeChairLoading } = useChangeChair(
    committee.id,
    {
      onSuccess: () => {
        toast.success('Chair changed successfully!');
        setChangeChairDialogOpen(false);
        setSelectedChairId('');
        onUpdate();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to change chair');
      },
    },
  );

  useEffect(() => {
    if (open) {
      setFormData({
        name: committee.name,
        description: committee.description || '',
        picture: committee.picture || '',
      });
      setDeleteConfirmation('');
      setActiveTab('general');
      setSelectedMemberIds([]);
      setSelectedObserverIds([]);
      setSelectedChairId('');
    }
  }, [open, committee]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Committee name is required');
      return;
    }

    updateCommittee(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: committee.name,
      description: committee.description || '',
      picture: committee.picture || '',
    });
    onOpenChange(false);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation === committee.name) {
      deleteCommittee(undefined as any);
    } else {
      toast.error('Committee name does not match');
    }
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    setUserToRemove({ id: userId, name: userName, type: 'member' });
    setRemoveConfirmDialogOpen(true);
  };

  const handleRemoveObserver = (userId: string, userName: string) => {
    setUserToRemove({ id: userId, name: userName, type: 'observer' });
    setRemoveConfirmDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!userToRemove) return;

    if (userToRemove.type === 'member') {
      removeMember(userToRemove.id);
    } else {
      removeObserver(userToRemove.id);
    }
  };

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

  const handleToggleChair = (user: User) => {
    setSelectedChairId((prev) => (prev === user.id ? '' : user.id));
  };

  const handleAddMembers = async () => {
    if (selectedMemberIds.length === 0) {
      toast.error('Please select at least one friend');
      return;
    }

    for (const userId of selectedMemberIds) {
      try {
        await addMember({ userId });
      } catch (error) {
        console.error('Failed to add member:', error);
      }
    }
  };

  const handleAddObservers = async () => {
    if (selectedObserverIds.length === 0) {
      toast.error('Please select at least one friend');
      return;
    }

    for (const userId of selectedObserverIds) {
      try {
        await addObserver({ userId });
      } catch (error) {
        console.error('Failed to add observer:', error);
      }
    }
  };

  const handleChangeChair = () => {
    if (!selectedChairId) {
      toast.error('Please select a user');
      return;
    }
    changeChair({ newChairId: selectedChairId });
  };

  const isDeleteDisabled =
    deleteConfirmation !== committee.name || deleteLoading;

  const currentMembers = members.filter(
    (m) =>
      committee.memberIds?.includes(m.id) &&
      m.id !== committee.ownerId &&
      m.id !== committee.chairId,
  );

  const currentObservers = members.filter((m) =>
    committee.observerIds?.includes(m.id),
  );

  const owner = members.find((m) => m.id === committee.ownerId);
  const chair = members.find((m) => m.id === committee.chairId);

  const existingUserIds = [
    committee.ownerId,
    committee.chairId,
    ...(committee.memberIds || []),
    ...(committee.observerIds || []),
  ];

  const eligibleChairCandidates = members.filter(
    (user) =>
      user.id !== committee.ownerId &&
      user.id !== committee.chairId &&
      (committee.memberIds?.includes(user.id) ||
        committee.observerIds?.includes(user.id)),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Committee Settings</SheetTitle>
          <SheetDescription>
            Manage your committee&apos;s settings and members
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-6'>
          <div className='px-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='general'>General</TabsTrigger>
              <TabsTrigger value='members'>Members</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='general' className='space-y-6 px-6 my-6'>
            <div className='space-y-2'>
              <Label>Committee Picture</Label>
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <Avatar className='w-20 h-20'>
                    <AvatarImage
                      src={getCommitteePicture({
                        name: formData.name,
                        picture: formData.picture,
                      })}
                    />
                    <AvatarFallback>
                      {formData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute inset-0 bg-black/40 rounded-full' />
                  <AvatarPicker
                    type='committee'
                    seed={committee.name}
                    currentAvatar={formData.picture}
                    onSelect={(url) => {
                      setFormData({ ...formData, picture: url });
                    }}
                    onUploadError={() => {
                      toast.error('Error uploading photo');
                    }}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='name'>Committee Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='Enter committee name'
                disabled={!isOwner}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Describe the committee...'
                disabled={!isOwner}
                className='w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50'
              />
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                variant='outline'
                onClick={handleCancel}
                disabled={updateLoading}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateLoading || !isOwner}
                className='flex-1'
              >
                {updateLoading ? <DefaultLoader /> : 'Save Changes'}
              </Button>
            </div>

            {isOwner && (
              <div className='border-t pt-6 mt-6'>
                <div className='space-y-2 mb-4'>
                  <h3 className='text-sm font-semibold text-red-600'>
                    Danger Zone
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    Deleting a committee is permanent and cannot be undone. All
                    messages, motions, and data will be lost.
                  </p>
                </div>
                <Button
                  variant='destructive'
                  onClick={handleDeleteClick}
                  disabled={updateLoading}
                  className='w-full'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Committee
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value='members' className='space-y-6 p-6'>
            {!canManageMembers && (
              <div className='text-sm text-muted-foreground p-4 bg-muted rounded-md'>
                Only the owner or chair can manage members.
              </div>
            )}

            <div className='space-y-4'>
              {owner && (
                <div>
                  <h3 className='text-xs font-semibold uppercase opacity-60 mb-2'>
                    Owner
                  </h3>
                  <div className='flex items-center gap-3 p-3 rounded-lg bg-accent/50'>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={owner.picture || undefined} />
                      <AvatarFallback>
                        {owner.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium truncate'>{owner.name}</p>
                      <p className='text-sm opacity-60 truncate'>
                        {owner.email}
                      </p>
                    </div>
                    <div className='text-xs opacity-60 font-medium'>Owner</div>
                  </div>
                </div>
              )}

              {chair && (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-xs font-semibold uppercase opacity-60'>
                      Chair
                    </h3>
                    {isOwner && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setChangeChairDialogOpen(true)}
                      >
                        <Crown className='mr-1 h-3 w-3' />
                        Change Chair
                      </Button>
                    )}
                  </div>
                  <div className='flex items-center gap-3 p-3 rounded-lg bg-accent/50'>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={chair.picture || undefined} />
                      <AvatarFallback>
                        {chair.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium truncate'>{chair.name}</p>
                      <p className='text-sm opacity-60 truncate'>
                        {chair.email}
                      </p>
                    </div>
                    <div className='text-xs opacity-60 font-medium'>Chair</div>
                  </div>
                </div>
              )}

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xs font-semibold uppercase opacity-60'>
                    Members ({currentMembers.length})
                  </h3>
                  {canManageMembers && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setAddMemberDialogOpen(true)}
                    >
                      <UserPlus className='mr-1 h-3 w-3' />
                      Add Member
                    </Button>
                  )}
                </div>
                <div className='space-y-1'>
                  {currentMembers.length === 0 ? (
                    <div className='text-sm text-muted-foreground p-4 text-center bg-muted rounded-md'>
                      No members yet
                    </div>
                  ) : (
                    currentMembers.map((member) => (
                      <div
                        key={member.id}
                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent'
                      >
                        <Avatar className='w-10 h-10'>
                          <AvatarImage src={member.picture || undefined} />
                          <AvatarFallback>
                            {member.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{member.name}</p>
                          <p className='text-sm opacity-60 truncate'>
                            {member.email}
                          </p>
                        </div>
                        {canManageMembers && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleRemoveMember(member.id, member.name || '')
                            }
                          >
                            <Trash2 className='h-4 w-4 text-red-600' />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xs font-semibold uppercase opacity-60'>
                    Observers ({currentObservers.length})
                  </h3>
                  {canManageMembers && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setAddObserverDialogOpen(true)}
                    >
                      <UserPlus className='mr-1 h-3 w-3' />
                      Add Observer
                    </Button>
                  )}
                </div>
                <div className='space-y-1'>
                  {currentObservers.length === 0 ? (
                    <div className='text-sm text-muted-foreground p-4 text-center bg-muted rounded-md'>
                      No observers yet
                    </div>
                  ) : (
                    currentObservers.map((observer) => (
                      <div
                        key={observer.id}
                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent'
                      >
                        <Avatar className='w-10 h-10'>
                          <AvatarImage src={observer.picture || undefined} />
                          <AvatarFallback>
                            {observer.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>
                            {observer.name}
                          </p>
                          <p className='text-sm opacity-60 truncate'>
                            {observer.email}
                          </p>
                        </div>
                        {canManageMembers && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleRemoveObserver(
                                observer.id,
                                observer.name || '',
                              )
                            }
                          >
                            <Trash2 className='h-4 w-4 text-red-600' />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              committee and remove all associated data including messages,
              motions, and member information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-2 py-4'>
            <Label htmlFor='delete-confirm' className='text-sm font-medium'>
              Type <span className='font-bold'>{committee.name}</span> to
              confirm
            </Label>
            <Input
              id='delete-confirm'
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder='Committee name'
              className='w-full'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteConfirmation('')}
              disabled={deleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleteDisabled}
              className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
            >
              {deleteLoading ? <DefaultLoader /> : 'Delete Committee'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Select friends to add as members to this committee
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <FriendsSelector
              friends={allFriends}
              loading={friendsLoading}
              selectedIds={selectedMemberIds}
              onToggle={handleToggleMember}
              excludeIds={existingUserIds}
              placeholder='Search friends to add as members...'
              emptyMessage='No friends available to add'
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setAddMemberDialogOpen(false);
                setSelectedMemberIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedMemberIds.length === 0 || addMemberLoading}
            >
              {addMemberLoading ? (
                <DefaultLoader />
              ) : (
                `Add ${selectedMemberIds.length} Member${selectedMemberIds.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addObserverDialogOpen}
        onOpenChange={setAddObserverDialogOpen}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Add Observers</DialogTitle>
            <DialogDescription>
              Select friends to add as observers to this committee
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <FriendsSelector
              friends={allFriends}
              loading={friendsLoading}
              selectedIds={selectedObserverIds}
              onToggle={handleToggleObserver}
              excludeIds={existingUserIds}
              placeholder='Search friends to add as observers...'
              emptyMessage='No friends available to add'
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setAddObserverDialogOpen(false);
                setSelectedObserverIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddObservers}
              disabled={selectedObserverIds.length === 0 || addObserverLoading}
            >
              {addObserverLoading ? (
                <DefaultLoader />
              ) : (
                `Add ${selectedObserverIds.length} Observer${selectedObserverIds.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={changeChairDialogOpen}
        onOpenChange={setChangeChairDialogOpen}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Change Committee Chair</DialogTitle>
            <DialogDescription>
              Select a member or observer to become the new chair
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <div className='border rounded-md max-h-60 overflow-y-auto'>
              {eligibleChairCandidates.length === 0 ? (
                <div className='min-h-40 flex flex-col items-center justify-center p-4'>
                  <p className='text-muted-foreground text-sm'>
                    No eligible candidates
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Add members or observers first
                  </p>
                </div>
              ) : (
                <div className='divide-y'>
                  {eligibleChairCandidates.map((user) => (
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
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setChangeChairDialogOpen(false);
                setSelectedChairId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeChair}
              disabled={!selectedChairId || changeChairLoading}
            >
              {changeChairLoading ? <DefaultLoader /> : 'Change Chair'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={removeConfirmDialogOpen}
        onOpenChange={setRemoveConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {userToRemove?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.name} as a{' '}
              {userToRemove?.type}? They will no longer have access to committee
              discussions and materials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRemoveConfirmDialogOpen(false);
                setUserToRemove(null);
              }}
              disabled={removeMemberLoading || removeObserverLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              disabled={removeMemberLoading || removeObserverLoading}
              className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
            >
              {removeMemberLoading || removeObserverLoading ? (
                <DefaultLoader />
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
