"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ForcePasswordChange() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      session?.user?.mustChangePassword &&
      pathname !== "/change-password" &&
      !pathname.startsWith("/api/")
    ) {
      router.replace("/change-password");
    }
  }, [session, pathname, router]);

  return null;
}
