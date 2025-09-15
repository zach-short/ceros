import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi } from './api';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await authApi.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!response.success) {
            console.error('Login failed:', response.error);
            return null;
          }

          const { user, token } = response.data;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            apiToken: token,
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT callback triggered:', { provider: account?.provider, user: !!user, account: !!account });

      if ((account?.provider === 'google' || account?.provider === 'github') && user) {
        try {
          console.log('Attempting social auth with:', {
            provider: account.provider,
            providerId: account.providerAccountId,
            email: user.email,
            name: user.name
          });

          const response = await authApi.socialAuth({
            provider: account.provider,
            providerId: account.providerAccountId!,
            email: user.email!,
            name: user.name || undefined,
            image: user.image || undefined,
          });

          console.log('Social auth response:', response);

          if (response.success) {
            const { user: userData, token: apiToken } = response.data;
            token.apiToken = apiToken;
            token.userId = userData.id;
            console.log('Social auth successful, token set');
          } else {
            console.error('Social auth failed:', response.error);
          }
        } catch (error) {
          console.error('Social auth error:', error);
        }
      }

      if (user?.apiToken) {
        token.apiToken = user.apiToken;
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.apiToken) {
        session.apiToken = token.apiToken as string;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 3 * 30 * 24 * 60 * 60, // 90 days
  },
  jwt: {
    maxAge: 3 * 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
});
