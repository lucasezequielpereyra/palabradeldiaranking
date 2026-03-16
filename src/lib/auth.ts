import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./db";
import User from "./models/User";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        nickname: { label: "Apodo", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nickname || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ nickname: credentials.nickname });
        if (!user) return null;

        if (!user.isApproved) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.nickname,
          isAdmin: user.isAdmin,
          mustChangePassword: user.mustChangePassword,
          acceptedNewMode: user.acceptedNewMode,
        } as { id: string; name: string; isAdmin: boolean; mustChangePassword: boolean; acceptedNewMode: boolean };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.nickname = user.name ?? "";
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
        token.acceptedNewMode = (user as { acceptedNewMode?: boolean }).acceptedNewMode ?? false;
      }
      if (trigger === "update") {
        await dbConnect();
        const dbUser = await User.findById(token.id).select("mustChangePassword acceptedNewMode");
        if (dbUser) {
          token.mustChangePassword = dbUser.mustChangePassword;
          token.acceptedNewMode = dbUser.acceptedNewMode;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { nickname?: string }).nickname = token.nickname as string;
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
        (session.user as { mustChangePassword?: boolean }).mustChangePassword = token.mustChangePassword as boolean;
        (session.user as { acceptedNewMode?: boolean }).acceptedNewMode = token.acceptedNewMode as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
