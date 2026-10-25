import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role ?? 'user';
        (session.user as any).phone = token.phone as string;
        (session.user as any).memberId = token.memberId as string;
        (session.user as any).isImpersonated = !!token.isImpersonated;
        (session.user as any).impersonatorAdminId = token.impersonatorAdminId as string | undefined;
        if (token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'user';
        token.memberId = (user as any).memberId;
        token.image = user.image || token.picture;
        if ((user as any).isImpersonated !== undefined) {
          token.isImpersonated = (user as any).isImpersonated;
          token.impersonatorAdminId = (user as any).impersonatorAdminId;
        }
      }

      if (trigger === 'update') {
        if (session?.name !== undefined) token.name = session.name;
        if (session?.image !== undefined) token.image = session.image;
      }
      
      if (token.email === 'imranshuvo101@gmail.com' && !token.isImpersonated) {
        token.role = 'super_admin';
      }
      
      return token;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
} satisfies NextAuthConfig;
