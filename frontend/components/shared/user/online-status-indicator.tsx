'use client';

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function OnlineStatusIndicator({
  isOnline,
  size = 'sm',
  showText = false,
}: OnlineStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className='flex items-center gap-1.5'>
      <div
        className={`${sizeClasses[size]} rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {showText && (
        <span className='text-xs text-muted-foreground'>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}