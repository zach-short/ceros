'use client';

import { Button } from '@/components/ui/button';

export function CommitteeActions() {
  return (
    <div className="p-4 border-t">
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          Invite Members
        </Button>
        <Button variant="outline" className="w-full justify-start">
          Committee Settings
        </Button>
      </div>
    </div>
  );
}