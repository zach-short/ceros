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
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
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
    async signIn({ account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        return true;
      }

      if (account?.provider === 'credentials') {
        return true;
      }

      return false;
    },

    async jwt({ token, user, account }) {
      if (
        (account?.provider === 'google' || account?.provider === 'github') &&
        user
      ) {
        try {
          const response = await authApi.socialAuth({
            provider: account.provider,
            providerId: account.providerAccountId!,
            email: user.email!,
            name: user.name || undefined,
            image: user.image || undefined,
          });

          if (response.success) {
            const { user: userData, token: apiToken } = response.data;
            token.apiToken = apiToken;
            token.userId = userData.id;
          } else {
            console.error('❌ Social auth failed:', response.error);
          }
        } catch (error) {
          console.error('💥 Social auth error:', error);
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
    maxAge: 24 * 60 * 60, // 24 hours (matches backend JWT expiration)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours (matches backend JWT expiration)
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
});
