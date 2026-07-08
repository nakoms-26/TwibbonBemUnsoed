import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "./prisma";

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

        const admin = await prisma.admin.findUnique({
          where: {
            username: credentials.username
          }
        });

        if (!admin) {
          throw new Error("Admin not found");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: admin.id.toString(),
          name: admin.name,
          username: admin.username,
        };
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
