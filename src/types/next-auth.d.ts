import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
      mustChangePassword: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nickname: string;
    isAdmin: boolean;
    mustChangePassword: boolean;
  }
}
