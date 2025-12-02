'use client';

import React from 'react';
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
import { useCreateMotionToTable } from '@/hooks/api/use-motions';
import { toast } from 'sonner';

interface MotionToTableDialogProps {
  motion: Motion;
  committeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MotionToTableDialog({
  motion,
  committeeId,
  open,
  onOpenChange,
  onSuccess,
}: MotionToTableDialogProps) {
  const { mutate: createTableMotion, loading } = useCreateMotionToTable(
    committeeId,
    motion.id,
    {
      onSuccess: () => {
        toast.success('Motion to table created. Voting will begin once seconded.');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create motion to table');
      },
    }
  );

  const handleTable = () => {
    createTableMotion();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Motion to Table</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You are about to propose a <strong>motion to table</strong> for:
            </p>
            <p className="font-semibold text-foreground">{motion.title}</p>
            <div className="mt-4 rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-sm">
              <p className="font-semibold mb-1">Roberts Rules of Order:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>This motion requires a second</li>
                <li>It is NOT debatable (no discussion)</li>
                <li>Requires a simple majority to pass</li>
                <li>If passed, the main motion will be tabled (postponed)</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleTable} disabled={loading}>
            {loading ? 'Creating...' : 'Propose Motion to Table'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
