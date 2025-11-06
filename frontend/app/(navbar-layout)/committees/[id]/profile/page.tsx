import { CommitteeProfile } from '@/components/features/committees/committee-profile';

export default async function CommitteeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommitteeProfile committeeId={id} />;
}
