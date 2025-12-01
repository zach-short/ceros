'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteAccount } from '@/hooks/api/use-users';
import { signOut } from 'next-auth/react';

export function DangerZone() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: deleteAccount, loading } = useDeleteAccount({
    onSuccess: () => {
      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/' });
    },
    onError: (error) => {
      console.error('Account deletion failed:', error);
      toast.error(error.message || 'Failed to delete account');
    },
  });

  const handleDeleteAccount = () => {
    deleteAccount(undefined);
  };

  return (
    <>
      <Card className='border-destructive'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-5 w-5' />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <Button
              variant='destructive'
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-5 w-5' />
              Delete Account?
            </DialogTitle>
            <DialogDescription className='space-y-2 pt-2'>
              Are you absolutely sure you want to delete your account? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Yes, Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
