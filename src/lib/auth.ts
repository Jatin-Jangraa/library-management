import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./db";
import User from "@/models/User";
import { config } from "./config";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact admin.");
        }

        if (!user.password) {
          throw new Error("Invalid password");
        }

        const isPasswordValid = await user.comparePassword(credentials.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: config.session.maxAgeDays * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "student";
        token.phone = (user as any).phone || "";
        if (user.id) token.sub = user.id;
      }

      if (!token.role) token.role = "student";
      if (!token.phone) token.phone = "";

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as string) || "student";
        session.user.phone = (token.phone as string) || "";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },
  secret: process.env.AUTH_SECRET,
};
