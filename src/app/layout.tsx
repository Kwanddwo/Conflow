import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import TRPCProvider from "@/providers/TRPCProvider";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
export const metadata: Metadata = {
  title: "Conflow",
  description: "Scientific conference management simplified.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors />
          <TRPCProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
