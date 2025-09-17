'use client';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NotificationItem } from './notification-item';

interface CommitteeSectionProps {
  committees: Array<{
    committee: string;
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      created_at?: string;
      timestamp?: string;
      read: boolean;
      icon?: React.ComponentType<{ size?: number; className?: string }>;
      urgency: 'low' | 'medium' | 'high';
      href?: string;
    }>;
  }>;
  isMainCollapsed: boolean;
  committeeCollapsed: Record<string, boolean>;
  onToggleMainCollapse: () => void;
  onToggleCommitteeCollapse: (committee: string) => void;
}

export function CommitteeSection({
  committees,
  isMainCollapsed,
  committeeCollapsed,
  onToggleMainCollapse,
  onToggleCommitteeCollapse,
}: CommitteeSectionProps) {
  const totalUnreadCount = committees
    .flatMap(c => c.notifications)
    .filter(n => !n.read).length;

  const filteredCommittees = committees.filter(c => c.notifications.length > 0);

  if (filteredCommittees.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <button
        onClick={onToggleMainCollapse}
        className='flex items-center gap-2 text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors'
      >
        {isMainCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        Committee Notifications
        <span className='text-sm text-muted-foreground'>
          ({totalUnreadCount} unread)
        </span>
      </button>
      {!isMainCollapsed && (
        <div className='ml-6 space-y-4'>
          {filteredCommittees.map((committee) => {
            const committeeUnreadCount = committee.notifications.filter(n => !n.read).length;

            if (committee.notifications.length === 0) {
              return null;
            }

            return (
              <div key={committee.committee} className='space-y-2'>
                <button
                  onClick={() => onToggleCommitteeCollapse(committee.committee)}
                  className='flex items-center gap-2 text-md font-medium text-muted-foreground hover:text-foreground transition-colors border-b pb-1 w-full text-left'
                >
                  {committeeCollapsed[committee.committee] ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {committee.committee}
                  <span className='text-sm text-muted-foreground'>
                    ({committeeUnreadCount} unread)
                  </span>
                </button>
                {!committeeCollapsed[committee.committee] && (
                  <div className='space-y-2 ml-6'>
                    {committee.notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}