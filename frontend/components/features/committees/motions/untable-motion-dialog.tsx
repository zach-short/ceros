'use client';

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
import { Motion } from '@/models/motion';
import { useUntableMotion } from '@/hooks/api/use-motions';
import { toast } from 'sonner';

interface UntableMotionDialogProps {
  motion: Motion;
  committeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UntableMotionDialog({
  motion,
  committeeId,
  open,
  onOpenChange,
  onSuccess,
}: UntableMotionDialogProps) {
  const { mutate: untableMotion, loading } = useUntableMotion(
    committeeId,
    motion.id,
    {
      onSuccess: () => {
        toast.success('Motion taken from table');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to untable motion');
      },
    }
  );

  const handleUntable = () => {
    untableMotion();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Take Motion from Table</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to take &quot;{motion.title}&quot; from the table?
            This will restore the motion to its previous state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUntable} disabled={loading}>
            {loading ? 'Taking from table...' : 'Take from Table'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
