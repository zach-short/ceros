import { PublicProfile } from '@/components/features/profile/public-profile';

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = await params;
  return <PublicProfile userId={id} />;
}
