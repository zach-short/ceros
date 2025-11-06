import CommitteeMembers from '@/components/features/committees/committee-members';

export default async function CommitteeMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <CommitteeMembers />;
}

