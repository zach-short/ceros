import { PublicProfile } from '@/components/features/profile/public-profile';
import type { Metadata } from 'next';
import { serverUsersApi } from '@/lib/server-api';

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  const data = await serverUsersApi.getPublicProfile(id);

  if (!data || !data.user) {
    return {
      title: 'User Profile | Ceros',
      description: 'View user profile on Ceros',
    };
  }

  const user = data.user;

  const userName = user.name || user.email || 'User';
  const userPicture = user.picture || '/default-avatar.png';

  return {
    title: `${userName}'s Profile | Ceros`,
    description: `View ${userName}'s Profile on Ceros`,
    openGraph: {
      title: `${userName}'s Profile`,
      description: `View ${userName}'s Profile on Ceros`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${id}`,
      siteName: 'Ceros',
      images: [
        {
          url: userPicture,
          width: 400,
          height: 400,
          alt: `${userName}'s profile picture`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${userName}'s Profile`,
      description: `View ${userName}'s Profile on Ceros`,
      images: [userPicture],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;
  return <PublicProfile userId={id} />;
}
