interface ChatHeaderProps {
  recipientName: string;
  isConnected: boolean;
  isLoading?: boolean;
}

export function ChatHeader({
  recipientName,
  isConnected,
  isLoading,
}: ChatHeaderProps) {
  return (
    <div className='p-4 border-b '>
      <h2 className='font-semibold'>{recipientName}</h2>
      <p className='text-sm text-gray-500'>
        {!isLoading && !isConnected && '🔴 Disconnected'}
      </p>
    </div>
  );
}
