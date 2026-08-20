import "next-auth";
import type { WalletTrack } from "@/lib/mytab/constants";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      walletAddress?: string;
      authType?: string;
      mytabAlias?: string;
      mytabAccountAddress?: string;
      walletTrack?: WalletTrack;
      phoneVerified?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    firstName?: string;
    lastName?: string;
    walletAddress?: string;
    authType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    walletAddress?: string;
    authType?: string;
    accessToken?: string;
    mytabAlias?: string;
    mytabAccountAddress?: string;
    walletTrack?: string;
    phoneVerified?: boolean;
  }
}
