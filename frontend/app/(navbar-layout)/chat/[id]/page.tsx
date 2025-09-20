import { DMChatWrapper } from '@/components/features/chat/dm-chat-wrapper';

interface DMChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function DMChatPage({ params }: DMChatPageProps) {
  const { id } = await params;
  return <DMChatWrapper recipientId={id} />;
}
