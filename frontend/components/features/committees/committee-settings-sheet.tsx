'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Committee } from '@/models/committee';
import { useUpdateCommittee, useDeleteCommittee } from '@/hooks/api/use-commitee';
import { UpdateCommitteeRequest } from '@/lib/api/committee';
import { toast } from 'sonner';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { AvatarPicker } from '@/components/shared/button/avatar-picker';
import { getCommitteePicture } from '@/lib/utils/committee-avatar';
import { Trash2 } from 'lucide-react';

interface CommitteeSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  committee: Committee;
  onUpdate: () => void;
}

export function CommitteeSettingsSheet({
  open,
  onOpenChange,
  committee,
  onUpdate,
}: CommitteeSettingsSheetProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdateCommitteeRequest>({
    name: committee.name,
    description: committee.description || '',
    picture: committee.picture || '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

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

  useEffect(() => {
    if (open) {
      setFormData({
        name: committee.name,
        description: committee.description || '',
        picture: committee.picture || '',
      });
      setDeleteConfirmation('');
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

  const isDeleteDisabled = deleteConfirmation !== committee.name || deleteLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Committee Settings</SheetTitle>
          <SheetDescription>
            Update your committee&apos;s profile information
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-6 p-6'>
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
              <div className='text-sm text-muted-foreground'>
                Click to change the committee picture
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
              className='w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
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
              disabled={updateLoading}
              className='flex-1'
            >
              {updateLoading ? <DefaultLoader /> : 'Save Changes'}
            </Button>
          </div>

          <div className='border-t pt-6 mt-6'>
            <div className='space-y-2 mb-4'>
              <h3 className='text-sm font-semibold text-red-600'>Danger Zone</h3>
              <p className='text-xs text-muted-foreground'>
                Deleting a committee is permanent and cannot be undone. All messages, motions, and data will be lost.
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
        </div>
      </SheetContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              committee and remove all associated data including messages, motions,
              and member information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-2 py-4'>
            <Label htmlFor='delete-confirm' className='text-sm font-medium'>
              Type <span className='font-bold'>{committee.name}</span> to confirm
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
    </Sheet>
  );
}
