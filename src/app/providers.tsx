"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
