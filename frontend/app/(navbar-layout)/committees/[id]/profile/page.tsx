import { CommitteeProfile } from '@/components/features/committees/committee-profile';
import type { Metadata } from 'next';
import { serverCommitteeApi } from '@/lib/server-api';

interface CommitteeProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CommitteeProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  const data = await serverCommitteeApi.getOne(id);

  if (!data || !data.committee) {
    return {
      title: 'Committee Profile | Ceros',
      description: 'View committee on Ceros',
    };
  }

  const committee = data.committee;

  const committeeName = committee.name || 'Committee';
  const committeeDescription = committee.description || `View ${committeeName} on Ceros`;
  const committeeImage = committee.picture || '/default-committee.png';

  return {
    title: `${committeeName} | Ceros`,
    description: committeeDescription,
    openGraph: {
      title: committeeName,
      description: `View ${committeeName} on Ceros`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/committees/${id}/profile`,
      siteName: 'Ceros',
      images: [
        {
          url: committeeImage,
          width: 400,
          height: 400,
          alt: `${committeeName} picture`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: committeeName,
      description: `View ${committeeName} on Ceros`,
      images: [committeeImage],
    },
  };
}

export default async function CommitteeProfilePage({
  params,
}: CommitteeProfilePageProps) {
  const { id } = await params;
  return <CommitteeProfile committeeId={id} />;
}
