import type { Metadata } from "next";
import SessionBootstrap from "@/app/session-bootstrap";
import Providers from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes Taking App",
  description: "Pastel notes app built with Next.js and Django REST Framework.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <SessionBootstrap>{children}</SessionBootstrap>
        </Providers>
      </body>
    </html>
  );
}
