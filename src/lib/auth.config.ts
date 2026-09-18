import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

/**
 * Shared, Prisma-free auth config so it can run in the Edge middleware
 * runtime. The Credentials provider (which needs Prisma + bcrypt) is only
 * added in `auth.ts`, which runs in the Node.js runtime.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath = PUBLIC_PATHS.some((path) =>
        request.nextUrl.pathname.startsWith(path),
      );

      if (isPublicPath) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
