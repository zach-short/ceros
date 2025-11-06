import CommitteeChat from '@/components/features/chat/committee/committee-chat';

export default async function CommitteeChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <CommitteeChat />;
}
