import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      name: string;
      surname: string;
      role: string;
    }
  }

  interface User {
    id: string;
    phone: string;
    name: string;
    surname: string;
    role: string;
  }
}
