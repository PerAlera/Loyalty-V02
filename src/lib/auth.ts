import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Giriş Yap",
      credentials: {
        phone: { label: "Telefon Numaranız", type: "text", placeholder: "5551234567" },
        password: { label: "Şifreniz", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Lütfen telefon numarası ve şifrenizi girin.");
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Hatalı şifre.");
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.surname = user.surname;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          name: token.name as string,
          surname: token.surname as string,
          phone: token.phone as string,
        };
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
