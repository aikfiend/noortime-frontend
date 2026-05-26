import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';

async function findOrCreateUser(profile: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}): Promise<{ id: number }> {
  const existing = await db.queryOne<{ id: number }>(
    'SELECT id FROM users WHERE google_id = ?',
    [profile.googleId],
  );
  if (existing) return existing;

  const result = await db.execute(
    'INSERT INTO users (google_id, email, name, avatar_url) VALUES (?, ?, ?, ?)',
    [profile.googleId, profile.email, profile.name, profile.avatarUrl],
  );
  // Seed default preferences row (idempotent)
  await db.execute('INSERT IGNORE INTO user_preferences (user_id) VALUES (?)', [result.insertId]);
  return { id: result.insertId };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: 'jwt' },

  // Custom pages
  pages: { error: '/auth/error' },

  callbacks: {
    // Restrict sign-in to a single email domain if ALLOWED_EMAIL_DOMAIN is set
    async signIn({ profile }) {
      const domain = process.env.ALLOWED_EMAIL_DOMAIN;
      if (domain && profile?.email && !profile.email.endsWith(`@${domain}`)) {
        // Returning a URL redirects directly — AuthError.tsx reads ?reason=
        return `/auth/error?reason=domain_not_allowed`;
      }
      return true;
    },

    // On first sign-in (account is present): sync user to DB and store the DB id in the JWT.
    // On subsequent requests: token already has userId — just pass it through.
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await findOrCreateUser({
          googleId: account.providerAccountId,
          email: profile.email!,
          name: profile.name!,
          avatarUrl: (profile as { picture?: string }).picture ?? null,
        });
        token.userId = user.id;
      }
      return token;
    },

    // Expose the DB id on the client-visible session object
    async session({ session, token }) {
      if (token.userId !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
});
