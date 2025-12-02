import CommitteeMotions from '@/components/features/committees/committee-motions';

export default async function CommitteeMotionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <CommitteeMotions />;
}
