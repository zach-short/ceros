import { ConversationsList } from '@/components/features/chat/conversations-list';

export default function ChatPage() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold'>Messages</h1>
          <p className='text-gray-600'>Your conversations</p>
        </div>

        <ConversationsList />
      </div>
    </div>
  );
}

