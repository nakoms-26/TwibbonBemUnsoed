import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        const envUsername = process.env.ADMIN_USERNAME;
        const envPassword = process.env.ADMIN_PASSWORD;

        if (!envUsername || !envPassword) {
          throw new Error("Environment variables ADMIN_USERNAME and ADMIN_PASSWORD are not set.");
        }

        if (credentials.username === envUsername && credentials.password === envPassword) {
          return {
            id: "1",
            name: "Admin",
            username: envUsername,
          };
        }

        throw new Error("Invalid username or password");
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          (session.user as any).id = token.id;
          (session.user as any).username = token.username;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretkey123", // fallback for dev
};
